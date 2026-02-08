import { create } from "zustand";
import { api } from "../services/api";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

// Helper to map backend log types to UI output types
const mapLogType = (backendType) => {
  const typeMap = {
    info: "info",
    log: "log",
    success: "success",
    error: "error",
    warning: "warning",
    email: "email",
    ai: "ai",
    result: "success",
  };
  return typeMap[backendType] || "log";
};

// Helper to check if workspace has Gmail blocks
const hasGmailBlocks = (workspace) => {
  if (!workspace) return false;

  const blocks = workspace.getAllBlocks();
  const gmailBlockTypes = [
    "gmail_fetch_unread",
    "gmail_search",
    "gmail_send_new", //  Fixed: was "gmail_send_email"
    "gmail_send_reply",
    "gmail_mark_read",
    "gmail_archive",
    "gmail_for_each_email",
    "gmail_get_property",
    "gmail_ai_reply",
  ];

  return blocks.some((block) => gmailBlockTypes.includes(block.type));
};

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
  showWorkflowsModal: false,

  // Saved workflows state
  savedWorkflows: JSON.parse(localStorage.getItem('dorian-saved-workflows') || '[]'),
  currentWorkflowName: 'Untitled Workflow',

  // Theme state
  theme: 'dark',

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
  setShowWorkflowsModal: (showWorkflowsModal) => set({ showWorkflowsModal }),
  setCurrentWorkflowName: (currentWorkflowName) => set({ currentWorkflowName }),

  // Theme actions
  setTheme: (theme) => {
    set({ theme });
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dorian-theme', theme);
  },
  initTheme: () => {
    const saved = localStorage.getItem('dorian-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');
    get().setTheme(initial);
  },

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
    const log = ws.newBlock("log_message");
    const display = ws.newBlock("display_result");
    const summaryVar = ws.newBlock("get_variable");

    start.setFieldValue("email", "AGENT_TYPE");
    fetch.setFieldValue("10", "MAX_EMAILS");
    fetch.setFieldValue("emails", "VAR_NAME");
    loop.setFieldValue("emails", "EMAIL_LIST");
    getSub.setFieldValue("subject", "PROPERTY");
    getFrom.setFieldValue("from", "PROPERTY");
    display.setFieldValue("text", "FORMAT");
    summaryVar.setFieldValue("summary", "VAR");

    [
      start,
      fetch,
      loop,
      getSub,
      getFrom,
      combine,
      log,
      display,
      summaryVar,
    ].forEach((b) => {
      b.initSvg();
      b.render();
    });

    start.moveBy(60, 40);
    fetch.moveBy(60, 180);
    loop.moveBy(60, 310);
    log.moveBy(100, 440);
    display.moveBy(60, 580);
    summaryVar.moveBy(350, 580);

    try {
      start.getInput("STEPS").connection.connect(fetch.previousConnection);
      fetch.nextConnection.connect(loop.previousConnection);
      loop.getInput("DO").connection.connect(log.previousConnection);
      loop.nextConnection.connect(display.previousConnection);
      display
        .getInput("RESULT")
        .connection.connect(summaryVar.outputConnection);
    } catch (e) {
      console.error("[template gmail-digest]", e.message);
    }
  },

  // Main workflow execution function - FIXED
  runWorkflow: async (workspace) => {
    if (!workspace) {
      console.error("[runWorkflow] No workspace provided");
      return;
    }

    if (get().isRunning) {
      console.warn("[runWorkflow] Already running, ignoring");
      return;
    }

    console.log("[runWorkflow] Starting workflow execution...");
    set({ isRunning: true, outputItems: [], showOutput: true });

    try {
      const blocks = workspace.getAllBlocks();

      // Check if workflow has Gmail blocks
      const needsGmail = hasGmailBlocks(workspace);
      const state = get();

      console.log("[runWorkflow] Needs Gmail:", needsGmail);
      console.log("[runWorkflow] Gmail connected:", state.gmailConnected);

      // If Gmail blocks exist but not connected, show prompt
      if (needsGmail && !state.gmailConnected) {
        console.log(
          "[runWorkflow] Gmail required but not connected - showing prompt"
        );

        set((state) => ({
          outputItems: [
            {
              type: "warning",
              content: " This workflow requires Gmail access",
              timestamp: new Date().toISOString(),
            },
            {
              type: "info",
              content: " Please connect your Gmail account to continue",
              timestamp: new Date().toISOString(),
            },
          ],
          showGmailPrompt: true, // Show the Gmail connection modal
          isRunning: false,
        }));

        return;
      }

      // Generate code
      const code = javascriptGenerator.workspaceToCode(workspace);
      console.log(
        "[runWorkflow] Generated code:",
        code.substring(0, 150) + "..."
      );

      if (!code || code.trim() === "") {
        set({
          outputItems: [
            {
              type: "warning",
              content: " No blocks to execute. Add blocks to your workflow.",
              timestamp: new Date().toISOString(),
            },
          ],
          isRunning: false,
        });
        return;
      }

      // Determine agent type
      const startBlock = blocks.find((b) => b.type === "agent_start");
      const agentType = startBlock?.getFieldValue("AGENT_TYPE") || "support";
      console.log("[runWorkflow] Agent type:", agentType);

      // Add initial log
      set((state) => ({
        outputItems: [
          {
            type: "info",
            content: ` Starting ${agentType} agent workflow...`,
            timestamp: new Date().toISOString(),
          },
          {
            type: "log",
            content: ` Workspace has ${blocks.length} blocks`,
            timestamp: new Date().toISOString(),
          },
          {
            type: "log",
            content: ` Sending workflow to backend...`,
            timestamp: new Date().toISOString(),
          },
        ],
      }));

      // Execute workflow via backend
      console.log(
        "[runWorkflow] Calling API with code:",
        code.substring(0, 100) + "..."
      );

      const result = await api.executeWorkflow({
        code, // Send the generated JavaScript code
        agentType,
      });

      console.log("[runWorkflow] Backend response:", result);

      // Check if result exists
      if (!result) {
        throw new Error("No response from backend");
      }

      // Process backend response logs
      if (result.logs && Array.isArray(result.logs)) {
        console.log(
          "[runWorkflow] Processing",
          result.logs.length,
          "logs from backend"
        );

        set((state) => ({
          outputItems: [
            ...state.outputItems,
            ...result.logs.map((logItem) => {
              // Handle both object and string log formats
              const type = mapLogType(logItem.type || "log");
              const content = logItem.message || String(logItem);
              const timestamp = logItem.timestamp || new Date().toISOString();

              console.log("[runWorkflow] Log:", { type, content });

              return {
                type,
                content,
                timestamp,
              };
            }),
          ],
        }));
      } else {
        console.warn("[runWorkflow] No logs in backend response");
      }

      // Add completion message if successful
      if (result.success) {
        console.log("[runWorkflow] Workflow completed successfully");
        set((state) => ({
          outputItems: [
            ...state.outputItems,
            {
              type: "success",
              content: " Workflow completed successfully",
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      } else if (result.error) {
        // Handle backend errors
        console.error("[runWorkflow] Backend error:", result.error);
        set((state) => ({
          outputItems: [
            ...state.outputItems,
            {
              type: "error",
              content: ` Workflow failed: ${result.error}`,
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      }

      // Refresh Gmail status after execution
      get().checkGmailStatus();
    } catch (error) {
      console.error("[runWorkflow] Error:", error);

      // Check if this is a Gmail auth error
      const isGmailAuthError =
        error.message?.includes("Gmail authentication required") ||
        error.message?.includes("Not authenticated") ||
        error.message?.includes("Please connect your Gmail");

      if (isGmailAuthError) {
        console.log("[runWorkflow] Gmail auth error detected - showing prompt");

        set((state) => ({
          outputItems: [
            ...state.outputItems,
            {
              type: "error",
              content: ` ${error.message}`,
              timestamp: new Date().toISOString(),
            },
            {
              type: "info",
              content: " Click the button below to connect Gmail",
              timestamp: new Date().toISOString(),
            },
          ],
          showGmailPrompt: true, // Show the Gmail connection modal
        }));
      } else {
        // Other errors
        let errorMessage = "Unknown error occurred";
        if (error.message) {
          errorMessage = error.message;
        }

        set((state) => ({
          outputItems: [
            ...state.outputItems,
            {
              type: "error",
              content: ` Error: ${errorMessage}`,
              timestamp: new Date().toISOString(),
            },
            {
              type: "warning",
              content: " Check the browser console (F12) for details",
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      }
    } finally {
      set({ isRunning: false });
      console.log("[runWorkflow] Workflow execution finished");
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

    // Prompt for workflow name
    const name = window.prompt("Enter workflow name:", get().currentWorkflowName);
    if (!name) return;

    const state = Blockly.serialization.workspaces.save(workspace);
    const savedWorkflows = get().savedWorkflows;

    // Check if workflow with this name already exists
    const existingIndex = savedWorkflows.findIndex(w => w.name === name);

    const workflow = {
      id: existingIndex >= 0 ? savedWorkflows[existingIndex].id : Date.now().toString(),
      name,
      state,
      createdAt: existingIndex >= 0 ? savedWorkflows[existingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let newWorkflows;
    if (existingIndex >= 0) {
      // Update existing
      newWorkflows = [...savedWorkflows];
      newWorkflows[existingIndex] = workflow;
    } else {
      // Add new
      newWorkflows = [...savedWorkflows, workflow];
    }

    localStorage.setItem('dorian-saved-workflows', JSON.stringify(newWorkflows));
    set({ savedWorkflows: newWorkflows, currentWorkflowName: name });

    // Show success message
    alert(`Workflow "${name}" saved successfully!`);
  },

  loadWorkflow: (workflow, workspace) => {
    if (!workspace || !workflow) return;

    try {
      workspace.clear();
      Blockly.serialization.workspaces.load(workflow.state, workspace);
      set({ currentWorkflowName: workflow.name, showWorkflowsModal: false });

      // Center the workspace on the loaded blocks
      setTimeout(() => {
        const metrics = workspace.getMetrics();
        const blocksBox = workspace.getBlocksBoundingBox();

        if (blocksBox) {
          // Calculate center position
          const centerX = (blocksBox.right + blocksBox.left) / 2;
          const centerY = (blocksBox.bottom + blocksBox.top) / 2;

          // Center the viewport on the blocks
          workspace.scroll(
            centerX - metrics.viewWidth / 2,
            centerY - metrics.viewHeight / 2
          );

          // Optional: zoom to fit all blocks
          workspace.zoomToFit();
        }
      }, 100);
    } catch (e) {
      alert(`Error loading workflow: ${e.message}`);
    }
  },

  deleteWorkflow: (workflowId) => {
    if (!window.confirm("Delete this workflow?")) return;

    const newWorkflows = get().savedWorkflows.filter(w => w.id !== workflowId);
    localStorage.setItem('dorian-saved-workflows', JSON.stringify(newWorkflows));
    set({ savedWorkflows: newWorkflows });
  },

  downloadWorkflow: (workspace) => {
    if (!workspace) return;
    const state = Blockly.serialization.workspaces.save(workspace);
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${get().currentWorkflowName.replace(/\s+/g, '-')}-${Date.now()}.json`;
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

    const authUrl = api.getAuthUrl();
    const popup = window.open(
      authUrl,
      "gmailAuth",
      "width=600,height=700,resizable=yes,scrollbars=yes"
    );

    // If popup was blocked, fall back to same-window redirect
    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      window.location.href = authUrl;
      return;
    }

    // Poll for authentication completion (backup if postMessage is missed)
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
        // Ignore errors during polling
      }
    }, 1500);

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
      ai: "output-ai",
      email: "output-email",
    };
    return map[type] || "output-log";
  },
}));

export default useBuilderStore;
