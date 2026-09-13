import { apiClient } from "./apiClient";

export const authService = {
  /**
   * Register a new user.
   * Calls the AuthFunction Lambda, which:
   *  1. Creates the user in Cognito (SignUp + AdminConfirmSignUp)
   *  2. Stores profile data in DynamoDB
   */
  async registerUser(userData) {
    const email = (userData.email || "").trim().toLowerCase();
    const role = userData.accountType || "resident";

    return apiClient.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password: userData.password,
        fullName: userData.fullName || "New User",
        phone: userData.phone || "",
        district: userData.district || "",
        accountType: role,
        role,
        skills: userData.skills || [],
        availability: userData.availability || "available",
      }),
    });
  },

  /**
   * Log in an existing user.
   * Calls the AuthFunction Lambda, which calls Cognito
   * and returns the ID token + refresh token.
   */
  async loginUser(email, password) {
    const data = await apiClient.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    });

    // AuthFunction returns: { token, refreshToken, user: { email, role } }
    const idToken = data.token;

    // Decode the JWT payload to get sub, email, name, custom:role
    const base64Payload = idToken.split(".")[1];
    // Pad base64 string to a multiple of 4 (JWT uses unpadded base64url)
    const padded = base64Payload + "=".repeat((4 - (base64Payload.length % 4)) % 4);
    const decodedPayload = JSON.parse(
      atob(padded.replace(/-/g, "+").replace(/_/g, "/"))
    );

    // Persist token so apiClient sends it on subsequent requests
    localStorage.setItem("userToken", idToken);

    return {
      token: idToken,
      refreshToken: data.refreshToken,
      user: {
        id: decodedPayload.sub,
        email: decodedPayload.email,
        role: decodedPayload["custom:role"] || "resident",
        fullName: decodedPayload.name || "User",
      },
    };
  },
};