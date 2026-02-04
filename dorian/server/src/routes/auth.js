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

    // Save session to ensure persistence
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log("✅ Gmail authenticated successfully");
    console.log("📧 Tokens stored in session");

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
