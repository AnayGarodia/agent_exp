import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { google } from "googleapis";
import Groq from "groq-sdk";

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------

// Set to false once you are ready to send real emails to anyone.
const TEST_MODE = true;

// In TEST_MODE, only these addresses will actually receive an email.
// Everyone else gets a simulated send (validated but not dispatched).
const ALLOWED_TEST_EMAILS = new Set([
  "agarodia98@gmail.com",
  "sg4647@barnard.edu",
]);

const PORT = process.env.PORT || 3001;
const TOKEN_PATH = path.join(process.cwd(), "gmail_tokens.json");

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
];

// ---------------------------------------------------------------------------
// APP
// ---------------------------------------------------------------------------

const app = express();
app.use(express.json());
// CORS: allow the React dev server. The /api/gmail/callback is hit by a
// browser redirect (not a fetch), so CORS does not block it.
app.use(cors({ origin: "http://localhost:3000" }));

// ---------------------------------------------------------------------------
// OAUTH CLIENT
// ---------------------------------------------------------------------------

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI || "http://localhost:3001/api/gmail/callback"
);

// Persist any refreshed tokens so sessions survive server restarts.
oauth2Client.on("tokens", (tokens) => {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      const data = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
      const merged = { ...data.tokens, ...tokens };
      fs.writeFileSync(
        TOKEN_PATH,
        JSON.stringify({ ...data, tokens: merged }, null, 2)
      );
      console.log("[oauth] Tokens auto-refreshed and saved.");
    }
  } catch (err) {
    console.error("[oauth] Failed to persist refreshed tokens:", err.message);
  }
});

let currentUserEmail = null;

// ---------------------------------------------------------------------------
// STARTUP: restore a previous session if the token file exists, then
// validate it by hitting a lightweight endpoint. If the token is expired
// and un-refreshable, wipe the file so the user is prompted to re-auth.
// ---------------------------------------------------------------------------

async function restoreSession() {
  if (!fs.existsSync(TOKEN_PATH)) return;

  try {
    const data = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    oauth2Client.setCredentials(data.tokens);
    currentUserEmail = data.userEmail;
    console.log(`[oauth] Restored session for: ${currentUserEmail}`);

    // Quick validation — if this throws the token is dead.
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    await oauth2.userinfo.get();
    console.log("[oauth] Session token is valid.");
  } catch (err) {
    console.warn(
      "[oauth] Restored token is invalid, clearing session:",
      err.message
    );
    oauth2Client.setCredentials({});
    currentUserEmail = null;
    try {
      fs.unlinkSync(TOKEN_PATH);
    } catch (_) {
      /* ignore */
    }
  }
}

restoreSession();

// ---------------------------------------------------------------------------
// GMAIL + GROQ CLIENTS
// ---------------------------------------------------------------------------

const gmail = google.gmail({ version: "v1", auth: oauth2Client });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

let groqCalls = 0;

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

// "Name <email@example.com>" -> "email@example.com"
function normalizeEmail(raw) {
  if (!raw) return "";
  const match = raw.match(/<([^>]+)>/);
  return (match ? match[1] : raw).trim().toLowerCase();
}

// Best-effort heuristic to skip newsletters / automated notifications.
function isAutomatedEmail(from, headers = []) {
  if (!from) return true;
  const lower = from.toLowerCase();
  if (lower.includes("noreply") || lower.includes("no-reply")) return true;
  if (lower.includes("newsletter")) return true;
  if (headers.some((h) => h.name === "List-Unsubscribe")) return true;
  return false;
}

// Recurse into MIME parts and return the first text/plain segment.
function extractPlainText(payload) {
  if (payload?.body?.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf8");
  }
  if (payload?.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain") {
        return extractPlainText(part);
      }
    }
    for (const part of payload.parts) {
      const text = extractPlainText(part);
      if (text) return text;
    }
  }
  return "";
}

