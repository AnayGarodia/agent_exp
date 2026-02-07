const Groq = require("groq-sdk");
const { gmail } = require("./gmailService");
const sheetsService = require("./sheetsService");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

class WorkflowEngine {
  constructor() {
    this.logs = [];
    this.variables = {};
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    this.logs.push({
      timestamp: new Date(),
      message,
      type,
    });
  }

  async executeWorkflow(generatedCode, googleTokens) {
    this.logs = [];
    this.variables = {};

    this.log("🚀 Starting workflow execution...", "info");

    try {
      // Check if Gmail tokens are available when needed
      const needsGmail =
        generatedCode.includes("fetchEmails") ||
        generatedCode.includes("searchEmails") ||
        generatedCode.includes("sendNewEmail") ||
        generatedCode.includes("sendReply") ||
        generatedCode.includes("markRead") ||
        generatedCode.includes("archiveEmail");

      if (needsGmail && !googleTokens) {
        this.log("❌ Gmail authentication required", "error");
        throw new Error(
          "Gmail authentication required. Please connect your Gmail account first."
        );
      }

      // Create execution context with all the methods blocks can call
      const context = {
        // Logging
        log: (msg) => this.log(`📝 ${msg}`, "log"),
        output: (msg) => this.log(`📤 Output: ${msg}`, "result"),

        // Gmail operations
        fetchEmails: async (max) => {
          if (!googleTokens) {
            throw new Error(
              "Gmail authentication required. Please connect your Gmail account first."
            );
          }
          this.log(`📧 Fetching ${max} unread emails...`, "email");
          const emails = await gmail.listMessages(
            googleTokens,
            max,
            "is:unread"
          );
          this.log(`✅ Found ${emails.length} emails`, "success");
          return emails;
        },

        searchEmails: async (query, max) => {
          if (!googleTokens) {
            throw new Error(
              "Gmail authentication required. Please connect your Gmail account first."
            );
          }
          this.log(`🔍 Searching Gmail: "${query}"`, "email");
          const emails = await gmail.listMessages(googleTokens, max, query);
          this.log(`✅ Found ${emails.length} matching emails`, "success");
          return emails;
        },

        sendNewEmail: async (to, subject, body) => {
          if (!googleTokens) {
            throw new Error(
              "Gmail authentication required. Please connect your Gmail account first."
            );
          }
          this.log(`📤 Sending email to ${to}...`, "email");
          const result = await gmail.sendEmail(googleTokens, to, subject, body);
          this.log(`✅ Email sent successfully`, "success");

          // Log to Google Sheets
          try {
            await sheetsService.logAction(googleTokens, {
              action: "Sent New Email",
              summary: `Sent email to ${to} with subject: "${subject}"`,
              response: body.substring(0, 200) + (body.length > 200 ? "..." : ""),
              recipient: to
            });
            this.log(`📊 Action logged to Google Sheets`, "success");
          } catch (error) {
            this.log(`⚠️ Failed to log to Sheets: ${error.message}`, "warning");
          }

          return result;
        },

        sendReply: async (messageId, body) => {
          if (!googleTokens) {
            throw new Error(
              "Gmail authentication required. Please connect your Gmail account first."
            );
          }
          this.log(`💬 Sending reply to message ${messageId}...`, "email");
          // We need to get the email to get threadId
          const email = await gmail.getMessage(googleTokens, messageId);
          const result = await gmail.replyToEmail(
            googleTokens,
            messageId,
            email.threadId,
            body
          );
          this.log(`✅ Reply sent successfully`, "success");

          // Log to Google Sheets
          try {
            await sheetsService.logAction(googleTokens, {
              action: "Sent Reply",
              summary: `Replied to email from ${email.from} (${email.subject})`,
              response: body.substring(0, 200) + (body.length > 200 ? "..." : ""),
              recipient: email.from
            });
            this.log(`📊 Reply logged to Google Sheets`, "success");
          } catch (error) {
            this.log(`⚠️ Failed to log to Sheets: ${error.message}`, "warning");
          }
          return result;
        },

        markRead: async (messageId) => {
          if (!googleTokens) {
            throw new Error(
              "Gmail authentication required. Please connect your Gmail account first."
            );
          }
          this.log(`✔ Marking email as read...`, "email");
          await gmail.markAsRead(googleTokens, messageId);
          this.log(`✅ Marked as read`, "success");
        },

        archiveEmail: async (messageId) => {
          if (!googleTokens) {
            throw new Error(
              "Gmail authentication required. Please connect your Gmail account first."
            );
          }
          this.log(`📦 Archiving email...`, "email");
          await gmail.archiveEmail(googleTokens, messageId);
          this.log(`✅ Archived`, "success");
        },

        // AI operations
        generateReply: async (emailBody, instructions) => {
          this.log(`🤖 Generating AI reply...`, "ai");
          const prompt = `You are a helpful email assistant. Generate a professional reply to this email based on these instructions: ${instructions}\n\nEmail content:\n${emailBody}`;

          const completion = await groq.chat.completions.create({
            messages: [
              {
                role: "system",
                content:
                  "You are a professional email assistant. Generate concise, polite email replies.",
              },
              { role: "user", content: prompt },
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 500,
          });

          const reply = completion.choices[0].message.content;
          this.log(`✅ AI reply generated`, "success");
          return reply;
        },

        callAI: async (input, task) => {
          this.log(`🤖 Processing with AI: ${task}`, "ai");

          const completion = await groq.chat.completions.create({
            messages: [
              {
                role: "system",
                content: `You are a helpful AI assistant. Task: ${task}`,
              },
              { role: "user", content: input || "Process this request" },
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 1024,
          });

          const result = completion.choices[0].message.content;
          this.log(`✅ AI processing complete`, "success");
          return result;
        },

        // Utility
        delay: async (seconds) => {
          this.log(`⏱️  Waiting ${seconds} second(s)...`, "info");
          await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
          this.log(`✅ Wait complete`, "success");
        },

        // Input data (can be passed when executing workflow)
        inputData: {},
      };

      // Execute the generated code
      const AsyncFunction = Object.getPrototypeOf(
        async function () {}
      ).constructor;
      const workflowFunction = new AsyncFunction("context", generatedCode);

      await workflowFunction(context);

      this.log("✅ Workflow completed successfully", "success");

      return {
        success: true,
        logs: this.logs,
        variables: this.variables,
      };
    } catch (error) {
      this.log(`❌ Workflow failed: ${error.message}`, "error");
      console.error("Workflow execution error:", error);

      return {
        success: false,
        error: error.message,
        logs: this.logs,
      };
    }
  }
}

async function executeWorkflow(generatedCode, tokens) {
  const engine = new WorkflowEngine();
  return await engine.executeWorkflow(generatedCode, tokens);
}

module.exports = { executeWorkflow };
