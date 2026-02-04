const { google } = require("googleapis");
const { setCredentials } = require("../config/gmail-config");

class GmailService {
  /**
   * List messages from Gmail
   */
  async listMessages(tokens, maxResults = 10, query = "") {
    const auth = setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth });

    try {
      const response = await gmail.users.messages.list({
        userId: "me",
        maxResults,
        q: query || "is:unread",
      });

      const messages = response.data.messages || [];

      if (messages.length === 0) {
        return [];
      }

      // Fetch full details for each message
      const detailedMessages = await Promise.all(
        messages.map((msg) => this.getMessage(tokens, msg.id))
      );

      return detailedMessages;
    } catch (error) {
      console.error("Error listing messages:", error);
      throw new Error(`Failed to list messages: ${error.message}`);
    }
  }

  /**
   * Get a specific message by ID
   */
  async getMessage(tokens, messageId) {
    const auth = setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth });

    try {
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
        subject: this.getHeader(headers, "Subject") || "(No Subject)",
        from: this.getHeader(headers, "From") || "",
        to: this.getHeader(headers, "To") || "",
        date: this.getHeader(headers, "Date") || "",
        snippet: message.snippet,
        body: this.getMessageBody(message.payload),
      };
    } catch (error) {
      console.error(`Error getting message ${messageId}:`, error);
      throw new Error(`Failed to get message: ${error.message}`);
    }
  }

  /**
   * Helper to get header value
   */
  getHeader(headers, name) {
    const header = headers.find(
      (h) => h.name.toLowerCase() === name.toLowerCase()
    );
    return header ? header.value : null;
  }

  /**
   * Extract message body from payload
   */
  getMessageBody(payload) {
    let body = "";

    if (payload.body && payload.body.data) {
      body = Buffer.from(payload.body.data, "base64").toString("utf-8");
    } else if (payload.parts) {
      // Try to find text/plain part first
      let textPart = payload.parts.find(
        (part) => part.mimeType === "text/plain"
      );

      // If no plain text, try text/html
      if (!textPart) {
        textPart = payload.parts.find((part) => part.mimeType === "text/html");
      }

      if (textPart && textPart.body && textPart.body.data) {
        body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
      }
    }

    return body;
  }

  /**
   * Send a new email
   */
  async sendEmail(tokens, to, subject, body) {
    const auth = setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth });

    try {
      const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        "Content-Type: text/plain; charset=utf-8",
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
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Reply to an email
   */
  async replyToEmail(tokens, messageId, threadId, body) {
    const auth = setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth });

    try {
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
        "Content-Type: text/plain; charset=utf-8",
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
    } catch (error) {
      console.error("Error replying to email:", error);
      throw new Error(`Failed to reply to email: ${error.message}`);
    }
  }

  /**
   * Mark email as read
   */
  async markAsRead(tokens, messageId) {
    const auth = setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth });

    try {
      await gmail.users.messages.modify({
        userId: "me",
        id: messageId,
        requestBody: {
          removeLabelIds: ["UNREAD"],
        },
      });
    } catch (error) {
      console.error("Error marking as read:", error);
      throw new Error(`Failed to mark as read: ${error.message}`);
    }
  }

  /**
   * Archive email
   */
  async archiveEmail(tokens, messageId) {
    const auth = setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth });

    try {
      await gmail.users.messages.modify({
        userId: "me",
        id: messageId,
        requestBody: {
          removeLabelIds: ["INBOX"],
        },
      });
    } catch (error) {
      console.error("Error archiving email:", error);
      throw new Error(`Failed to archive email: ${error.message}`);
    }
  }
}

module.exports = {
  gmail: new GmailService(),
};
