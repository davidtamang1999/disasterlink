// src/handlers/volunteers/index.js (Paste directly into VolunteersFunction)
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(ddbClient);

const HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization"
};

export const handler = async (event) => {
  // Directly resolves any browser preflight prechecks with valid security origin headers
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: HEADERS, body: "" };

  const path = event.path;
  const method = event.httpMethod;
  const TABLE_NAME = process.env.TABLE_NAME;

  try {
    // Normalizes paths for both API gateway resource trees (/volunteers and /users)
    if ((path === "/volunteers" || path === "/users") && method === "GET") {
      const res = await db.send(new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "begins_with(PK, :prefix)",
        ExpressionAttributeValues: { ":prefix": "USER#" }
      }));
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(res.Items || []) };
    }

    if ((path === "/volunteers" || path === "/users") && method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const userId = body.id || `usr-${Date.now()}`;
      const item = {
        PK: `USER#${userId}`,
        SK: "PROFILE",
        ...body,
        id: userId
      };
      await db.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
      return { statusCode: 201, headers: HEADERS, body: JSON.stringify(item) };
    }

    if ((path.startsWith("/volunteers/") || path.startsWith("/users/")) && method === "PUT") {
      const id = path.split("/").pop();
      const body = JSON.parse(event.body || "{}");
      
      await db.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${id}`, SK: "PROFILE" },
        UpdateExpression: "set #status = :s, availability = :a, team = :t",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":s": body.status, ":a": body.availability, ":t": body.team }
      }));
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ id, ...body }) };
    }

    if ((path.startsWith("/volunteers/") || path.startsWith("/users/")) && method === "DELETE") {
      const id = path.split("/").pop();
      await db.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: `USER#${id}`, SK: "PROFILE" } }));
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 404, headers: HEADERS, body: JSON.stringify({ message: "User route not found" }) };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ message: err.message }) };
  }
};
