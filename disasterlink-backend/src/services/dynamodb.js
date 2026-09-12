import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-south-1',
});

// Document client for easier object mapping
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || 'DisasterLink';

// Create/put item
export const putItem = async (item) => {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item,
  });
  return docClient.send(command);
};

// Get single item by PK and SK
export const getItem = async (pk, sk) => {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
  });
  const response = await docClient.send(command);
  return response.Item;
};

// Query items by PK
export const queryItems = async (pk, skCondition = null, skValue = null) => {
  let commandParams = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: { ':pk': pk },
  };

  if (skCondition && skValue) {
    commandParams.KeyConditionExpression += ` AND SK ${skCondition} :sk`;
    commandParams.ExpressionAttributeValues[':sk'] = skValue;
  }

  const command = new QueryCommand(commandParams);
  const response = await docClient.send(command);
  return response.Items || [];
};

// Query using GSI
export const queryByIndex = async (indexName, keyCondition, expressionValues) => {
  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: indexName,
    KeyConditionExpression: keyCondition,
    ExpressionAttributeValues: expressionValues,
  });
  const response = await docClient.send(command);
  return response.Items || [];
};

// Scan table (use sparingly, for admin dashboard stats)
export const scanItems = async (filterExpression = null, expressionValues = null) => {
  const params = { TableName: TABLE_NAME };
  if (filterExpression) {
    params.FilterExpression = filterExpression;
    params.ExpressionAttributeValues = expressionValues;
  }
  const command = new ScanCommand(params);
  const response = await docClient.send(command);
  return response.Items || [];
};

// Update item
export const updateItem = async (pk, sk, updateExpression, expressionValues, expressionNames = {}) => {
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionValues,
    ExpressionAttributeNames: expressionNames,
    ReturnValues: 'ALL_NEW',
  });
  const response = await docClient.send(command);
  return response.Attributes;
};

// Delete item
export const deleteItem = async (pk, sk) => {
  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
  });
  return docClient.send(command);
};

export { TABLE_NAME };