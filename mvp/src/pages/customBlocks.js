import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

// ---------------------------------------------------------------------------
// CONTROL BLOCKS (Purple - #7c3aed)
// ---------------------------------------------------------------------------

Blockly.Blocks["agent_start"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Start Agent:")
      .appendField(
        new Blockly.FieldDropdown([
          ["Customer Support", "support"],
          ["Sales Analyst", "sales"],
          ["Data Processor", "data"],
          ["Email Auto-Responder", "email"],
        ]),
        "AGENT_TYPE"
      );
    this.appendStatementInput("STEPS")
      .setCheck(null)
      .appendField("workflow steps:");
    this.setColour("#7c3aed");
    this.setTooltip("The starting point of your AI agent.");
  },
};

javascriptGenerator.forBlock["agent_start"] = function (block) {
  const agentType = block.getFieldValue("AGENT_TYPE");
  const steps = javascriptGenerator.statementToCode(block, "STEPS");

  return `
// ${agentType.toUpperCase()} AGENT
context.log("Starting ${agentType} agent...");
${steps}
`;
};

// ---------------------------------------------------------------------------

Blockly.Blocks["if_contains"] = {
  init: function () {
    this.appendValueInput("TEXT").setCheck(null).appendField("If this text");
    this.appendDummyInput()
      .appendField("contains keyword:")
      .appendField(new Blockly.FieldTextInput("urgent"), "KEYWORD");
    this.appendStatementInput("DO").setCheck(null).appendField("then do:");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#7c3aed");
    this.setTooltip("Execute steps only if text contains a keyword.");
  },
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

  return `
if (String(${text}).toLowerCase().includes("${keyword.toLowerCase()}")) {
  context.log("Keyword '${keyword}' found — running conditional steps.");
${doCode}}
`;
};

// ---------------------------------------------------------------------------
// INPUT BLOCKS (Orange - #f59e0b)
// ---------------------------------------------------------------------------

Blockly.Blocks["input_data"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Get input field:")
      .appendField(new Blockly.FieldTextInput("emailBody"), "FIELD_NAME");
    this.setOutput(true, "String");
    this.setColour("#f59e0b");
    this.setTooltip("Get a value from the workflow input data.");
  },
};

javascriptGenerator.forBlock["input_data"] = function (block) {
  const fieldName = block.getFieldValue("FIELD_NAME");
  return [
    `(context.inputData["${fieldName}"] || "")`,
    javascriptGenerator.ORDER_MEMBER,
  ];
};

// ---------------------------------------------------------------------------
// GMAIL BLOCKS (Blue - #3b82f6)
// ---------------------------------------------------------------------------

// -- Fetch unread ----------------------------------------------------------

Blockly.Blocks["gmail_fetch_unread"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Fetch")
      .appendField(
        new Blockly.FieldDropdown([
          ["all unread", "all"],
          ["first 1", "1"],
          ["first 3", "3"],
          ["first 5", "5"],
          ["first 10", "10"],
          ["first 20", "20"],
        ]),
        "MAX_EMAILS"
      )
      .appendField("unread emails");
    this.appendDummyInput()
      .appendField("save as:")
      .appendField(new Blockly.FieldTextInput("emails"), "VAR_NAME");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#3b82f6");
    this.setTooltip("Fetch unread emails from Gmail and save to a variable.");
  },
};

javascriptGenerator.forBlock["gmail_fetch_unread"] = function (block) {
  const varName = block.getFieldValue("VAR_NAME");
  const maxEmails = block.getFieldValue("MAX_EMAILS");
  const maxArg = maxEmails === "all" ? "10" : maxEmails;

  return `
const ${varName} = await context.fetchEmails(${maxArg});
context.log("Fetched " + ${varName}.length + " email(s).");
`;
};

// -- Search -----------------------------------------------------------------