// Build a URL-safe base64 RFC-2822 message for the Gmail send API.
function buildRawEmail({ to, subject, body, inReplyTo }) {
  const lines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `MIME-Version: 1.0`,
  ];

  if (inReplyTo) {
    lines.push(`In-Reply-To: ${inReplyTo}`);
    lines.push(`References: ${inReplyTo}`);
  }

  lines.push("", body);

  return Buffer.from(lines.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Shared logic: fetch a list of messages matching a Gmail query, then
// hydrate each one with headers + body. Used by /unread, /search, /count.
async function fetchMessages(query, maxResults = 10) {
  const list = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults,
  });

  if (!list.data.messages || list.data.messages.length === 0) {
    return { emails: [], total: 0 };
  }

  const emails = [];

  for (const msg of list.data.messages) {
    const full = await gmail.users.messages.get({ userId: "me", id: msg.id });
    const payload = full.data.payload;
    const headers = payload.headers || [];
    const from = headers.find((h) => h.name === "From")?.value || "";
    const subject =
      headers.find((h) => h.name === "Subject")?.value || "(No Subject)";
    const messageId =
      headers.find((h) => h.name === "Message-ID")?.value || null;
    const date = headers.find((h) => h.name === "Date")?.value || null;

    const body = extractPlainText(payload);

    emails.push({
      id: msg.id,
      threadId: full.data.threadId,
      messageId,
      from,
      fromEmail: normalizeEmail(from),
      subject,
      body: body.slice(0, 2000),
      snippet: body.slice(0, 200),
      date,
    });
  }

  // resultSetSize is the total matching the query (not just this page).
  return { emails, total: list.data.resultSetSize || emails.length };
}

// ---------------------------------------------------------------------------
// ROUTES — AUTH
// ---------------------------------------------------------------------------

// Open this URL in a popup to kick off the OAuth consent flow.
app.get("/api/gmail/auth", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // forces refresh_token on every consent
  });
  res.redirect(url);
});

// Google redirects here after the user consents (or denies).
app.get("/api/gmail/callback", async (req, res) => {
  // Google sends ?error=access_denied (or similar) when the user says no.
  if (req.query.error) {
    console.warn(
      "[auth] Google returned error:",
      req.query.error,
      req.query.error_description
    );
    return res
      .status(400)
      .send(
        `<h1>Access Denied</h1>` +
          `<p>${
            req.query.error_description || "You denied Gmail access."
          }</p>` +
          `<p>You can close this window and try again.</p>`
      );
  }

  if (!req.query.code) {
    console.warn("[auth] Callback hit with no code and no error param.");
    return res
      .status(400)
      .send(
        `<h1>Something went wrong</h1>` +
          `<p>No authorization code received. Please try again.</p>`
      );
  }

  try {
    const { tokens } = await oauth2Client.getToken(req.query.code);
    oauth2Client.setCredentials(tokens);

    // Pull the authenticated user's email so we can display it.
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    currentUserEmail = userInfo.data.email;

    // Persist tokens + email. 0o600 = owner read/write only.
    fs.writeFileSync(
      TOKEN_PATH,
      JSON.stringify({ tokens, userEmail: currentUserEmail }, null, 2),
      { mode: 0o600 }
    );

    console.log(`[auth] Gmail connected for: ${currentUserEmail}`);

    res.send(
      `<h1>Gmail Connected</h1>` +
        `<p>Logged in as: <strong>${currentUserEmail}</strong></p>` +
        `<p>You may close this window.</p>` +
        `<script>
        if (window.opener) {
          try { window.opener.postMessage({ gmailAuthSuccess: true }, "http://localhost:3000"); } catch(e) {}
        }
        setTimeout(() => window.close(), 1500);
      </script>`
    );
  } catch (error) {
    console.error(
      "[auth] Token exchange failed:",
      error.message,
      error.errors || ""
    );
    res
      .status(500)
      .send(
        `<h1>Authentication Failed</h1>` +
          `<p>${error.message}</p>` +
          `<p>Please close this window and try again.</p>`
      );
  }
});

// ---------------------------------------------------------------------------
// ROUTES — STATUS + DISCONNECT
// ---------------------------------------------------------------------------

app.get("/api/gmail/status", (req, res) => {
  res.json({
    connected: !!oauth2Client.credentials.access_token,
    userEmail: currentUserEmail,
    testMode: TEST_MODE,
    groqCalls,
  });
});

