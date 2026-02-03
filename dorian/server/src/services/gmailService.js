const { google } = require("googleapis");
const { setCredentials } = require("../config/gmail");

class GmailService {
  async listMessages(tokens, maxResults = 10, query = "") {
    const auth = setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth });

    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults,
      q: query,
    });

    const messages = response.data.messages || [];

    // Fetch full details for each message
    const detailedMessages = await Promise.all(
      messages.map((msg) => this.getMessage(tokens, msg.id))
    );

    return detailedMessages;
  }

  async getMessage(tokens, messageId) {
    const auth = setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth });

    const response = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    const message = response.data;
    const headers = message.payload.headers;

    return {
      id: message.id,
      threadId: message.threadId,
      subject:
        headers.find((h) => h.name === "Subject")?.value || "(No Subject)",
      from: headers.find((h) => h.name === "From")?.value || "",
      to: headers.find((h) => h.name === "To")?.value || "",
      date: headers.find((h) => h.name === "Date")?.value || "",
      snippet: message.snippet,
      body: this.getMessageBody(message.payload),
    };
  }

  getMessageBody(payload) {
    let body = "";

    if (payload.body.data) {
      body = Buffer.from(payload.body.data, "base64").toString("utf-8");
    } else if (payload.parts) {
      const textPart = payload.parts.find(
        (part) => part.mimeType === "text/plain"
      );
      if (textPart && textPart.body.data) {
        body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
      }
    }

    return body;
  }

  async sendEmail(tokens, to, subject, body) {
    const auth = setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth });

    const email = [`To: ${to}`, `Subject: ${subject}`, "", body].join("\n");

    const encodedEmail = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedEmail,
      },
    });

    return response.data;
  }

  async replyToEmail(tokens, messageId, threadId, body) {
    const auth = setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth });

    // Get original message to extract subject and recipient
    const originalMessage = await this.getMessage(tokens, messageId);

    const replySubject = originalMessage.subject.startsWith("Re:")
      ? originalMessage.subject
      : `Re: ${originalMessage.subject}`;

    const email = [
      `To: ${originalMessage.from}`,
      `Subject: ${replySubject}`,
      `In-Reply-To: ${messageId}`,
      `References: ${messageId}`,
      "",
      body,
    ].join("\n");

    const encodedEmail = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedEmail,
        threadId: threadId,
      },
    });

    return response.data;
  }
}

module.exports = {
  gmail: new GmailService(),
};
