import { CognitoIdentityProviderClient, SignUpCommand, InitiateAuthCommand, AdminConfirmSignUpCommand, AdminUpdateUserAttributesCommand } from "@aws-sdk/client-cognito-identity-provider";
import { putItem } from "../../services/dynamodb.js";

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION || "ap-south-1" });

const USER_POOL_ID = process.env.USER_POOL_ID;
const CLIENT_ID = process.env.CLIENT_ID;

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
  const { httpMethod, path } = event;

  try {
    if (httpMethod === 'OPTIONS') {
      return response(200, { message: "Preflight OK" });
    }

    // 🚀 WORKFLOW 1: POST /auth/register
    if (httpMethod === 'POST' && path === '/auth/register') {
      const data = JSON.parse(event.body || "{}");
      const userId = `usr-${Date.now()}`;

      // Enforce the explicit custom attribute prefixes that AWS Cognito expects
      const signUpParams = {
        ClientId: CLIENT_ID,
        Username: data.email,
        Password: data.password,
        UserAttributes: [
          { Name: "custom:role", Value: data.role || "resident" },
          { Name: "custom:skills", Value: data.skills || "None" }
        ]
      };

      // 1. Provision security credentials inside Cognito User Pools
      await cognitoClient.send(new SignUpCommand(signUpParams));

      // 2. Auto-confirm the test account instantly to bypass email validation steps
      await cognitoClient.send(new AdminConfirmSignUpCommand({
        UserPoolId: USER_POOL_ID,
        Username: data.email
      }));

      // 3. Mirror the user profile node into the DynamoDB Single-Table Design schema layout
      const dbItem = {
        PK: `USER#${userId}`,
        SK: "METADATA",
        GSI1PK: `ROLE#${data.role || "resident"}`,
        GSI1SK: `USER#${userId}`,
        id: userId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || "N/A",
        district: data.district,
        role: data.role || "resident",
        skills: data.skills || "None",
        createdAt: new Date().toISOString()
      };

      await putItem(dbItem);
      return response(201, { message: "Account created successfully", userId });
    }

    // 🚀 WORKFLOW 2: POST /auth/login
    if (httpMethod === 'POST' && path === '/auth/login') {
      const data = JSON.parse(event.body || "{}");

      const authParams = {
        AuthFlow: "ALLOW_USER_PASSWORD_AUTH",
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: data.email,
          PASSWORD: data.password
        }
      };

      const authResult = await cognitoClient.send(new InitiateAuthCommand(authParams));
      
      return response(200, {
        token: authResult.AuthenticationResult.IdToken,
        message: "Authentication successful"
      });
    }

    return response(400, { message: "Invalid identity path option requested" });
  } catch (error) {
    console.error("Auth Engine Crash Trace:", error);
    return response(400, { message: error.message || "Authentication layer exception", error: error.name });
  }
};
