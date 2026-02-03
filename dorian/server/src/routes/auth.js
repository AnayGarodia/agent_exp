const express = require("express");
const router = express.Router();
const { getAuthUrl, getTokenFromCode } = require("../config/gmail");

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

    // Store tokens in session (in production, use a database)
    req.session.googleTokens = tokens;
    req.session.isAuthenticated = true;

    console.log("✅ Gmail authenticated successfully");

    // Redirect back to builder with success
    res.redirect(`${process.env.CLIENT_URL}/builder?auth=success`);
  } catch (error) {
    console.error("OAuth error:", error);
    res.redirect(`${process.env.CLIENT_URL}/builder?error=auth_failed`);
  }
});

// Check auth status
router.get("/status", (req, res) => {
  res.json({
    authenticated: !!req.session.isAuthenticated,
    hasGmailTokens: !!req.session.googleTokens,
  });
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

module.exports = router;