app.post("/api/gmail/disconnect", (req, res) => {
  try {
    oauth2Client.setCredentials({});
    currentUserEmail = null;
    if (fs.existsSync(TOKEN_PATH)) fs.unlinkSync(TOKEN_PATH);
    console.log("[auth] Session disconnected.");
    res.json({ success: true });
  } catch (err) {
    console.error("[auth] Disconnect error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// ROUTES — READ EMAILS
// ---------------------------------------------------------------------------

// Fetch unread, non-automated emails from primary inbox.
app.get("/api/emails/unread", async (req, res) => {
  try {
    if (!oauth2Client.credentials.access_token) {
      return res.status(401).json({ error: "Gmail not connected." });
    }

    const max = parseInt(req.query.max, 10) || 10;
    const { emails } = await fetchMessages(
      "is:unread category:primary -from:me",
      max
    );

    // Filter out automated / newsletter emails.
    const filtered = emails.filter((e) => !isAutomatedEmail(e.from));
    res.json({ emails: filtered });
  } catch (error) {
    console.error("[emails/unread]", error.message, error.errors || "");
    res.status(500).json({ error: error.message });
  }
});

// Search emails with an arbitrary Gmail query string.
// Example: GET /api/emails/search?q=from:boss@company.com&max=5
app.get("/api/emails/search", async (req, res) => {
  try {
    if (!oauth2Client.credentials.access_token) {
      return res.status(401).json({ error: "Gmail not connected." });
    }

    const query = req.query.q || "in:inbox";
    const max = parseInt(req.query.max, 10) || 10;

    const { emails, total } = await fetchMessages(query, max);
    res.json({ emails, total });
  } catch (error) {
    console.error("[emails/search]", error.message, error.errors || "");
    res.status(500).json({ error: error.message });
  }
});

// Return just the count of messages matching a query.
// Example: GET /api/emails/count?q=is:unread
app.get("/api/emails/count", async (req, res) => {
  try {
    if (!oauth2Client.credentials.access_token) {
      return res.status(401).json({ error: "Gmail not connected." });
    }

    const query = req.query.q || "is:unread";

    const list = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: 1, // we only need the total, not the messages
    });

    res.json({ count: list.data.resultSetSize || 0 });
  } catch (error) {
    console.error("[emails/count]", error.message, error.errors || "");
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------------------------
// ROUTES — SEND EMAILS
// ---------------------------------------------------------------------------

// Reply to an existing email thread.
app.post("/api/emails/send", async (req, res) => {
  try {
    if (!oauth2Client.credentials.access_token) {
      return res.status(401).json({ error: "Gmail not connected." });
    }

    const { emailId, threadId, messageId, to, subject, replyBody } = req.body;

    if (!replyBody || typeof replyBody !== "string" || !replyBody.trim()) {
      return res.status(400).json({ error: "Reply body is empty." });
    }
    if (!to) {
      return res.status(400).json({ error: "Missing recipient (to)." });
    }

    const toEmail = normalizeEmail(to);
    const cleanSubject = `Re: ${(subject || "").replace(/^Re:\s*/i, "")}`;

    // Mark the original as read before we do anything else.
    if (emailId) {
      await gmail.users.messages.modify({
        userId: "me",
        id: emailId,
        requestBody: { removeLabelIds: ["UNREAD"] },
      });
    }

    const shouldSend = !TEST_MODE || ALLOWED_TEST_EMAILS.has(toEmail);

    if (!shouldSend) {
      console.log(`[send] TEST MODE — simulated reply to ${toEmail}`);
      return res.json({
        success: true,
        testMode: true,
        emailDetails: { to: toEmail, subject: cleanSubject, body: replyBody },
      });
    }

    const raw = buildRawEmail({
      to: toEmail,
      subject: cleanSubject,
      body: replyBody.trim(),
      inReplyTo: messageId || null,
    });

    const sent = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw, threadId: threadId || undefined },
    });

    console.log(`[send] Reply sent to ${toEmail} — ID: ${sent.data.id}`);

    res.json({
      success: true,
      messageId: sent.data.id,
      emailDetails: { to: toEmail, subject: cleanSubject, body: replyBody },
    });
  } catch (error) {
    console.error("[send]", error.message, error.errors || "");
    res.status(500).json({ error: error.message });
  }
});

// Compose and send a brand-new email (not a reply to any thread).
app.post("/api/emails/send-new", async (req, res) => {
  try {
    if (!oauth2Client.credentials.access_token) {
      return res.status(401).json({ error: "Gmail not connected." });
    }

    const { to, subject, body } = req.body;

    if (!to) return res.status(400).json({ error: "Missing recipient (to)." });
    if (!subject) return res.status(400).json({ error: "Missing subject." });
    if (!body || !body.trim())
      return res.status(400).json({ error: "Body is empty." });

    const toEmail = normalizeEmail(to);
    const shouldSend = !TEST_MODE || ALLOWED_TEST_EMAILS.has(toEmail);

    if (!shouldSend) {
      console.log(`[send-new] TEST MODE — simulated new email to ${toEmail}`);
      return res.json({
        success: true,
        testMode: true,
        emailDetails: { to: toEmail, subject, body },
      });
    }

    const raw = buildRawEmail({ to: toEmail, subject, body: body.trim() });

    const sent = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    console.log(
      `[send-new] New email sent to ${toEmail} — ID: ${sent.data.id}`
    );

    res.json({
      success: true,
      messageId: sent.data.id,
      emailDetails: { to: toEmail, subject, body },
    });
  } catch (error) {
    console.error("[send-new]", error.message, error.errors || "");
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------------------------
// ROUTES — MODIFY EMAILS
// ---------------------------------------------------------------------------

// Mark a single email as read.
app.post("/api/emails/markread", async (req, res) => {
  try {
    if (!oauth2Client.credentials.access_token) {
      return res.status(401).json({ error: "Gmail not connected." });
    }

    const { emailId } = req.body;
    if (!emailId) return res.status(400).json({ error: "Missing emailId." });

    await gmail.users.messages.modify({
      userId: "me",
      id: emailId,
      requestBody: { removeLabelIds: ["UNREAD"] },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("[markread]", error.message, error.errors || "");
    res.status(500).json({ error: error.message });
  }
});

// Archive an email (remove INBOX label).
app.post("/api/emails/archive", async (req, res) => {
  try {
    if (!oauth2Client.credentials.access_token) {
      return res.status(401).json({ error: "Gmail not connected." });
    }

    const { emailId } = req.body;
    if (!emailId) return res.status(400).json({ error: "Missing emailId." });

    await gmail.users.messages.modify({
      userId: "me",
      id: emailId,
      requestBody: { removeLabelIds: ["INBOX"] },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("[archive]", error.message, error.errors || "");
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------------------------
// ROUTES — AI
// ---------------------------------------------------------------------------

// Generate a reply to a specific email.
app.post("/api/ai/reply", async (req, res) => {
  try {
    const { emailBody, body, task, subject, from, fromEmail } = req.body;

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set in .env");
    }

    const emailText = emailBody || body || "";
    const sender = from || fromEmail || "the sender";
    const aiTask = task || "Draft a professional, helpful email response.";

    const prompt = [
      "You are a professional email assistant.",
      aiTask,
      "",
      "Context:",
      `- Email subject: ${subject || "N/A"}`,
      `- From: ${sender}`,
      "",
      "Incoming email:",
      `"${emailText}"`,
      "",
      "Write a concise, natural reply. No subject line, no signature — just the body text.",
    ].join("\n");

    groqCalls++;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 400,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";
    res.json({ text, groqApiCalls: groqCalls, length: text.length });
  } catch (error) {
    console.error("[ai/reply]", error.message);
    res.status(500).json({ error: error.message });
  }
});

// General-purpose AI: analysis, summarisation, extraction, etc.
app.post("/api/ai", async (req, res) => {
  try {
    const { input, task } = req.body;

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set in .env");
    }

    const prompt = [
      task || "Process the following input.",
      "",
      `Input:`,
      `"${input || ""}"`,
      "",
      "Provide a clear, concise response.",
    ].join("\n");

    groqCalls++;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 600,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "";
    res.json({ text, groqApiCalls: groqCalls });
  } catch (error) {
    console.error("[ai]", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------------------------------------------------------
// START
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`);
  console.log(`[server] TEST_MODE: ${TEST_MODE}`);
  console.log(
    `[server] Allowed test recipients: ${[...ALLOWED_TEST_EMAILS].join(", ")}`
  );
  console.log(`[server] OAuth flow: http://localhost:${PORT}/api/gmail/auth`);
});
