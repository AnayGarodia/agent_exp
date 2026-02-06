const express = require("express");
const router = express.Router();
const {
  getAuthUrl,
  getTokenFromCode,
  refreshTokenIfNeeded,
} = require("../config/gmail-config");

// Get Google OAuth URL
router.get("/google/url", (req, res) => {
  try {
    const authUrl = getAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error("Error generating auth URL:", error);
    res.status(500).json({ error: "Failed to generate auth URL" });
  }
});

// Google OAuth callback
router.get("/google/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL}/builder?error=no_code`);
  }

  try {
    const { tokens } = await getTokenFromCode(code);

    // Store tokens in session with expiry tracking
    req.session.googleTokens = tokens;
    req.session.isAuthenticated = true;
    req.session.tokenExpiry = Date.now() + (tokens.expiry_date || 3600000);
    
    try {
      // Get user profile to retrieve email
      const { google } = require('googleapis');
      const oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        process.env.GMAIL_REDIRECT_URI
      );
      
      oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({version: 'v2', auth: oauth2Client});
      const userInfo = await oauth2.userinfo.get();
      
      req.session.userEmail = userInfo.data.email;
    } catch (getUserError) {
      console.error("Error getting user info:", getUserError);
      req.session.userEmail = null; // Set to null if we can't get it
    }
    
    req.session.testMode = true; // Default to test mode
    req.session.groqApiCalls = 0; // Initialize API call counter

    // Save session to ensure persistence
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log("✅ Gmail authenticated successfully");
    console.log("📧 Tokens stored in session");
    if (req.session.userEmail) {
      console.log(`📧 User email: ${req.session.userEmail}`);
    }

    // Redirect back to builder with success
    res.redirect(`${process.env.CLIENT_URL}/builder?auth=success`);
  } catch (error) {
    console.error("OAuth error:", error);
    res.redirect(`${process.env.CLIENT_URL}/builder?error=auth_failed`);
  }
});

// Check auth status and refresh tokens if needed
router.get("/status", async (req, res) => {
  try {
    let authenticated = !!req.session.isAuthenticated;
    let hasGmailTokens = !!req.session.googleTokens;

    // If we have tokens, try to refresh them if expired
    if (hasGmailTokens && req.session.googleTokens) {
      try {
        const refreshed = await refreshTokenIfNeeded(req.session.googleTokens);
        if (refreshed) {
          req.session.googleTokens = refreshed;
          await new Promise((resolve) => req.session.save(resolve));
        }
      } catch (error) {
        console.error("Token refresh failed:", error);
        // If refresh fails, tokens are invalid
        authenticated = false;
        hasGmailTokens = false;
      }
    }

    res.json({
      authenticated,
      hasGmailTokens,
      email: req.session.userEmail || null, // Add user email if available
      testMode: req.session.testMode ?? true, // Add test mode flag
      groqApiCalls: req.session.groqApiCalls || 0, // Add API call counter
      tokenExpiry: req.session.tokenExpiry,
    });
  } catch (error) {
    console.error("Status check error:", error);
    res.json({
      authenticated: false,
      hasGmailTokens: false,
    });
  }
});

// Logout and clear tokens
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.json({ success: true });
  });
});

module.exports = router;
