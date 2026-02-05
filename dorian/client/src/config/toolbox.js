/**
 * Blockly category-based toolbox configuration
 * All blocks referenced here are defined in customBlocks.js
 */
const TOOLBOX = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "Control",
      colour: "#FBBF24", // Logic/router color
      contents: [
        { kind: "block", type: "agent_start" },
        { kind: "block", type: "if_contains" },
      ],
    },
    {
      kind: "category",
      name: "Input",
      colour: "#60A5FA", // Tool/API color
      contents: [{ kind: "block", type: "input_data" }],
    },
    {
      kind: "category",
      name: "Gmail",
      colour: "#60A5FA", // Tool/API color
      contents: [
        { kind: "block", type: "gmail_fetch_unread" },
        { kind: "block", type: "gmail_search" },
        { kind: "block", type: "gmail_for_each_email" },
        { kind: "block", type: "gmail_get_property" },
        { kind: "block", type: "gmail_ai_reply" },
        { kind: "block", type: "gmail_send_reply" },
        { kind: "block", type: "gmail_send_new" },
        { kind: "block", type: "gmail_mark_read" },
        { kind: "block", type: "gmail_archive" },
      ],
    },
    {
      kind: "category",
      name: "AI",
      colour: "#A78BFA", // LLM/prompt color
      contents: [
        { kind: "block", type: "ai_analyze" },
        { kind: "block", type: "ai_generate" },
        { kind: "block", type: "ai_extract" },
      ],
    },
    {
      kind: "category",
      name: "Data",
      colour: "#34D399", // Memory/state color
      contents: [
        { kind: "block", type: "simple_text" },
        { kind: "block", type: "get_variable" },
        { kind: "block", type: "combine_text" },
      ],
    },
    {
      kind: "category",
      name: "Output",
      colour: "#34D399", // Memory/state color
      contents: [
        { kind: "block", type: "display_result" },
        { kind: "block", type: "log_message" },
      ],
    },
    {
      kind: "category",
      name: "Utility",
      colour: "#FBBF24", // Logic/router color
      contents: [{ kind: "block", type: "wait_delay" }],
    },
  ],
};

export default TOOLBOX;
