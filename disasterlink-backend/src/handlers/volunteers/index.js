import { queryByIndex, updateItem } from '../../services/dynamodb.js';

const response = (statusCode, body) => ({
  statusCode,
  headers: { 
    "Content-Type": "application/json", 
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  },
  body: JSON.stringify(body)
});

export const handler = async (event) => {
  const { httpMethod, path, pathParameters } = event;
  const volunteerId = pathParameters?.id;

  try {
    if (httpMethod === 'OPTIONS') {
      return response(200, { message: "Preflight OK" });
    }

    // 1. GET /volunteers (List All Volunteers inside DynamoDB Single-Table)
    if (httpMethod === 'GET' && path === '/volunteers') {
      const items = await queryByIndex('GSI1', 'GSI1PK = :pk', { ':pk': 'ROLE#volunteer' });
      return response(200, items);
    }

    // 2. PUT /volunteers/{id}/status (Update Volunteer Availability/Skills)
    if (httpMethod === 'PUT' && volunteerId && path.includes('/status')) {
      const data = JSON.parse(event.body);
      
      const updateExp = "SET availability = :av";
      const expValues = { ":av": data.availability || "available" };

      const updated = await updateItem(`USER#${volunteerId}`, 'METADATA', updateExp, expValues);
      return response(200, { message: "Volunteer profile status updated successfully", updated });
    }

    return response(400, { message: "Invalid volunteers route option requested" });
  } catch (error) {
    console.error(error);
    return response(500, { message: "Internal server error", error: error.message });
  }
};
