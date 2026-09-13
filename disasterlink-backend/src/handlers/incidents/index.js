import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { LocationClient, SearchPlaceIndexForTextCommand } from "@aws-sdk/client-location";

const ddbClient = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({});
const snsClient = new SNSClient({});
const locationClient = new LocationClient({});

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization"
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: HEADERS, body: "" };

  const path = event.path;
  const method = event.httpMethod;
  const TABLE_NAME = process.env.TABLE_NAME;

  try {
    // 1. GET /incidents/updates (MUST check this sub-path before base /incidents)
    if (path === "/incidents/updates" && method === "GET") {
      const res = await db.send(new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "begins_with(PK, :prefix)",
        ExpressionAttributeValues: { ":prefix": "UPDATE#" }
      }));
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(res.Items || []) };
    }

    // 2. POST /incidents/updates
    if (path === "/incidents/updates" && method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const updateId = `update-${Date.now()}`;
      const item = {
        PK: `UPDATE#${updateId}`,
        SK: "METADATA",
        id: updateId,
        ...body,
        timestamp: new Date().toISOString()
      };
      await db.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
      return { statusCode: 201, headers: HEADERS, body: JSON.stringify(item) };
    }

    // 3. PUT /incidents/updates/{id}
    if (path.startsWith("/incidents/updates/") && method === "PUT") {
      const id = path.split("/").pop();
      const body = JSON.parse(event.body || "{}");
      await db.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `UPDATE#${id}`, SK: "METADATA" },
        UpdateExpression: "set description = :d, #status = :s",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":d": body.description, ":s": body.status }
      }));
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ id, ...body }) };
    }

    // 4. DELETE /incidents/updates/{id}
    if (path.startsWith("/incidents/updates/") && method === "DELETE") {
      const id = path.split("/").pop();
      await db.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: `UPDATE#${id}`, SK: "METADATA" } }));
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: true }) };
    }

    // 5. POST /incidents/upload-url (S3 Image Hook)
    if (path === "/incidents/upload-url" && method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const bucketName = process.env.IMAGE_BUCKET_NAME;
      const fileKey = `evidence-${Date.now()}-${body.filename}`;
      
      const command = new PutObjectCommand({ Bucket: bucketName, Key: fileKey, ContentType: body.contentType });
      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
      const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}://{fileKey}`;

      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ uploadUrl, fileUrl }) };
    }

    // 6. GET /incidents
    if (path === "/incidents" && method === "GET") {
      const res = await db.send(new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "begins_with(PK, :prefix)",
        ExpressionAttributeValues: { ":prefix": "INCIDENT#" }
      }));
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(res.Items || []) };
    }

    // 7. POST /incidents (With mathematical Smart Priority Scoring Engine & SNS integration)
    if (path === "/incidents" && method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const incidentId = `inc-${Date.now()}`;

      // Smart Mathematical Priority Scoring Logic
      let score = 10;
      if (body.severity === "Critical") score += 40;
      if (body.severity === "High") score += 25;
      if (parseFloat(body.waterLevel || 0) > 3) score += 35;
      if (parseInt(body.peopleAffected || 0) > 50) score += 10;

      let priorityLevel = "Low";
      if (score >= 80) priorityLevel = "Critical";
      else if (score >= 60) priorityLevel = "High";
      else if (score >= 40) priorityLevel = "Moderate";

      // Geocoding fallback with Amazon Location Service
      let lat = body.lat || 27.7172;
      let lng = body.lng || 85.324;
      if (body.location && (!body.lat || !body.lng)) {
        try {
          const geoRes = await locationClient.send(new SearchPlaceIndexForTextCommand({
            IndexName: process.env.PLACE_INDEX_NAME,
            Text: `${body.location}, Kathmandu`,
            MaxResults: 1
          }));
          if (geoRes.Results && geoRes.Results.length > 0) {
            const coords = geoRes.Results[0].Place.Geometry.Point;
            lng = coords[0];
            lat = coords[1];
          }
        } catch (_) {}
      }

      const item = {
        PK: `INCIDENT#${incidentId}`,
        SK: "METADATA",
        GSI1PK: "INCIDENTS",
        GSI1SK: `${priorityLevel}#${Date.now()}`,
        id: incidentId,
        title: body.title || "Untitled Report",
        location: body.location || "Unknown location",
        severity: body.severity || "Moderate",
        peopleAffected: body.peopleAffected || 0,
        waterLevel: body.waterLevel || 0,
        description: body.description || "",
        imageUrl: body.imageUrl || null,
        status: "Pending",
        priorityScore: score,
        priorityLevel: priorityLevel,
        createdAt: new Date().toISOString(),
        reportedBy: body.reportedBy || { id: "resident-1", name: "Resident" },
        lat,
        lng,
        incidentType: body.incidentType || "Urban Flooding"
      };

      await db.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

      // SNS Automated Emergency Alerts Broadcast Trigger
      if (priorityLevel === "Critical") {
        try {
          await snsClient.send(new PublishCommand({
            TopicArn: process.env.SNS_TOPIC_ARN,
            Subject: `CRITICAL ALERT: ${item.title}`,
            Message: `Emergency incident reported at ${item.location}. Severity: Critical. Risk Level Score: ${score}/100. Responders deploy immediately.`
          }));
        } catch (_) {}
      }

      return { statusCode: 201, headers: HEADERS, body: JSON.stringify(item) };
    }

    // 8. PUT /incidents/{id}
    if (path.startsWith("/incidents/") && method === "PUT") {
      const id = path.split("/").pop();
      const body = JSON.parse(event.body || "{}");
      await db.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `INCIDENT#${id}`, SK: "METADATA" },
        UpdateExpression: "set #status = :s, description = :d",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":s": body.status, ":d": body.description }
      }));
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ id, ...body }) };
    }

    // 9. DELETE /incidents/{id}
    if (path.startsWith("/incidents/") && method === "DELETE") {
      const id = path.split("/").pop();
      await db.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: `INCIDENT#${id}`, SK: "METADATA" } }));
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 404, headers: HEADERS, body: JSON.stringify({ message: "Incident route not found" }) };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ message: err.message }) };
  }
};
