const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const {
  createOAuth2Client,
  getAuthUrl,
  getTokenFromCode,
  refreshTokenIfNeeded,
} = require("../config/gmail-config");

/**
 * GET /api/auth/google/url
 * Redirect to Google OAuth consent screen
 */
router.get("/google/url", (req, res) => {
  console.log("🔐 [auth] Generating Google OAuth URL");

  const authUrl = getAuthUrl();

  console.log("🔐 [auth] Redirecting to:", authUrl);
  res.redirect(authUrl);
});

/**
 * GET /api/auth/google/callback
 * Handle OAuth callback from Google
 */
router.get("/google/callback", async (req, res) => {
  const { code } = req.query;

  console.log("✅ [auth/callback] Received OAuth code");

  if (!code) {
    console.error("❌ [auth/callback] No code in query params");
    return res.status(400).send("No authorization code received");
  }

  try {
    // Exchange code for tokens
    const { tokens } = await getTokenFromCode(code);
    console.log("✅ [auth/callback] Received tokens");
    console.log(
      "🔑 [auth/callback] Has refresh token:",
      !!tokens.refresh_token
    );
    console.log("🔑 [auth/callback] Token expiry:", new Date(tokens.expiry_date).toISOString());

    // Get user email using a dedicated OAuth2 client instance
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;

    console.log("📧 [auth/callback] User email:", email);

    // Store tokens in session - CRITICAL: Use googleTokens key to match workflows.js
    req.session.googleTokens = tokens;
    req.session.email = email;
    req.session.authenticated = true;

    console.log("💾 [auth/callback] Storing in session:", {
      sessionId: req.session.id,
      email: email,
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresAt: new Date(tokens.expiry_date).toISOString(),
    });

    // Save session before responding
    req.session.save((err) => {
      if (err) {
        console.error("❌ [auth/callback] Session save error:", err);
      } else {
        console.log("✅ [auth/callback] Session saved successfully");
        console.log("🔑 [auth/callback] Session ID:", req.session.id);
      }

      const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Successful</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              .container {
                text-align: center;
                padding: 2rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 1rem;
                backdrop-filter: blur(10px);
              }
              h1 { margin: 0 0 1rem 0; font-size: 2rem; }
              p { margin: 0; opacity: 0.9; font-size: 1.1rem; }
              .email { 
                margin-top: 0.5rem; 
                font-size: 0.9rem; 
                opacity: 0.8; 
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✅ Gmail Connected!</h1>
              <p>Successfully authenticated</p>
              <p class="email">${email}</p>
              <p style="margin-top: 1.5rem; font-size: 0.9rem;">Redirecting back...</p>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'gmail-auth-success' }, '*');
                setTimeout(function() { window.close(); }, 1500);
              } else {
                window.location.href = ${JSON.stringify(clientUrl)};
              }
            </script>
          </body>
        </html>
      `);
    });
  } catch (error) {
    console.error("❌ [auth/callback] Error:", error);
    console.error("❌ [auth/callback] Error details:", {
      message: error.message,
      code: error.code,
      status: error.status,
      stack: error.stack,
    });

    // Determine user-friendly error message
    let userMessage = error.message;
    let technicalDetails = "";

    if (error.message?.includes("invalid_grant")) {
      userMessage = "The authorization code has expired or been used already.";
      technicalDetails = "Please close this window and try connecting Gmail again.";
    } else if (error.message?.includes("redirect_uri_mismatch")) {
      userMessage = "Redirect URI mismatch.";
      technicalDetails = `Make sure http://localhost:3001/api/auth/google/callback is added to your Google Cloud Console authorized redirect URIs.`;
    } else if (error.message?.includes("invalid_client")) {
      userMessage = "Invalid OAuth client configuration.";
      technicalDetails = "Check your GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in .env file.";
    }

    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Failed</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
              padding: 2rem;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 1rem;
              backdrop-filter: blur(10px);
              max-width: 500px;
            }
            h1 { margin: 0 0 1rem 0; font-size: 2rem; }
            .message { margin: 1rem 0; opacity: 0.9; font-size: 1.1rem; }
            .details {
              margin: 1rem 0;
              opacity: 0.8;
              font-size: 0.9rem;
              background: rgba(0,0,0,0.2);
              padding: 1rem;
              border-radius: 0.5rem;
              text-align: left;
            }
            .retry { margin-top: 1.5rem; font-size: 0.9rem; }
            .code {
              font-family: monospace;
              background: rgba(0,0,0,0.3);
              padding: 0.25rem 0.5rem;
              border-radius: 0.25rem;
              font-size: 0.85rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Authentication Failed</h1>
            <p class="message">${userMessage}</p>
            ${technicalDetails ? `<div class="details">${technicalDetails}</div>` : ''}
            <p class="retry">Close this window and try again.</p>
            ${process.env.NODE_ENV === 'development' ? `<div class="details"><strong>Debug info:</strong><br><span class="code">${error.message}</span></div>` : ''}
          </div>
          <script>
            // Try to notify opener window of failure
            if (window.opener) {
              window.opener.postMessage({ type: 'gmail-auth-error', error: '${userMessage}' }, '*');
            }
          </script>
        </body>
      </html>
    `);
  }
});

/**
 * GET /api/auth/status
 * Check authentication status and token validity
 */
router.get("/status", async (req, res) => {
  console.log("🔍 [auth/status] Checking auth status");
  console.log("🔍 [auth/status] Session ID:", req.session?.id);
  console.log("🔍 [auth/status] Has tokens:", !!req.session?.googleTokens);

  try {
    const authenticated = !!(
      req.session?.googleTokens && req.session?.authenticated
    );
    const email = req.session?.email || null;

    // Check if tokens are expired and refresh if needed
    let hasGmailTokens = false;
    let tokenExpiry = null;

    if (req.session?.googleTokens) {
      const tokens = req.session.googleTokens;
      tokenExpiry = tokens.expiry_date;

      // Try to refresh token if needed
      try {
        const refreshedTokens = await refreshTokenIfNeeded(tokens);

        if (refreshedTokens) {
          req.session.googleTokens = refreshedTokens;
          console.log("🔄 [auth/status] Tokens refreshed");
          // Persist updated session so refreshed tokens survive
          await new Promise((resolve, reject) => {
            req.session.save((err) => (err ? reject(err) : resolve()));
          });
        }

        hasGmailTokens = true;
      } catch (refreshError) {
        console.error("❌ [auth/status] Token refresh failed:", refreshError);
        hasGmailTokens = false;
      }
    }

    console.log("✅ [auth/status] Authenticated:", authenticated);
    console.log("✅ [auth/status] Has Gmail tokens:", hasGmailTokens);
    console.log("📧 [auth/status] Email:", email);

    res.json({
      authenticated: authenticated && hasGmailTokens,
      hasGmailTokens,
      email,
      tokenExpiry,
      testMode: !authenticated || !hasGmailTokens,
    });
  } catch (error) {
    console.error("❌ [auth/status] Error:", error);
    res.json({
      authenticated: false,
      hasGmailTokens: false,
      email: null,
      tokenExpiry: null,
      testMode: true,
    });
  }
});

/**
 * POST /api/auth/logout
 * Clear session and log out
 */
router.post("/logout", (req, res) => {
  console.log("🚪 [auth/logout] Logging out user:", req.session?.email);

  req.session.destroy((err) => {
    if (err) {
      console.error("❌ [auth/logout] Error destroying session:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to log out",
      });
    }

    res.clearCookie("dorian.sid");
    console.log("✅ [auth/logout] Session destroyed");

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  });
});

/**
 * GET /api/auth/test
 * Test endpoint to verify session
 */
router.get("/test", (req, res) => {
  res.json({
    sessionID: req.session?.id,
    hasGoogleTokens: !!req.session?.googleTokens,
    email: req.session?.email,
    authenticated: req.session?.authenticated,
  });
});

module.exports = router;