Blockly.Blocks["gmail_search"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Search Gmail:")
      .appendField(
        new Blockly.FieldTextInput("from:someone@email.com"),
        "QUERY"
      );
    this.appendDummyInput()
      .appendField("max results:")
      .appendField(
        new Blockly.FieldDropdown([
          ["5", "5"],
          ["10", "10"],
          ["20", "20"],
          ["50", "50"],
        ]),
        "MAX"
      );
    this.appendDummyInput()
      .appendField("save as:")
      .appendField(new Blockly.FieldTextInput("searchResults"), "VAR_NAME");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#3b82f6");
    this.setTooltip(
      "Search Gmail using any Gmail search query (from:, subject:, label:, etc)."
    );
  },
};

javascriptGenerator.forBlock["gmail_search"] = function (block) {
  const query = block.getFieldValue("QUERY").replace(/"/g, '\\"');
  const max = block.getFieldValue("MAX");
  const varName = block.getFieldValue("VAR_NAME");

  return `
const ${varName} = await context.searchEmails("${query}", ${max});
context.log("Search returned " + ${varName}.length + " result(s).");
`;
};

// -- Loop over emails -------------------------------------------------------

Blockly.Blocks["gmail_for_each_email"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("For each email in:")
      .appendField(new Blockly.FieldTextInput("emails"), "EMAIL_LIST");
    this.appendStatementInput("DO").setCheck(null).appendField("do:");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#3b82f6");
    this.setTooltip(
      "Loop through each email in a list. Use 'currentEmail' inside."
    );
  },
};

javascriptGenerator.forBlock["gmail_for_each_email"] = function (block) {
  const emailList = block.getFieldValue("EMAIL_LIST");
  const doCode = javascriptGenerator.statementToCode(block, "DO");

  return `
if (Array.isArray(${emailList})) {
  for (const currentEmail of ${emailList}) {
    context.log("Processing email from: " + currentEmail.from);
${doCode}  }
} else {
  context.log("Warning: '${emailList}' is not an array — skipping loop.");
}
`;
};

// -- Get property from current email ----------------------------------------

Blockly.Blocks["gmail_get_property"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Get from current email:")
      .appendField(
        new Blockly.FieldDropdown([
          ["Subject", "subject"],
          ["Body", "body"],
          ["Sender (full)", "from"],
          ["Sender (email only)", "fromEmail"],
          ["Email ID", "id"],
          ["Thread ID", "threadId"],
          ["Date", "date"],
          ["Snippet", "snippet"],
        ]),
        "PROPERTY"
      );
    this.setOutput(true, "String");
    this.setColour("#3b82f6");
    this.setTooltip("Get a field from the current email inside a loop.");
  },
};

javascriptGenerator.forBlock["gmail_get_property"] = function (block) {
  const property = block.getFieldValue("PROPERTY");
  return [
    `(currentEmail ? currentEmail["${property}"] || "" : "")`,
    javascriptGenerator.ORDER_MEMBER,
  ];
};

// -- AI reply (email-aware) -------------------------------------------------
// This block calls the /api/ai/reply endpoint which receives subject + from
// context. The generic AI blocks call /api/ai which does not.

Blockly.Blocks["gmail_ai_reply"] = {
  init: function () {
    this.appendDummyInput().appendField("Generate AI reply to current email");
    this.appendDummyInput()
      .appendField("instructions:")
      .appendField(
        new Blockly.FieldTextInput("Be professional and helpful"),
        "TASK"
      );
    this.appendDummyInput()
      .appendField("save reply as:")
      .appendField(new Blockly.FieldTextInput("aiReply"), "VAR_NAME");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#3b82f6");
    this.setTooltip(
      "Use AI to generate a reply specifically for the current email. Includes subject and sender context."
    );
  },
};

