import { create } from "zustand";
import { api } from "../services/api";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

// Define the store
const useBuilderStore = create((set, get) => ({
  // Workspace state
  isRunning: false,
  outputItems: [],
  showOutput: false,
  showCode: false,
  generatedCode: "",
  showTemplates: false,

  // Gmail state
  gmailConnected: false,
  gmailUserEmail: null,
  gmailTestMode: true,
  groqApiCalls: 0,

  // Modal state
  showGmailPrompt: false,
  showAccountManager: false,
  showDisconnectConfirm: false,

  // Actions for workspace state
  setIsRunning: (isRunning) => set({ isRunning }),
  setOutputItems: (outputItems) => set({ outputItems }),
  setShowOutput: (showOutput) => set({ showOutput }),
  setShowCode: (showCode) => set({ showCode }),
  setGeneratedCode: (generatedCode) => set({ generatedCode }),
  setShowTemplates: (showTemplates) => set({ showTemplates }),

  // Actions for Gmail state
  setGmailConnected: (gmailConnected) => set({ gmailConnected }),
  setGmailUserEmail: (gmailUserEmail) => set({ gmailUserEmail }),
  setGmailTestMode: (gmailTestMode) => set({ gmailTestMode }),
  setGroqApiCalls: (groqApiCalls) => set({ groqApiCalls }),

  // Actions for modal state
  setShowGmailPrompt: (showGmailPrompt) => set({ showGmailPrompt }),
  setShowAccountManager: (showAccountManager) => set({ showAccountManager }),
  setShowDisconnectConfirm: (showDisconnectConfirm) =>
    set({ showDisconnectConfirm }),

  // Combined actions
  resetState: () =>
    set({
      isRunning: false,
      outputItems: [],
      showOutput: false,
      showCode: false,
      generatedCode: "",
      showTemplates: false,
    }),

  // Template loading functions
  loadTemplate: (workspace, key) => {
    if (!workspace) return;
    workspace.clear();

    const builders = {
      customerSupport: get().buildCustomerSupport,
      salesReport: get().buildSalesReport,
      gmailAutoReply: get().buildGmailAutoReply,
      gmailDigest: get().buildGmailDigest,
    };
    builders[key]?.(workspace);
    set({ showTemplates: false });
  },

  buildCustomerSupport: (workspace) => {
    const ws = workspace;
    const start = ws.newBlock("agent_start");
    const input = ws.newBlock("input_data");
    const analyze = ws.newBlock("ai_analyze");
    const generate = ws.newBlock("ai_generate");
    const display = ws.newBlock("display_result");
    const getAnalysis = ws.newBlock("get_variable");
    const getResponse = ws.newBlock("get_variable");

    start.setFieldValue("support", "AGENT_TYPE");
    input.setFieldValue("emailBody", "FIELD_NAME");
    analyze.setFieldValue(
      "Identify: 1) Main issue, 2) Customer sentiment, 3) Urgency level",
      "TASK"
    );
    analyze.setFieldValue("analysis", "VAR_NAME");
    generate.setFieldValue(
      "Draft a professional, empathetic email response addressing the issue",
      "TASK"
    );
    generate.setFieldValue("response", "VAR_NAME");
    display.setFieldValue("email", "FORMAT");
    getAnalysis.setFieldValue("analysis", "VAR");
    getResponse.setFieldValue("response", "VAR");

    [
      start,
      input,
      analyze,
      generate,
      display,
      getAnalysis,
      getResponse,
    ].forEach((b) => {
      b.initSvg();
      b.render();
    });

    start.moveBy(50, 50);
    analyze.moveBy(50, 200);
    input.moveBy(380, 200);
    generate.moveBy(50, 380);
    getAnalysis.moveBy(380, 380);
    display.moveBy(50, 560);
    getResponse.moveBy(380, 560);

    try {
      start.getInput("STEPS").connection.connect(analyze.previousConnection);
      analyze.getInput("INPUT").connection.connect(input.outputConnection);
      analyze.nextConnection.connect(generate.previousConnection);
      generate
        .getInput("INPUT")
        .connection.connect(getAnalysis.outputConnection);
      generate.nextConnection.connect(display.previousConnection);
      display
        .getInput("RESULT")
        .connection.connect(getResponse.outputConnection);
    } catch (e) {
      console.error("[template]", e.message);
    }
  },

  buildSalesReport: (workspace) => {
    const ws = workspace;
    const start = ws.newBlock("agent_start");
    const input = ws.newBlock("input_data");
    const analyze = ws.newBlock("ai_analyze");
    const generate = ws.newBlock("ai_generate");
    const display = ws.newBlock("display_result");
    const getAnalysis = ws.newBlock("get_variable");
    const getReport = ws.newBlock("get_variable");

    start.setFieldValue("sales", "AGENT_TYPE");
    input.setFieldValue("reportData", "FIELD_NAME");
    analyze.setFieldValue(
      "Calculate: 1) Total revenue, 2) Best region, 3) Key trends",
      "TASK"
    );
    analyze.setFieldValue("insights", "VAR_NAME");
    generate.setFieldValue(
      "Create an executive summary with key metrics and recommendations",
      "TASK"
    );
    generate.setFieldValue("report", "VAR_NAME");
    display.setFieldValue("report", "FORMAT");
    getAnalysis.setFieldValue("insights", "VAR");
    getReport.setFieldValue("report", "VAR");

    [start, input, analyze, generate, display, getAnalysis, getReport].forEach(
      (b) => {
        b.initSvg();
        b.render();
      }
    );

    start.moveBy(50, 50);
    analyze.moveBy(50, 200);
    input.moveBy(380, 200);
    generate.moveBy(50, 380);
    getAnalysis.moveBy(380, 380);
    display.moveBy(50, 560);
    getReport.moveBy(380, 560);

    try {
      start.getInput("STEPS").connection.connect(analyze.previousConnection);
      analyze.getInput("INPUT").connection.connect(input.outputConnection);
      analyze.nextConnection.connect(generate.previousConnection);
      generate
        .getInput("INPUT")
        .connection.connect(getAnalysis.outputConnection);
      generate.nextConnection.connect(display.previousConnection);
      display.getInput("RESULT").connection.connect(getReport.outputConnection);
    } catch (e) {
      console.error("[template]", e.message);
    }
  },

  buildGmailAutoReply: (workspace) => {
    const ws = workspace;
    const start = ws.newBlock("agent_start");
    const fetch = ws.newBlock("gmail_fetch_unread");
    const loop = ws.newBlock("gmail_for_each_email");
    const getBody = ws.newBlock("gmail_get_property");
    const aiReply = ws.newBlock("gmail_ai_reply");
    const sendReply = ws.newBlock("gmail_send_reply");
    const markRead = ws.newBlock("gmail_mark_read");
    const archive = ws.newBlock("gmail_archive");

    start.setFieldValue("email", "AGENT_TYPE");
    fetch.setFieldValue("5", "MAX_EMAILS");
    fetch.setFieldValue("emails", "VAR_NAME");
    loop.setFieldValue("emails", "EMAIL_LIST");
    getBody.setFieldValue("body", "PROPERTY");
    aiReply.setFieldValue("Be professional, helpful, and concise", "TASK");
    aiReply.setFieldValue("aiReply", "VAR_NAME");
    sendReply.setFieldValue("aiReply", "REPLY_VAR");

    [
      start,
      fetch,
      loop,
      getBody,
      aiReply,
      sendReply,
      markRead,
      archive,
    ].forEach((b) => {
      b.initSvg();
      b.render();
    });

    start.moveBy(60, 40);
    fetch.moveBy(60, 180);
    loop.moveBy(60, 310);
    aiReply.moveBy(100, 440);
    sendReply.moveBy(100, 590);
    markRead.moveBy(100, 700);
    archive.moveBy(100, 790);
    getBody.moveBy(480, 440);

    try {
      start.getInput("STEPS").connection.connect(fetch.previousConnection);
      fetch.nextConnection.connect(loop.previousConnection);
      loop.getInput("DO").connection.connect(aiReply.previousConnection);
      aiReply.nextConnection.connect(sendReply.previousConnection);
      sendReply.nextConnection.connect(markRead.previousConnection);
      markRead.nextConnection.connect(archive.previousConnection);
    } catch (e) {
      console.error("[template gmail-auto-reply]", e.message);
    }
  },

  buildGmailDigest: (workspace) => {
    const ws = workspace;
    const start = ws.newBlock("agent_start");
    const fetch = ws.newBlock("gmail_fetch_unread");
    const loop = ws.newBlock("gmail_for_each_email");
    const getSub = ws.newBlock("gmail_get_property");
    const getFrom = ws.newBlock("gmail_get_property");
    const combine = ws.newBlock("combine_text");
    const display = ws.newBlock("display_result");

    start.setFieldValue("email", "AGENT_TYPE");
    fetch.setFieldValue("10", "MAX_EMAILS");
    fetch.setFieldValue("emails", "VAR_NAME");
    loop.setFieldValue("emails", "EMAIL_LIST");
    getSub.setFieldValue("subject", "PROPERTY");
    getFrom.setFieldValue("from", "PROPERTY");

    [start, fetch, loop, getSub, getFrom, combine, display].forEach((b) => {
      b.initSvg();
      b.render();
    });

    start.moveBy(60, 40);
    fetch.moveBy(60, 180);
    loop.moveBy(60, 310);
    combine.moveBy(100, 440);
    getFrom.moveBy(480, 420);
    getSub.moveBy(480, 490);
    display.moveBy(100, 580);

    try {
      start.getInput("STEPS").connection.connect(fetch.previousConnection);
      fetch.nextConnection.connect(loop.previousConnection);
      loop.getInput("DO").connection.connect(combine.previousConnection);
      combine.getInput("TEXT1").connection.connect(getFrom.outputConnection);
      combine.getInput("TEXT2").connection.connect(getSub.outputConnection);
      combine.nextConnection.connect(display.previousConnection);
      display.getInput("RESULT").connection.connect(combine.outputConnection);
    } catch (e) {
      console.error("[template digest]", e.message);
    }
  },

  // Run workflow function
  runWorkflow: async (workspace) => {
    if (!workspace) return;

    set({ isRunning: true });
    set({ outputItems: [] });
    set({ showOutput: true });

    try {
      const code = javascriptGenerator.workspaceToCode(workspace);
      set({ generatedCode: code });

      const blocks = workspace.getAllBlocks();
      if (blocks.length === 0) {
        set((state) => ({
          outputItems: [
            {
              type: "error",
              content: "No blocks in workspace.",
              timestamp: new Date().toISOString(),
            },
          ],
        }));
        set({ isRunning: false });
        return;
      }

      const { gmailConnected } = get();
      /* If a Gmail block is present but user hasn't connected, prompt them */
      const hasGmailBlock = blocks.some((b) => b.type?.startsWith?.("gmail_"));
      if (hasGmailBlock && !gmailConnected) {
        set({ showGmailPrompt: true });
        set({ isRunning: false });
        return;
      }

      /* Determine agent type for sample data */
      const startBlock = blocks.find((b) => b.type === "agent_start");
      const agentType = startBlock?.getFieldValue("AGENT_TYPE") || "support";

      /* send to Dorian's server */
      set((state) => ({
        outputItems: [
          {
            type: "log",
            content: `🚀 Starting ${agentType} agent…`,
            timestamp: new Date().toISOString(),
          },
        ],
      }));

      const result = await api.executeWorkflow({
        blocks: blocks.map((b) => ({
          type: b.type,
          fields: b.getFieldValue ? {} : {},
        })),
        agentType,
        code,
      });

      /* merge server logs into output */
      if (result.logs?.length) {
        set((state) => ({
          outputItems: [
            ...state.outputItems,
            ...result.logs.map((l) => ({
              type: "log",
              content: l.message || l,
              timestamp: l.timestamp || new Date().toISOString(),
            })),
          ],
        }));
      }

      set((state) => ({
        outputItems: [
          ...state.outputItems,
          {
            type: "success",
            content: "✅ Workflow completed successfully.",
            timestamp: new Date().toISOString(),
          },
        ],
      }));

      get().checkGmailStatus();
    } catch (error) {
      console.error("[run]", error);
      set((state) => ({
        outputItems: [
          ...state.outputItems,
          {
            type: "error",
            content: error.message || "Unknown error",
            timestamp: new Date().toISOString(),
          },
        ],
      }));
    } finally {
      set({ isRunning: false });
    }
  },

  // Helper functions
  handleShowCode: (workspace) => {
    if (!workspace) return;
    try {
      const code = javascriptGenerator.workspaceToCode(workspace);
      set({ generatedCode: code || "// No blocks to generate code from." });
    } catch (e) {
      set({ generatedCode: `// Error: ${e.message}` });
    }
    set((state) => ({ showCode: !state.showCode }));
  },

  handleSave: (workspace) => {
    if (!workspace) return;
    const state = Blockly.serialization.workspaces.save(workspace);
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  handleClear: (workspace) => {
    if (!workspace) return;
    if (!window.confirm("Clear the entire workspace?")) return;
    workspace.clear();

    const starter = workspace.newBlock("agent_start");
    starter.initSvg();
    starter.render();
    starter.moveBy(100, 80);

    set({
      outputItems: [],
      showOutput: false,
      generatedCode: "",
    });
  },

  // Gmail related functions
  checkGmailStatus: async () => {
    try {
      const data = await api.checkAuthStatus();
      set({
        gmailConnected: data.authenticated,
        gmailUserEmail: data.email || null,
        gmailTestMode: data.testMode ?? true,
        groqApiCalls: data.groqApiCalls || 0,
      });
    } catch (err) {
      console.error("[gmail] status check failed:", err.message);
      set({
        gmailConnected: false,
        gmailUserEmail: null,
        gmailTestMode: true,
        groqApiCalls: 0,
      });
    }
  },

  connectGmail: () => {
    const { setShowGmailPrompt, setShowAccountManager } = get();

    /* open the OAuth URL in a popup */
    const popup = window.open(
      api.getAuthUrl(),
      "gmailAuth",
      "width=600,height=700,resizable=yes"
    );

    /* fallback poll in case postMessage doesn't fire */
    const interval = setInterval(async () => {
      try {
        const data = await api.checkAuthStatus();
        if (data.authenticated) {
          set({
            gmailConnected: true,
            gmailUserEmail: data.email || null,
            gmailTestMode: data.testMode ?? true,
          });
          setShowGmailPrompt(false);
          setShowAccountManager(false);
          clearInterval(interval);
          if (popup && !popup.closed) popup.close();
        }
      } catch (e) {
        /* ignore */
      }
    }, 2000);

    setTimeout(() => clearInterval(interval), 120_000);
  },

  disconnectGmail: async () => {
    const { setShowAccountManager, setShowDisconnectConfirm } = get();

    try {
      await api.logout();
      set({
        gmailConnected: false,
        gmailUserEmail: null,
      });
      setShowAccountManager(false);
      setShowDisconnectConfirm(false);
    } catch (err) {
      console.error("[gmail] disconnect error:", err.message);
    }
  },

  // Output class helper
  outputClass: (type) => {
    const map = {
      log: "output-log",
      success: "output-success",
      error: "output-error",
      warning: "output-warning",
      info: "output-info",
      "ai-generated": "output-ai",
      "ai-result": "output-ai",
      "email-preview": "output-email",
      "email-sending": "output-email",
      "email-sent": "output-success",
      "test-mode": "output-warning",
      result: "output-result",
    };
    return map[type] || "output-log";
  },
}));

export default useBuilderStore;
