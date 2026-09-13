// src/handlers/volunteers/index.js
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

const USER_UPDATABLE_FIELDS = [
  "fullName",
  "phone",
  "district",
  "location",
  "role",
  "status",
  "availability",
  "team",
  "skills",
  "verification",
  "lat",
  "lng"
];

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: HEADERS, body: "" };

  const path = event.path;
  const method = event.httpMethod;
  const TABLE_NAME = process.env.TABLE_NAME;

  try {
    // GET /volunteers or /users — list users (METADATA rows only)
    if ((path === "/volunteers" || path === "/users") && method === "GET") {
      const res = await db.send(new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "begins_with(PK, :prefix) AND SK = :sk",
        ExpressionAttributeValues: {
          ":prefix": "USER#",
          ":sk": "METADATA"
        }
      }));
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(res.Items || []) };
    }

    // POST /volunteers or /users — create
    if ((path === "/volunteers" || path === "/users") && method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const userId = body.id || `usr-${Date.now()}`;
      const item = {
        PK: `USER#${userId}`,
        SK: "METADATA",
        ...body,
        id: userId
      };
      await db.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
      return { statusCode: 201, headers: HEADERS, body: JSON.stringify(item) };
    }

    // PUT /volunteers/{id} or /users/{id} — dynamic update, returns full item
    if ((path.startsWith("/volunteers/") || path.startsWith("/users/")) && method === "PUT") {
      const id = path.split("/").pop();
      const body = JSON.parse(event.body || "{}");

      const updates = [];
      const names = {};
      const values = {};

      USER_UPDATABLE_FIELDS.forEach((field, i) => {
        if (body[field] !== undefined) {
          updates.push(`#f${i} = :v${i}`);
          names[`#f${i}`] = field;
          values[`:v${i}`] = body[field];
        }
      });

      if (updates.length === 0) {
        return {
          statusCode: 400,
          headers: HEADERS,
          body: JSON.stringify({ message: "No valid fields to update" })
        };
      }

      const result = await db.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: `USER#${id}`, SK: "METADATA" },
        UpdateExpression: `set ${updates.join(", ")}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ReturnValues: "ALL_NEW"
      }));

      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify(result.Attributes)
      };
    }

    // DELETE /volunteers/{id} or /users/{id}
    if ((path.startsWith("/volunteers/") || path.startsWith("/users/")) && method === "DELETE") {
      const id = path.split("/").pop();
      await db.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: `USER#${id}`, SK: "METADATA" } }));
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 404, headers: HEADERS, body: JSON.stringify({ message: "User route not found" }) };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ message: err.message }) };
  }
};