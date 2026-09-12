import { CognitoIdentityProviderClient, SignUpCommand, InitiateAuthCommand, AdminConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
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

    // 1. POST /auth/register (User Registration Workflow)
    if (httpMethod === 'POST' && path === '/auth/register') {
      const data = JSON.parse(event.body);

      // Sign up inside the Cognito User Pool database safely
      const signUpParams = {
        ClientId: CLIENT_ID,
        Username: data.email,
        Password: data.password,
        UserAttributes: [
          { Name: "name", Value: data.fullName },
          { Name: "custom:role", Value: data.accountType || "resident" },
          { Name: "custom:district", Value: data.district || "" },
          { Name: "custom:availability", Value: data.availability || "available" },
          { Name: "custom:skills", Value: Array.isArray(data.skills) ? data.skills.join(",") : "" }
        ]
      };

      const signUpResponse = await cognitoClient.send(new SignUpCommand(signUpParams));
      const userId = signUpResponse.UserSub; // Secure Cognito-generated UUID string

      // For sandbox development ease: Auto-confirm user so they don't have to verify an email
      await cognitoClient.send(new AdminConfirmSignUpCommand({
        UserPoolId: USER_POOL_ID,
        Username: data.email
      }));

      // Mirror the user account metadata profile straight into Single-Table DynamoDB schema layout
      const dbItem = {
        PK: `USER#${userId}`,
        SK: "METADATA",
        GSI1PK: `ROLE#${data.accountType || "resident"}`,
        GSI1SK: `USER#${userId}`,
        id: userId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        district: data.district,
        role: data.accountType || "resident",
        availability: data.availability || "available",
        skills: data.skills || [],
        createdAt: new Date().toISOString()
      };

      await putItem(dbItem);
      return response(201, { message: "User registered and verified successfully", user: dbItem });
    }

    // 2. POST /auth/login (User Verification & JWT Token Issuance Workflow)
    if (httpMethod === 'POST' && path === '/auth/login') {
      const { email, password } = JSON.parse(event.body);

      const authParams = {
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      };

      // Authenticate password challenge safely in the cloud
      const authResponse = await cognitoClient.send(new InitiateAuthCommand(authParams));
      const tokenData = authResponse.AuthenticationResult;

      // Decode or pull the data attributes from the response to match your frontend structures
      return response(200, {
        message: "Login successful",
        token: tokenData.IdToken,
        refreshToken: tokenData.RefreshToken,
        user: {
          email: email,
          // Frontend reads this object layout inside handleSubmit to route paths correctly
          role: email.includes("admin") ? "admin" : (email.includes("volunteer") ? "volunteer" : "resident")
        }
      });
    }

    return response(400, { message: "Auth route configuration error options requested" });
  } catch (error) {
    console.error(error);
    return response(400, { message: "Authentication failed", error: error.message });
  }
};
