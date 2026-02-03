const Groq = require("groq-sdk");
const { gmail } = require("./gmailService");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

class WorkflowEngine {
  constructor() {
    this.logs = [];
  }

  log(message) {
    console.log(message);
    this.logs.push({ timestamp: new Date(), message });
  }

  async executeWorkflow(blocks, googleTokens) {
    this.logs = [];
    this.log("🚀 Starting workflow execution...");

    try {
      // Parse blocks (this is simplified - in production parse Blockly XML)
      const result = await this.executeBlocks(blocks, googleTokens);

      this.log("✅ Workflow completed successfully");
      return { success: true, result, logs: this.logs };
    } catch (error) {
      this.log(`❌ Workflow failed: ${error.message}`);
      throw error;
    }
  }

  async executeBlocks(blocks, googleTokens) {
    // This is a simplified interpreter
    // In production, parse actual Blockly XML and execute blocks sequentially

    const results = {};

    for (const block of blocks) {
      switch (block.type) {
        case "get_emails":
          results.emails = await this.getEmails(googleTokens, block.params);
          break;

        case "analyze_email":
          results.analysis = await this.analyzeEmail(
            results.emails?.[0] || block.params.email,
            block.params.prompt
          );
          break;

        case "send_reply":
          results.sent = await this.sendReply(
            googleTokens,
            results.emails?.[0],
            block.params.reply || results.analysis
          );
          break;

        case "ai_process":
          results.aiResult = await this.processWithAI(
            block.params.input,
            block.params.prompt
          );
          break;

        default:
          this.log(`⚠️  Unknown block type: ${block.type}`);
      }
    }

    return results;
  }

  async getEmails(tokens, params = {}) {
    this.log("📧 Fetching emails from Gmail...");
    const emails = await gmail.listMessages(
      tokens,
      params.maxResults || 10,
      params.query || ""
    );
    this.log(`Found ${emails.length} emails`);
    return emails;
  }

  async analyzeEmail(email, prompt) {
    this.log("🤖 Analyzing email with AI...");

    const systemPrompt =
      prompt ||
      "Analyze this email and provide a concise summary and suggested response.";

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Subject: ${email.subject}\n\nFrom: ${email.from}\n\n${email.body}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const analysis = completion.choices[0].message.content;
    this.log("Analysis complete");
    return analysis;
  }

  async sendReply(tokens, email, replyText) {
    this.log("📤 Sending reply...");

    const result = await gmail.replyToEmail(
      tokens,
      email.id,
      email.threadId,
      replyText
    );

    this.log("Reply sent successfully");
    return result;
  }

  async processWithAI(input, prompt) {
    this.log("🤖 Processing with AI...");

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: input },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const result = completion.choices[0].message.content;
    this.log("AI processing complete");
    return result;
  }
}

async function executeWorkflow(blocks, tokens) {
  const engine = new WorkflowEngine();
  return await engine.executeWorkflow(blocks, tokens);
}

module.exports = { executeWorkflow };
