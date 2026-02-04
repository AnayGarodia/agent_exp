import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

// ===========================================================================
// CONTROL BLOCKS (purple #7c3aed)
// ===========================================================================

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
  return `\nif (String(${text}).toLowerCase().includes("${keyword.toLowerCase()}")) {\n  context.log("Keyword '${keyword}' found - running conditional steps.");\n${doCode}}\n`;
};

// ===========================================================================
// INPUT BLOCKS (orange #f59e0b)
// ===========================================================================

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

// ===========================================================================
// GMAIL BLOCKS (blue #3b82f6)
// ===========================================================================

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
      .appendField("unread emails save as:")
      .appendField(new Blockly.FieldTextInput("emails"), "VAR_NAME");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#3b82f6");
    this.setTooltip("Fetch unread emails from Gmail and save to a variable.");
  },
};

Blockly.Blocks["gmail_search"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Search Gmail:")
      .appendField(
        new Blockly.FieldTextInput("from:someone@email.com"),
        "QUERY"
      )
      .appendField("max results:")
      .appendField(
        new Blockly.FieldDropdown([
          ["5", "5"],
          ["10", "10"],
          ["20", "20"],
          ["50", "50"],
        ]),
        "MAX"
      )
      .appendField("save as:")
      .appendField(new Blockly.FieldTextInput("searchResults"), "VAR_NAME");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#3b82f6");
    this.setTooltip("Search Gmail using any Gmail search query.");
  },
};

Blockly.Blocks["gmail_for_each_email"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("For each email in:")
      .appendField(new Blockly.FieldTextInput("emails"), "EMAIL_LIST");
    this.appendStatementInput("DO").setCheck(null).appendField("do:");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#3b82f6");
    this.setTooltip("Loop through each email in a list.");
  },
};

Blockly.Blocks["gmail_get_property"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Get from current email:")
      .appendField(
        new Blockly.FieldDropdown([
          ["Subject", "subject"],
          ["Body", "body"],
          ["Sender", "from"],
          ["Email ID", "id"],
        ]),
        "PROPERTY"
      );
    this.setOutput(true, "String");
    this.setColour("#3b82f6");
    this.setTooltip("Get a field from the current email.");
  },
};

Blockly.Blocks["gmail_ai_reply"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("AI reply to current email instructions:")
      .appendField(new Blockly.FieldTextInput("Be professional"), "TASK")
      .appendField("save as:")
      .appendField(new Blockly.FieldTextInput("aiReply"), "VAR_NAME");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#3b82f6");
    this.setTooltip("Generate AI reply.");
  },
};

Blockly.Blocks["gmail_send_reply"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Send reply using variable:")
      .appendField(new Blockly.FieldTextInput("aiReply"), "REPLY_VAR");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#3b82f6");
    this.setTooltip("Send a reply to the current email.");
  },
};

Blockly.Blocks["gmail_send_new"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Send new email to:")
      .appendField(new Blockly.FieldTextInput("someone@email.com"), "TO")
      .appendField("subject:")
      .appendField(new Blockly.FieldTextInput("Hello"), "SUBJECT");
    this.appendValueInput("BODY").setCheck(null).appendField("body:");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#3b82f6");
    this.setTooltip("Send a new email.");
  },
};

Blockly.Blocks["gmail_mark_read"] = {
  init: function () {
    this.appendDummyInput().appendField("Mark current email as read");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#3b82f6");
    this.setTooltip("Mark the current email as read.");
  },
};

Blockly.Blocks["gmail_archive"] = {
  init: function () {
    this.appendDummyInput().appendField("Archive current email");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#3b82f6");
    this.setTooltip("Archive the current email.");
  },
};

// Gmail generators
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
// AI BLOCKS (green #10b981)
// ===========================================================================

Blockly.Blocks["ai_analyze"] = {
  init: function () {
    this.appendValueInput("INPUT").setCheck(null).appendField("AI Analyze");
    this.appendDummyInput()
      .appendField("Task:")
      .appendField(new Blockly.FieldTextInput("Analyze sentiment"), "TASK")
      .appendField("Save result as:")
      .appendField(new Blockly.FieldTextInput("analysis"), "VAR_NAME");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#10b981");
    this.setTooltip("Analyze text with AI.");
  },
};

Blockly.Blocks["ai_generate"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("AI Generate:")
      .appendField(new Blockly.FieldTextInput("Write a poem"), "PROMPT")
      .appendField("save as:")
      .appendField(new Blockly.FieldTextInput("generated"), "VAR_NAME");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#10b981");
    this.setTooltip("Generate text with AI.");
  },
};

