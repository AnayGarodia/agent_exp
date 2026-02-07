const { google } = require("googleapis");

// CRITICAL: Create a new OAuth2 client for each request to avoid race conditions
// The shared global client was causing credentials to be overwritten between concurrent requests
function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
}

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/userinfo.email", // Get user email
];

function getAuthUrl() {
  const client = createOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Force consent to get refresh token
  });
}

async function getTokenFromCode(code) {
  const client = createOAuth2Client();
  return await client.getToken(code);
}

function setCredentials(tokens) {
  // Create a NEW client instance for each request to prevent race conditions
  const client = createOAuth2Client();
  client.setCredentials(tokens);
  return client;
}

/**
 * Refresh access token if it's expired or about to expire
 * @param {Object} tokens - Current tokens object
 * @returns {Object|null} New tokens if refreshed, null if not needed
 */
async function refreshTokenIfNeeded(tokens) {
  if (!tokens || !tokens.refresh_token) {
    console.error("❌ No refresh token available in tokens:", {
      hasTokens: !!tokens,
      hasRefreshToken: !!tokens?.refresh_token,
      tokenKeys: tokens ? Object.keys(tokens) : [],
    });
    throw new Error("No refresh token available. Please reconnect Gmail.");
  }

  // Check if token is expired or will expire in next 5 minutes
  const expiryDate = tokens.expiry_date || 0;
  const now = Date.now();
  const bufferTime = 5 * 60 * 1000; // 5 minutes

  if (expiryDate > now + bufferTime) {
    // Token is still valid
    console.log(
      `✅ Token still valid (expires in ${Math.round((expiryDate - now) / 1000 / 60)} minutes)`
    );
    return null;
  }

  console.log("🔄 Refreshing expired access token...");

  try {
    // Create a new client for refresh to avoid race conditions
    const client = createOAuth2Client();
    client.setCredentials(tokens);
    const { credentials } = await client.refreshAccessToken();

    console.log("✅ Token refreshed successfully");
    console.log("🔑 New expiry:", new Date(credentials.expiry_date).toISOString());

    // Return new tokens (keeping the refresh token)
    return {
      ...tokens,
      access_token: credentials.access_token,
      expiry_date: credentials.expiry_date,
      // Preserve refresh_token if not included in new credentials
      refresh_token: credentials.refresh_token || tokens.refresh_token,
    };
  } catch (error) {
    console.error("❌ Token refresh failed:", error.message);
    console.error("❌ Error details:", {
      code: error.code,
      status: error.status,
      message: error.message,
    });
    throw new Error(
      `Failed to refresh Gmail token: ${error.message}. Please reconnect Gmail.`
    );
  }
}

module.exports = {
  createOAuth2Client, // Export factory function instead of singleton
  getAuthUrl,
  getTokenFromCode,
  setCredentials,
  refreshTokenIfNeeded,
  SCOPES,
};
