const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
];

function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Force consent to get refresh token
  });
}

async function getTokenFromCode(code) {
  return await oauth2Client.getToken(code);
}

function setCredentials(tokens) {
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

/**
 * Refresh access token if it's expired or about to expire
 * @param {Object} tokens - Current tokens object
 * @returns {Object|null} New tokens if refreshed, null if not needed
 */
async function refreshTokenIfNeeded(tokens) {
  if (!tokens || !tokens.refresh_token) {
    throw new Error("No refresh token available");
  }

  // Check if token is expired or will expire in next 5 minutes
  const expiryDate = tokens.expiry_date || 0;
  const now = Date.now();
  const bufferTime = 5 * 60 * 1000; // 5 minutes

  if (expiryDate > now + bufferTime) {
    // Token is still valid
    return null;
  }

  console.log("🔄 Refreshing expired access token...");

  try {
    oauth2Client.setCredentials(tokens);
    const { credentials } = await oauth2Client.refreshAccessToken();

    console.log("✅ Token refreshed successfully");

    // Return new tokens (keeping the refresh token)
    return {
      ...tokens,
      access_token: credentials.access_token,
      expiry_date: credentials.expiry_date,
    };
  } catch (error) {
    console.error("❌ Token refresh failed:", error);
    throw error;
  }
}

module.exports = {
  oauth2Client,
  getAuthUrl,
  getTokenFromCode,
  setCredentials,
  refreshTokenIfNeeded,
  SCOPES,
};