Blockly.Blocks["ai_extract"] = {
  init: function () {
    this.appendValueInput("INPUT")
      .setCheck(null)
      .appendField("AI Extract from");
    this.appendDummyInput()
      .appendField("what to extract:")
      .appendField(new Blockly.FieldTextInput("key points"), "WHAT")
      .appendField("save as:")
      .appendField(new Blockly.FieldTextInput("extracted"), "VAR_NAME");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#10b981");
    this.setTooltip("Extract information from text using AI.");
  },
};

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

javascriptGenerator.forBlock["ai_generate"] = function (block) {
  const prompt = block.getFieldValue("PROMPT").replace(/"/g, '\\"');
  const varName = block.getFieldValue("VAR_NAME");
  return `const ${varName} = await context.callAI("", "${prompt}");\n`;
};

javascriptGenerator.forBlock["ai_extract"] = function (block) {
  const input =
    javascriptGenerator.valueToCode(
      block,
      "INPUT",
      javascriptGenerator.ORDER_NONE
    ) || '""';
  const what = block.getFieldValue("WHAT");
  const varName = block.getFieldValue("VAR_NAME");
  return `const ${varName} = await context.callAI(${input}, "Extract: ${what}");\n`;
};

// ===========================================================================
// DATA BLOCKS (gray #6b7280)
// ===========================================================================

Blockly.Blocks["simple_text"] = {
  init: function () {
    this.appendDummyInput()
      .appendField('"')
      .appendField(new Blockly.FieldTextInput("text"), "TEXT")
      .appendField('"');
    this.setOutput(true, "String");
    this.setColour("#6b7280");
    this.setTooltip("A simple text value.");
  },
};

Blockly.Blocks["get_variable"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Get variable:")
      .appendField(new Blockly.FieldTextInput("myVar"), "VAR_NAME");
    this.setOutput(true, null);
    this.setColour("#6b7280");
    this.setTooltip("Get the value of a variable.");
  },
};

Blockly.Blocks["combine_text"] = {
  init: function () {
    this.appendValueInput("TEXT1").setCheck(null).appendField("Combine");
    this.appendValueInput("TEXT2").setCheck(null).appendField("with");
    this.setOutput(true, "String");
    this.setColour("#6b7280");
    this.setTooltip("Combine two text values.");
  },
};

javascriptGenerator.forBlock["simple_text"] = function (block) {
  const text = block.getFieldValue("TEXT").replace(/"/g, '\\"');
  return [`"${text}"`, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock["get_variable"] = function (block) {
  const varName = block.getFieldValue("VAR_NAME");
  return [varName, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock["combine_text"] = function (block) {
  const text1 =
    javascriptGenerator.valueToCode(
      block,
      "TEXT1",
      javascriptGenerator.ORDER_ADDITION
    ) || '""';
  const text2 =
    javascriptGenerator.valueToCode(
      block,
      "TEXT2",
      javascriptGenerator.ORDER_ADDITION
    ) || '""';
  return [
    `String(${text1}) + String(${text2})`,
    javascriptGenerator.ORDER_ADDITION,
  ];
};

// ===========================================================================
// OUTPUT BLOCKS (pink #ec4899)
// ===========================================================================

Blockly.Blocks["display_result"] = {
  init: function () {
    this.appendValueInput("RESULT")
      .setCheck(null)
      .appendField("Display result:");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#ec4899");
    this.setTooltip("Display a result in the output panel.");
  },
};

Blockly.Blocks["log_message"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Log message:")
      .appendField(new Blockly.FieldTextInput("Step completed"), "MESSAGE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#ec4899");
    this.setTooltip("Log a message to the output.");
  },
};

javascriptGenerator.forBlock["display_result"] = function (block) {
  const res =
    javascriptGenerator.valueToCode(
      block,
      "RESULT",
      javascriptGenerator.ORDER_NONE
    ) || '""';
  return `context.output(${res});\n`;
};

javascriptGenerator.forBlock["log_message"] = function (block) {
  const message = block.getFieldValue("MESSAGE").replace(/"/g, '\\"');
  return `context.log("${message}");\n`;
};

// ===========================================================================
// UTILITY BLOCKS (teal #0d9488)
// ===========================================================================

Blockly.Blocks["wait_delay"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Wait")
      .appendField(
        new Blockly.FieldDropdown([
          ["1 sec", "1"],
          ["5 sec", "5"],
          ["10 sec", "10"],
          ["30 sec", "30"],
        ]),
        "SECONDS"
      );
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour("#0d9488");
    this.setTooltip("Wait for a specified amount of time.");
  },
};

javascriptGenerator.forBlock["wait_delay"] = function (block) {
  return `await context.delay(${block.getFieldValue("SECONDS")});\n`;
};
