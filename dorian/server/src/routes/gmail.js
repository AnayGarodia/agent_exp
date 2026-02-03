const express = require("express");
const router = express.Router();
const { gmail } = require("../services/gmailService");

// Middleware to check authentication
function requireAuth(req, res, next) {
  if (!req.session.googleTokens) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

// Get recent emails
router.get("/messages", requireAuth, async (req, res) => {
  try {
    const { maxResults = 10, query = "" } = req.query;
    const messages = await gmail.listMessages(
      req.session.googleTokens,
      maxResults,
      query
    );
    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Get specific email
router.get("/messages/:id", requireAuth, async (req, res) => {
  try {
    const message = await gmail.getMessage(
      req.session.googleTokens,
      req.params.id
    );
    res.json({ message });
  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).json({ error: "Failed to fetch message" });
  }
});

// Send email
router.post("/send", requireAuth, async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await gmail.sendEmail(
      req.session.googleTokens,
      to,
      subject,
      body
    );

    res.json({ success: true, messageId: result.id });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

module.exports = router;