javascriptGenerator.forBlock["gmail_ai_reply"] = function (block) {
  const task = block.getFieldValue("TASK").replace(/"/g, '\\"');
  const varName = block.getFieldValue("VAR_NAME");

  // generateReply(body, task, subject, from) — all pulled from currentEmail
  return `
let ${varName} = "";
if (currentEmail) {
  ${varName} = await context.generateReply(
    currentEmail.body || "",
    "${task}",
    currentEmail.subject || "",
    currentEmail.from || ""
  );
  context.log("AI reply generated for: " + currentEmail.subject);
} else {
  context.log("No current email — cannot generate reply.");
}
`;
};

// -- Send reply -------------------------------------------------------------
// Uses context.getVariable() so the reply variable is looked up at runtime,
// not baked in as a bare identifier. This is scope-safe inside loops.

Blockly.Blocks["gmail_send_reply"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Send reply using variable:")
      .appendField(new Blockly.FieldTextInput("aiReply"), "REPLY_VAR");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#3b82f6");
    this.setTooltip(
      "Send a reply to the current email using the text stored in the named variable."
    );
  },
};

javascriptGenerator.forBlock["gmail_send_reply"] = function (block) {
  const replyVar = block.getFieldValue("REPLY_VAR");

  // The variable might be a local const (from ai_generate inside the loop)
  // OR a context variable. We try the local first, fall back to context.
  return `
{
  const replyText = (typeof ${replyVar} !== "undefined" ? ${replyVar} : context.getVariable("${replyVar}")) || "";
  if (currentEmail && replyText) {
    await context.sendReply(
      currentEmail.id,
      replyText,
      currentEmail.subject || "",
      currentEmail.from || "",
      currentEmail.threadId || ""
    );
  } else {
    context.log("Cannot send reply: " + (!currentEmail ? "no current email" : "reply text is empty"));
  }
}
`;
};

// -- Send new email ---------------------------------------------------------

Blockly.Blocks["gmail_send_new"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Send new email to:")
      .appendField(new Blockly.FieldTextInput("someone@email.com"), "TO");
    this.appendDummyInput()
      .appendField("subject:")
      .appendField(new Blockly.FieldTextInput("Hello"), "SUBJECT");
    this.appendValueInput("BODY").setCheck(null).appendField("body:");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#3b82f6");
    this.setTooltip("Compose and send a brand new email (not a reply).");
    this.setInputsInline(false);
  },
};

