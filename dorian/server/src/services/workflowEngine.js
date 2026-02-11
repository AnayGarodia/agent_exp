const { gmail } = require("./gmailService");
const sheetsService = require("./sheetsService");
const Groq = require("groq-sdk");

// Groq API helper function
async function callGroqAPI(messages, temperature = 0.7, maxTokens = 1024, model = null) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not found in environment variables");
  }

  // Input validation
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Messages must be a non-empty array");
  }

  if (typeof temperature !== "number" || temperature < 0 || temperature > 2) {
    throw new Error("Temperature must be a number between 0 and 2");
  }

  if (typeof maxTokens !== "number" || maxTokens <= 0) {
    throw new Error("Max tokens must be a positive number");
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Use user-selected model from localStorage or default
    const selectedModel = model || "llama-3.3-70b-versatile";

    const completion = await groq.chat.completions.create({
      model: selectedModel,
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens,
    });

    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response from Groq API");
    }

    return completion.choices[0].message.content;
  } catch (error) {
    const errorMsg = error?.message || error?.toString() || "Unknown error";

    // Handle decommissioned models
    if (errorMsg.includes("decommissioned") || errorMsg.includes("model_decommissioned")) {
      throw new Error(
        `Model ${model || "llama-3.3-70b-versatile"} is no longer supported. Please select a different model from the toolbar.`
      );
    }

    // Handle quota/capacity errors
    if (errorMsg.includes("rate_limit") || errorMsg.includes("capacity")) {
      throw new Error(
        `Model ${model || "llama-3.3-70b-versatile"} is out of capacity. Please select another model.`
      );
    }

    // Handle invalid request errors
    if (errorMsg.includes("invalid_request_error")) {
      throw new Error(
        `Invalid request to AI model. Please try a different model or check your configuration.`
      );
    }

    throw new Error(`Groq API error: ${errorMsg}`);
  }
}

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

  async executeWorkflow(generatedCode, googleTokens, selectedModel = null) {
    this.logs = [];
    this.variables = {};

    this.log(" Starting workflow execution...", "info");

    // Store the selected model for use in AI operations
    this.selectedModel = selectedModel || "llama-3.3-70b-versatile";

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
        this.log(" Gmail authentication required", "error");
        throw new Error(
          "Gmail authentication required. Please connect your Gmail account first."
        );
      }

      // Create execution context with all the methods blocks can call
      const context = {
        // Logging
        log: (msg) => this.log(` ${msg}`, "log"),
        output: (msg) => this.log(` Output: ${msg}`, "result"),

        // Gmail operations
        fetchEmails: async (max) => {
          if (!googleTokens) {
            throw new Error(
              "Gmail authentication required. Please connect your Gmail account first."
            );
          }
          this.log(` Fetching ${max} unread emails...`, "email");
          const emails = await gmail.listMessages(
            googleTokens,
            max,
            "is:unread"
          );
          this.log(` Found ${emails.length} emails`, "success");
          return emails;
        },

        searchEmails: async (query, max) => {
          if (!googleTokens) {
            throw new Error(
              "Gmail authentication required. Please connect your Gmail account first."
            );
          }
          this.log(` Searching Gmail: "${query}"`, "email");
          const emails = await gmail.listMessages(googleTokens, max, query);
          this.log(` Found ${emails.length} matching emails`, "success");
          return emails;
        },

        sendNewEmail: async (to, subject, body) => {
          if (!googleTokens) {
            throw new Error(
              "Gmail authentication required. Please connect your Gmail account first."
            );
          }
          this.log(` Sending email to ${to}...`, "email");
          const result = await gmail.sendEmail(googleTokens, to, subject, body);
          this.log(` Email sent successfully`, "success");

          // Log to Google Sheets
          try {
            await sheetsService.logAction(googleTokens, {
              action: "Sent New Email",
              summary: `Sent email to ${to} with subject: "${subject}"`,
              response: body.substring(0, 200) + (body.length > 200 ? "..." : ""),
              recipient: to
            });
            this.log(` Action logged to Google Sheets`, "success");
          } catch (error) {
            this.log(` Failed to log to Sheets: ${error.message}`, "warning");
          }

          return result;
        },

        sendReply: async (messageId, body) => {
          if (!googleTokens) {
            throw new Error(
              "Gmail authentication required. Please connect your Gmail account first."
            );
          }
          this.log(` Sending reply to message ${messageId}...`, "email");
          // We need to get the email to get threadId
          const email = await gmail.getMessage(googleTokens, messageId);
          const result = await gmail.replyToEmail(
            googleTokens,
            messageId,
            email.threadId,
            body
          );
          this.log(` Reply sent successfully`, "success");

          // Log to Google Sheets
          try {
            await sheetsService.logAction(googleTokens, {
              action: "Sent Reply",
              summary: `Replied to email from ${email.from} (${email.subject})`,
              response: body.substring(0, 200) + (body.length > 200 ? "..." : ""),
              recipient: email.from
            });
            this.log(` Reply logged to Google Sheets`, "success");
          } catch (error) {
            this.log(` Failed to log to Sheets: ${error.message}`, "warning");
          }
          return result;
        },

        markRead: async (messageId) => {
          if (!googleTokens) {
            throw new Error(
              "Gmail authentication required. Please connect your Gmail account first."
            );
          }
          this.log(` Marking email as read...`, "email");
          await gmail.markAsRead(googleTokens, messageId);
          this.log(` Marked as read`, "success");
        },

        archiveEmail: async (messageId) => {
          if (!googleTokens) {
            throw new Error(
              "Gmail authentication required. Please connect your Gmail account first."
            );
          }
          this.log(` Archiving email...`, "email");
          await gmail.archiveEmail(googleTokens, messageId);
          this.log(` Archived`, "success");
        },

        // AI operations
        generateReply: async (emailBody, instructions) => {
          this.log(` Generating AI reply with ${this.selectedModel}...`, "ai");
          const prompt = `You are a helpful email assistant. Generate a professional reply to this email based on these instructions: ${instructions}\n\nEmail content:\n${emailBody}`;

          try {
            const reply = await callGroqAPI(
              [
                {
                  role: "system",
                  content:
                    "You are a professional email assistant. Generate concise, polite email replies.",
                },
                { role: "user", content: prompt },
              ],
              0.7,
              500,
              this.selectedModel
            );

            this.log(` AI reply generated`, "success");
            return reply;
          } catch (error) {
            this.log(` AI error: ${error.message}`, "error");
            throw error;
          }
        },

        callAI: async (input, task) => {
          this.log(` Processing with AI (${this.selectedModel}): ${task}`, "ai");

          try {
            const result = await callGroqAPI(
              [
                {
                  role: "system",
                  content: `You are a helpful AI assistant. Task: ${task}`,
                },
                { role: "user", content: input || "Process this request" },
              ],
              0.7,
              1024,
              this.selectedModel
            );

            this.log(` AI processing complete`, "success");
            return result;
          } catch (error) {
            this.log(` AI error: ${error.message}`, "error");
            throw error;
          }
        },

        // Utility
        delay: async (seconds) => {
          this.log(`  Waiting ${seconds} second(s)...`, "info");
          await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
          this.log(` Wait complete`, "success");
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

      this.log(" Workflow completed successfully", "success");

      return {
        success: true,
        logs: this.logs,
        variables: this.variables,
      };
    } catch (error) {
      this.log(` Workflow failed: ${error.message}`, "error");
      console.error("Workflow execution error:", error);

      return {
        success: false,
        error: error.message,
        logs: this.logs,
      };
    }
  }
}

async function executeWorkflow(generatedCode, tokens, selectedModel) {
  const engine = new WorkflowEngine();
  return await engine.executeWorkflow(generatedCode, tokens, selectedModel);
}

module.exports = { executeWorkflow };
