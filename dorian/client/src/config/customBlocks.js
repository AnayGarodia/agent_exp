import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

// ===========================================================================
// CONTROL BLOCKS  (purple #7c3aed)
// ===========================================================================

// FIX: Use Blockly.common.defineBlocksWithJsonArray instead of .blocks.addBlocks
Blockly.common.defineBlocksWithJsonArray([
  {
    type: "agent_start",
    message0: "Start Agent: %1 workflow steps: %2",
    args0: [
      {
        type: "field_dropdown",
        name: "AGENT_TYPE",
        options: [
          ["Customer Support", "support"],
          ["Sales Analyst", "sales"],
          ["Data Processor", "data"],
          ["Email Auto-Responder", "email"],
        ],
      },
      {
        type: "input_statement",
        name: "STEPS",
      },
    ],
    colour: "#7c3aed",
    tooltip: "The starting point of your AI agent.",
  },
  {
    type: "if_contains",
    message0: "If this text %1 contains keyword: %2 then do: %3",
    args0: [
      { type: "input_value", name: "TEXT" },
      { type: "field_input", name: "KEYWORD", text: "urgent" },
      { type: "input_statement", name: "DO" },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#7c3aed",
    tooltip: "Execute steps only if text contains a keyword.",
  },
]);

javascriptGenerator.forBlock["agent_start"] = function (block) {
  const agentType = block.getFieldValue("AGENT_TYPE");
  const steps = javascriptGenerator.statementToCode(block, "STEPS");

  return `\n// ${agentType.toUpperCase()} AGENT\ncontext.log("Starting ${agentType} agent...");\n${steps}\n`;
};

javascriptGenerator.forBlock["if_contains"] = function (block) {
  const text =
    javascriptGenerator.valueToCode(
      block,
      "TEXT",
      javascriptGenerator.ORDER_NONE
    ) || '""';
  const keyword = block.getFieldValue("KEYWORD");
  const doCode = javascriptGenerator.statementToCode(block, "DO");

  return `\nif (String(${text}).toLowerCase().includes("${keyword.toLowerCase()}")) {\n  context.log("Keyword '${keyword}' found — running conditional steps.");\n${doCode}}\n`;
};

// ===========================================================================
// INPUT BLOCKS  (orange #f59e0b)
// ===========================================================================

Blockly.common.defineBlocksWithJsonArray([
  {
    type: "input_data",
    message0: "Get input field: %1",
    args0: [{ type: "field_input", name: "FIELD_NAME", text: "emailBody" }],
    output: "String",
    colour: "#f59e0b",
    tooltip: "Get a value from the workflow input data.",
  },
]);

javascriptGenerator.forBlock["input_data"] = function (block) {
  const fieldName = block.getFieldValue("FIELD_NAME");
  return [
    `(context.inputData["${fieldName}"] || "")`,
    javascriptGenerator.ORDER_MEMBER,
  ];
};

// ===========================================================================
// GMAIL BLOCKS  (blue #3b82f6)
// ===========================================================================

Blockly.common.defineBlocksWithJsonArray([
  {
    type: "gmail_fetch_unread",
    message0: "Fetch %1 unread emails save as: %2",
    args0: [
      {
        type: "field_dropdown",
        name: "MAX_EMAILS",
        options: [
          ["all unread", "all"],
          ["first 1", "1"],
          ["first 3", "3"],
          ["first 5", "5"],
          ["first 10", "10"],
          ["first 20", "20"],
        ],
      },
      { type: "field_input", name: "VAR_NAME", text: "emails" },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#3b82f6",
    tooltip: "Fetch unread emails from Gmail and save to a variable.",
  },
  {
    type: "gmail_search",
    message0: "Search Gmail: %1 max results: %2 save as: %3",
    args0: [
      { type: "field_input", name: "QUERY", text: "from:someone@email.com" },
      {
        type: "field_dropdown",
        name: "MAX",
        options: [
          ["5", "5"],
          ["10", "10"],
          ["20", "20"],
          ["50", "50"],
        ],
      },
      { type: "field_input", name: "VAR_NAME", text: "searchResults" },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#3b82f6",
    tooltip: "Search Gmail using any Gmail search query.",
  },
  {
    type: "gmail_for_each_email",
    message0: "For each email in: %1 do: %2",
    args0: [
      { type: "field_input", name: "EMAIL_LIST", text: "emails" },
      { type: "input_statement", name: "DO" },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#3b82f6",
    tooltip: "Loop through each email in a list.",
  },
  {
    type: "gmail_get_property",
    message0: "Get from current email: %1",
    args0: [
      {
        type: "field_dropdown",
        name: "PROPERTY",
        options: [
          ["Subject", "subject"],
          ["Body", "body"],
          ["Sender", "from"],
          ["Email ID", "id"],
        ],
      },
    ],
    output: "String",
    colour: "#3b82f6",
    tooltip: "Get a field from the current email.",
  },
  {
    type: "gmail_ai_reply",
    message0: "AI reply to current email instructions: %1 save as: %2",
    args0: [
      { type: "field_input", name: "TASK", text: "Be professional" },
      { type: "field_input", name: "VAR_NAME", text: "aiReply" },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#3b82f6",
    tooltip: "Generate AI reply.",
  },
  {
    type: "gmail_send_reply",
    message0: "Send reply using variable: %1",
    args0: [{ type: "field_input", name: "REPLY_VAR", text: "aiReply" }],
    previousStatement: null,
    nextStatement: null,
    colour: "#3b82f6",
  },
  {
    type: "gmail_send_new",
    message0: "Send new email to: %1 subject: %2 body: %3",
    args0: [
      { type: "field_input", name: "TO", text: "someone@email.com" },
      { type: "field_input", name: "SUBJECT", text: "Hello" },
      { type: "input_value", name: "BODY" },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#3b82f6",
  },
  {
    type: "gmail_mark_read",
    message0: "Mark current email as read",
    previousStatement: null,
    nextStatement: null,
    colour: "#3b82f6",
  },
  {
    type: "gmail_archive",
    message0: "Archive current email",
    previousStatement: null,
    nextStatement: null,
    colour: "#3b82f6",
  },
]);

// --- Gmail generators ---
javascriptGenerator.forBlock["gmail_fetch_unread"] = function (block) {
  const varName = block.getFieldValue("VAR_NAME");
  const maxEmails = block.getFieldValue("MAX_EMAILS");
  const maxArg = maxEmails === "all" ? "10" : maxEmails;
  return `const ${varName} = await context.fetchEmails(${maxArg});\n`;
};

javascriptGenerator.forBlock["gmail_search"] = function (block) {
  const query = block.getFieldValue("QUERY").replace(/"/g, '\\"');
  const max = block.getFieldValue("MAX");
  const varName = block.getFieldValue("VAR_NAME");
  return `const ${varName} = await context.searchEmails("${query}", ${max});\n`;
};

javascriptGenerator.forBlock["gmail_for_each_email"] = function (block) {
  const emailList = block.getFieldValue("EMAIL_LIST");
  const doCode = javascriptGenerator.statementToCode(block, "DO");
  return `if (Array.isArray(${emailList})) {\n  for (const currentEmail of ${emailList}) {\n${doCode}  }\n}\n`;
};

javascriptGenerator.forBlock["gmail_get_property"] = function (block) {
  const property = block.getFieldValue("PROPERTY");
  return [
    `(currentEmail ? currentEmail["${property}"] || "" : "")`,
    javascriptGenerator.ORDER_MEMBER,
  ];
};

javascriptGenerator.forBlock["gmail_ai_reply"] = function (block) {
  const task = block.getFieldValue("TASK").replace(/"/g, '\\"');
  const varName = block.getFieldValue("VAR_NAME");
  return `let ${varName} = await context.generateReply(currentEmail.body, "${task}");\n`;
};

javascriptGenerator.forBlock["gmail_send_reply"] = function (block) {
  const replyVar = block.getFieldValue("REPLY_VAR");
  return `await context.sendReply(currentEmail.id, ${replyVar});\n`;
};

javascriptGenerator.forBlock["gmail_send_new"] = function (block) {
  const to = block.getFieldValue("TO");
  const sub = block.getFieldValue("SUBJECT");
  const body =
    javascriptGenerator.valueToCode(
      block,
      "BODY",
      javascriptGenerator.ORDER_NONE
    ) || '""';
  return `await context.sendNewEmail("${to}", "${sub}", ${body});\n`;
};

javascriptGenerator.forBlock["gmail_mark_read"] = function () {
  return `await context.markRead(currentEmail.id);\n`;
};

javascriptGenerator.forBlock["gmail_archive"] = function () {
  return `await context.archiveEmail(currentEmail.id);\n`;
};

// ===========================================================================
// AI & DATA BLOCKS (Consolidated Registration)
// ===========================================================================

Blockly.common.defineBlocksWithJsonArray([
  {
    type: "ai_analyze",
    message0: "AI Analyze %1 Task: %2 Save result as: %3",
    args0: [
      { type: "input_value", name: "INPUT" },
      { type: "field_input", name: "TASK", text: "Analyze sentiment" },
      { type: "field_input", name: "VAR_NAME", text: "analysis" },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#10b981",
  },
  {
    type: "simple_text",
    message0: '" %1 "',
    args0: [{ type: "field_input", name: "TEXT", text: "text" }],
    output: "String",
    colour: "#6b7280",
  },
  {
    type: "display_result",
    message0: "Display result: %1",
    args0: [{ type: "input_value", name: "RESULT" }],
    previousStatement: null,
    nextStatement: null,
    colour: "#ec4899",
  },
  {
    type: "wait_delay",
    message0: "Wait %1",
    args0: [
      {
        type: "field_dropdown",
        name: "SECONDS",
        options: [
          ["1 sec", "1"],
          ["5 sec", "5"],
        ],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#0d9488",
  },
]);

// AI Generator
javascriptGenerator.forBlock["ai_analyze"] = function (block) {
  const input =
    javascriptGenerator.valueToCode(
      block,
      "INPUT",
      javascriptGenerator.ORDER_NONE
    ) || '""';
  const task = block.getFieldValue("TASK");
  const varName = block.getFieldValue("VAR_NAME");
  return `const ${varName} = await context.callAI(${input}, "${task}");\n`;
};

// Text Generator
javascriptGenerator.forBlock["simple_text"] = function (block) {
  const text = block.getFieldValue("TEXT").replace(/"/g, '\\"');
  return [`"${text}"`, javascriptGenerator.ORDER_ATOMIC];
};

// Display Generator
javascriptGenerator.forBlock["display_result"] = function (block) {
  const res =
    javascriptGenerator.valueToCode(
      block,
      "RESULT",
      javascriptGenerator.ORDER_NONE
    ) || '""';
  return `context.output(${res});\n`;
};

// Delay Generator
javascriptGenerator.forBlock["wait_delay"] = function (block) {
  return `await context.delay(${block.getFieldValue("SECONDS")});\n`;
};