javascriptGenerator.forBlock["gmail_send_new"] = function (block) {
  const to = block.getFieldValue("TO").replace(/"/g, '\\"');
  const subject = block.getFieldValue("SUBJECT").replace(/"/g, '\\"');
  const body =
    javascriptGenerator.valueToCode(
      block,
      "BODY",
      javascriptGenerator.ORDER_NONE
    ) || '""';

  return `
await context.sendNewEmail("${to}", "${subject}", String(${body}));
`;
};

// -- Mark as read -----------------------------------------------------------

Blockly.Blocks["gmail_mark_read"] = {
  init: function () {
    this.appendDummyInput().appendField("Mark current email as read");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#3b82f6");
    this.setTooltip("Mark the current email as read.");
  },
};

javascriptGenerator.forBlock["gmail_mark_read"] = function (block) {
  return `
if (currentEmail && currentEmail.id) {
  await context.markRead(currentEmail.id);
  context.log("Email marked as read.");
} else {
  context.log("No current email to mark as read.");
}
`;
};

// -- Archive ----------------------------------------------------------------

Blockly.Blocks["gmail_archive"] = {
  init: function () {
    this.appendDummyInput().appendField("Archive current email");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#3b82f6");
    this.setTooltip("Move the current email out of the inbox (archive it).");
  },
};

javascriptGenerator.forBlock["gmail_archive"] = function (block) {
  return `
if (currentEmail && currentEmail.id) {
  await context.archiveEmail(currentEmail.id);
  context.log("Email archived.");
} else {
  context.log("No current email to archive.");
}
`;
};

// ---------------------------------------------------------------------------
// AI PROCESSING BLOCKS (Green - #10b981)
// ---------------------------------------------------------------------------

Blockly.Blocks["ai_analyze"] = {
  init: function () {
    this.appendValueInput("INPUT").setCheck(null).appendField("AI Analyze");
    this.appendDummyInput()
      .appendField("Task:")
      .appendField(
        new Blockly.FieldTextInput("Analyze the sentiment and urgency"),
        "TASK"
      );
    this.appendDummyInput()
      .appendField("Save result as:")
      .appendField(new Blockly.FieldTextInput("analysis"), "VAR_NAME");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#10b981");
    this.setTooltip("Use AI to analyze text and save the result.");
    this.setInputsInline(false);
  },
};

javascriptGenerator.forBlock["ai_analyze"] = function (block) {
  const input =
    javascriptGenerator.valueToCode(
      block,
      "INPUT",
      javascriptGenerator.ORDER_NONE
    ) || '""';
  const task = block.getFieldValue("TASK").replace(/"/g, '\\"');
  const varName = block.getFieldValue("VAR_NAME");

  return `
const ${varName} = await context.callAI(String(${input}), "${task}");
context.log("AI analysis complete — saved as '${varName}'.");
`;
};

// ---------------------------------------------------------------------------

Blockly.Blocks["ai_generate"] = {
  init: function () {
    this.appendValueInput("INPUT").setCheck(null).appendField("AI Generate");
    this.appendDummyInput()
      .appendField("Task:")
      .appendField(
        new Blockly.FieldTextInput("Draft a professional email response"),
        "TASK"
      );
    this.appendDummyInput()
      .appendField("Save result as:")
      .appendField(new Blockly.FieldTextInput("response"), "VAR_NAME");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#10b981");
    this.setTooltip("Use AI to generate text and save the result.");
    this.setInputsInline(false);
  },
};

javascriptGenerator.forBlock["ai_generate"] = function (block) {
  const input =
    javascriptGenerator.valueToCode(
      block,
      "INPUT",
      javascriptGenerator.ORDER_NONE
    ) || '""';
  const task = block.getFieldValue("TASK").replace(/"/g, '\\"');
  const varName = block.getFieldValue("VAR_NAME");

  return `
const ${varName} = await context.callAI(String(${input}), "${task}");
context.log("AI generation complete — saved as '${varName}'.");
`;
};

// ---------------------------------------------------------------------------

Blockly.Blocks["ai_extract"] = {
  init: function () {
    this.appendValueInput("INPUT").setCheck(null).appendField("AI Extract");
    this.appendDummyInput()
      .appendField("What to extract:")
      .appendField(
        new Blockly.FieldTextInput("customer name and order number"),
        "WHAT"
      );
    this.appendDummyInput()
      .appendField("Save result as:")
      .appendField(new Blockly.FieldTextInput("extracted"), "VAR_NAME");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#10b981");
    this.setTooltip("Extract specific information from text using AI.");
    this.setInputsInline(false);
  },
};

javascriptGenerator.forBlock["ai_extract"] = function (block) {
  const input =
    javascriptGenerator.valueToCode(
      block,
      "INPUT",
      javascriptGenerator.ORDER_NONE
    ) || '""';
  const what = block.getFieldValue("WHAT").replace(/"/g, '\\"');
  const varName = block.getFieldValue("VAR_NAME");

  return `
const ${varName} = await context.callAI(String(${input}), "Extract the following information: ${what}");
context.log("AI extraction complete — saved as '${varName}'.");
`;
};

// ---------------------------------------------------------------------------
// DATA BLOCKS (Gray - #6b7280)
// ---------------------------------------------------------------------------

Blockly.Blocks["simple_text"] = {
  init: function () {
    this.appendDummyInput()
      .appendField('"')
      .appendField(new Blockly.FieldTextInput("text"), "TEXT")
      .appendField('"');
    this.setOutput(true, "String");
    this.setColour("#6b7280");
    this.setTooltip("A piece of text.");
  },
};

javascriptGenerator.forBlock["simple_text"] = function (block) {
  const text = block
    .getFieldValue("TEXT")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
  return [`"${text}"`, javascriptGenerator.ORDER_ATOMIC];
};

// ---------------------------------------------------------------------------

Blockly.Blocks["get_variable"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Get variable:")
      .appendField(new Blockly.FieldTextInput("variable"), "VAR");
    this.setOutput(true, null);
    this.setColour("#6b7280");
    this.setTooltip("Retrieve a previously saved value by name.");
  },
};

javascriptGenerator.forBlock["get_variable"] = function (block) {
  const varName = block.getFieldValue("VAR");
  // Try the local scope first (const declared in the same function), then
  // fall back to the context variable store.
  return [
    `(typeof ${varName} !== "undefined" ? ${varName} : context.getVariable("${varName}"))`,
    javascriptGenerator.ORDER_ATOMIC,
  ];
};

// ---------------------------------------------------------------------------

Blockly.Blocks["combine_text"] = {
  init: function () {
    this.appendValueInput("TEXT1").setCheck(null).appendField("Combine");
    this.appendValueInput("TEXT2").setCheck(null).appendField("with");
    this.setOutput(true, "String");
    this.setColour("#6b7280");
    this.setTooltip("Join two pieces of text together with a space.");
    this.setInputsInline(false);
  },
};

javascriptGenerator.forBlock["combine_text"] = function (block) {
  const text1 =
    javascriptGenerator.valueToCode(
      block,
      "TEXT1",
      javascriptGenerator.ORDER_NONE
    ) || '""';
  const text2 =
    javascriptGenerator.valueToCode(
      block,
      "TEXT2",
      javascriptGenerator.ORDER_NONE
    ) || '""';

  return [
    `(String(${text1}) + " " + String(${text2}))`,
    javascriptGenerator.ORDER_ADDITION,
  ];
};

// ---------------------------------------------------------------------------
// OUTPUT BLOCKS (Pink - #ec4899)
// ---------------------------------------------------------------------------

Blockly.Blocks["display_result"] = {
  init: function () {
    this.appendValueInput("RESULT")
      .setCheck(null)
      .appendField("Display result:");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#ec4899");
    this.setTooltip("Show a value in the output panel.");
  },
};

javascriptGenerator.forBlock["display_result"] = function (block) {
  const result =
    javascriptGenerator.valueToCode(
      block,
      "RESULT",
      javascriptGenerator.ORDER_NONE
    ) || '""';

  return `context.output(${result});\n`;
};

// ---------------------------------------------------------------------------

Blockly.Blocks["log_message"] = {
  init: function () {
    this.appendValueInput("MESSAGE").setCheck(null).appendField("Log:");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#6b7280");
    this.setTooltip("Print a status message to the output panel.");
  },
};

javascriptGenerator.forBlock["log_message"] = function (block) {
  const message =
    javascriptGenerator.valueToCode(
      block,
      "MESSAGE",
      javascriptGenerator.ORDER_NONE
    ) || '""';

  return `context.log(${message});\n`;
};

// ---------------------------------------------------------------------------
// UTILITY BLOCKS (Teal - #0d9488)
// ---------------------------------------------------------------------------

Blockly.Blocks["wait_delay"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Wait")
      .appendField(
        new Blockly.FieldDropdown([
          ["1 second", "1"],
          ["2 seconds", "2"],
          ["3 seconds", "3"],
          ["5 seconds", "5"],
          ["10 seconds", "10"],
          ["30 seconds", "30"],
        ]),
        "SECONDS"
      );
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#0d9488");
    this.setTooltip("Pause the workflow for a set number of seconds.");
  },
};

javascriptGenerator.forBlock["wait_delay"] = function (block) {
  const seconds = block.getFieldValue("SECONDS");
  return `await context.delay(${seconds});\n`;
};
