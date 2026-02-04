const express = require("express");
const router = express.Router();
const { gmail } = require("../services/gmailService");
const { refreshTokenIfNeeded } = require("../config/gmail-config");

// Middleware to check authentication and refresh tokens
async function requireAuth(req, res, next) {
  if (!req.session.googleTokens) {
    return res.status(401).json({
      error: "Not authenticated",
      message: "Please connect your Gmail account first",
    });
  }

  try {
    // Try to refresh token if needed
    const refreshed = await refreshTokenIfNeeded(req.session.googleTokens);
    if (refreshed) {
      req.session.googleTokens = refreshed;
      await new Promise((resolve) => req.session.save(resolve));
    }
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      error: "Authentication expired",
      message: "Please reconnect your Gmail account",
    });
  }
}

// Get recent emails
router.get("/messages", requireAuth, async (req, res) => {
  try {
    const { maxResults = 10, query = "" } = req.query;

    console.log(`📧 Fetching emails: max=${maxResults}, query="${query}"`);

    const messages = await gmail.listMessages(
      req.session.googleTokens,
      parseInt(maxResults),
      query
    );

    res.json({
      success: true,
      messages,
      count: messages.length,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      error: "Failed to fetch messages",
      message: error.message,
    });
  }
});

// Get specific email by ID
router.get("/messages/:id", requireAuth, async (req, res) => {
  try {
    console.log(`📧 Fetching message: ${req.params.id}`);

    const message = await gmail.getMessage(
      req.session.googleTokens,
      req.params.id
    );

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).json({
      error: "Failed to fetch message",
      message: error.message,
    });
  }
});

// Send new email
router.post("/send", requireAuth, async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Please provide to, subject, and body",
      });
    }

    console.log(`📤 Sending email to: ${to}`);

    const result = await gmail.sendEmail(
      req.session.googleTokens,
      to,
      subject,
      body
    );

    res.json({
      success: true,
      messageId: result.id,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      error: "Failed to send email",
      message: error.message,
    });
  }
});

// Reply to email
router.post("/reply", requireAuth, async (req, res) => {
  try {
    const { messageId, body } = req.body;

    if (!messageId || !body) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Please provide messageId and body",
      });
    }

    console.log(`💬 Replying to message: ${messageId}`);

    // Get original message to get threadId
    const originalMessage = await gmail.getMessage(
      req.session.googleTokens,
      messageId
    );

    const result = await gmail.replyToEmail(
      req.session.googleTokens,
      messageId,
      originalMessage.threadId,
      body
    );

    res.json({
      success: true,
      messageId: result.id,
      message: "Reply sent successfully",
    });
  } catch (error) {
    console.error("Error sending reply:", error);
    res.status(500).json({
      error: "Failed to send reply",
      message: error.message,
    });
  }
});

// Mark email as read
router.post("/mark-read/:id", requireAuth, async (req, res) => {
  try {
    console.log(`✓ Marking as read: ${req.params.id}`);

    await gmail.markAsRead(req.session.googleTokens, req.params.id);

    res.json({
      success: true,
      message: "Marked as read",
    });
  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).json({
      error: "Failed to mark as read",
      message: error.message,
    });
  }
});

// Archive email
router.post("/archive/:id", requireAuth, async (req, res) => {
  try {
    console.log(`📦 Archiving: ${req.params.id}`);

    await gmail.archiveEmail(req.session.googleTokens, req.params.id);

    res.json({
      success: true,
      message: "Email archived",
    });
  } catch (error) {
    console.error("Error archiving email:", error);
    res.status(500).json({
      error: "Failed to archive email",
      message: error.message,
    });
  }
});

module.exports = router;
