import React, { useState, useEffect, useRef, useCallback } from "react";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import TOOLBOX from "../config/toolbox";
import "../config/customBlocks"; // registers blocks as a side-effect
import { api } from "../services/api";
import "./Builder.css";

// ---------------------------------------------------------------------------
// BLOCKLY THEME  (identical to MVP)
// ---------------------------------------------------------------------------
const agentTheme = Blockly.Theme.defineTheme("agent_theme", {
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: "#fffbf5",
    toolboxBackgroundColour: "#1a1716",
    toolboxForegroundColour: "#fffbf5",
    flyoutBackgroundColour: "#4a4540",
    flyoutForegroundColour: "#fffbf5",
    flyoutOpacity: 0.95,
    scrollbarColour: "#7c3aed",
    scrollbarOpacity: 0.6,
    insertionMarkerColour: "#7c3aed",
    insertionMarkerOpacity: 0.3,
  },
});

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------
export default function Builder() {
  /* ── refs ── */
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);

  /* ── workspace state ── */
  const [isRunning, setIsRunning] = useState(false);
  const [outputItems, setOutputItems] = useState([]);
  const [showOutput, setShowOutput] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);

  /* ── Gmail state ── */
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailUserEmail, setGmailUserEmail] = useState(null);
  const [gmailTestMode, setGmailTestMode] = useState(true);
  const [groqApiCalls, setGroqApiCalls] = useState(0);

  /* ── modal state ── */
  const [showGmailPrompt, setShowGmailPrompt] = useState(false);
  const [showAccountManager, setShowAccountManager] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  // -----------------------------------------------------------------------
  // GMAIL STATUS  (poll via api.js)
  // -----------------------------------------------------------------------
  const checkGmailStatus = useCallback(async () => {
    try {
      const data = await api.checkAuthStatus();
      setGmailConnected(data.authenticated);
      setGmailUserEmail(data.email || null);
      setGmailTestMode(data.testMode ?? true);
      setGroqApiCalls(data.groqApiCalls || 0);
    } catch (err) {
      console.error("[gmail] status check failed:", err.message);
      setGmailConnected(false);
      setGmailUserEmail(null);
    }
  }, []);

  /* listen for postMessage from the OAuth popup */
  useEffect(() => {
    const handler = (event) => {
      if (event.data?.gmailAuthSuccess) checkGmailStatus();
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [checkGmailStatus]);

  useEffect(() => {
    checkGmailStatus();
  }, [checkGmailStatus]);

  // -----------------------------------------------------------------------
  // GMAIL CONNECT / DISCONNECT
  // -----------------------------------------------------------------------
  const connectGmail = () => {
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
          setGmailConnected(true);
          setGmailUserEmail(data.email || null);
          setGmailTestMode(data.testMode ?? true);
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
  };

  const disconnectGmail = async () => {
    try {
      await api.logout();
      setGmailConnected(false);
      setGmailUserEmail(null);
      setShowAccountManager(false);
      setShowDisconnectConfirm(false);
    } catch (err) {
      console.error("[gmail] disconnect error:", err.message);
    }
  };

  // -----------------------------------------------------------------------
  // BLOCKLY WORKSPACE  (init once)
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!blocklyDiv.current || workspace.current) return;

    workspace.current = Blockly.inject(blocklyDiv.current, {
      toolbox: TOOLBOX,
      theme: agentTheme,
      grid: { spacing: 25, length: 3, colour: "#e5e5e5", snap: true },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.9,
        maxScale: 2,
        minScale: 0.5,
        scaleSpeed: 1.1,
      },
      trashcan: true,
      move: { scrollbars: true, drag: true, wheel: true },
    });

    /* drop a starter block */
    const starter = workspace.current.newBlock("agent_start");
    starter.initSvg();
    starter.render();
    starter.moveBy(100, 80);

    return () => {
      if (workspace.current) {
        workspace.current.dispose();
        workspace.current = null;
      }
    };
  }, []);

  // -----------------------------------------------------------------------
  // TEMPLATES  (4 templates, identical logic to MVP)
  // -----------------------------------------------------------------------
  const loadTemplate = (key) => {
    if (!workspace.current) return;
    workspace.current.clear();

    const builders = {
      customerSupport: buildCustomerSupport,
      salesReport: buildSalesReport,
      gmailAutoReply: buildGmailAutoReply,
      gmailDigest: buildGmailDigest,
    };
    builders[key]?.();
    setShowTemplates(false);
  };

  /* ── Customer Support ── */
  const buildCustomerSupport = () => {
    const ws = workspace.current;
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
  };

  /* ── Sales Report ── */
  const buildSalesReport = () => {
    const ws = workspace.current;
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
  };

  /* ── Gmail Auto-Reply  (the flagship end-to-end demo) ── */
  const buildGmailAutoReply = () => {
    const ws = workspace.current;
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
  };

  /* ── Gmail Digest ── */
  const buildGmailDigest = () => {
    const ws = workspace.current;
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
  };

  // -----------------------------------------------------------------------
  // RUN WORKFLOW  (sends generated code + blocks to server via api.js)
  // -----------------------------------------------------------------------
  const runWorkflow = async () => {
    if (!workspace.current) return;

    setIsRunning(true);
    setOutputItems([]);
    setShowOutput(true);

    try {
      const code = javascriptGenerator.workspaceToCode(workspace.current);
      setGeneratedCode(code);

      const blocks = workspace.current.getAllBlocks();
      if (blocks.length === 0) {
        setOutputItems([
          {
            type: "error",
            content: "No blocks in workspace.",
            timestamp: new Date().toISOString(),
          },
        ]);
        setIsRunning(false);
        return;
      }

      /* If a Gmail block is present but user hasn't connected, prompt them */
      const hasGmailBlock = blocks.some((b) => b.type?.startsWith?.("gmail_"));
      if (hasGmailBlock && !gmailConnected) {
        setShowGmailPrompt(true);
        setIsRunning(false);
        return;
      }

      /* Determine agent type for sample data */
      const startBlock = blocks.find((b) => b.type === "agent_start");
      const agentType = startBlock?.getFieldValue("AGENT_TYPE") || "support";

      /* send to Dorian's server */
      setOutputItems([
        {
          type: "log",
          content: `🚀 Starting ${agentType} agent…`,
          timestamp: new Date().toISOString(),
        },
      ]);

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
        setOutputItems((prev) => [
          ...prev,
          ...result.logs.map((l) => ({
            type: "log",
            content: l.message || l,
            timestamp: l.timestamp || new Date().toISOString(),
          })),
        ]);
      }

      setOutputItems((prev) => [
        ...prev,
        {
          type: "success",
          content: "✅ Workflow completed successfully.",
          timestamp: new Date().toISOString(),
        },
      ]);

      await checkGmailStatus();
    } catch (error) {
      console.error("[run]", error);
      setOutputItems((prev) => [
        ...prev,
        {
          type: "error",
          content: error.message || "Unknown error",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  // -----------------------------------------------------------------------
  // TOOLBAR HELPERS
  // -----------------------------------------------------------------------
  const handleShowCode = () => {
    if (!workspace.current) return;
    try {
      const code = javascriptGenerator.workspaceToCode(workspace.current);
      setGeneratedCode(code || "// No blocks to generate code from.");
    } catch (e) {
      setGeneratedCode(`// Error: ${e.message}`);
    }
    setShowCode((prev) => !prev);
  };

  const handleSave = () => {
    if (!workspace.current) return;
    const state = Blockly.serialization.workspaces.save(workspace.current);
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (!workspace.current) return;
    if (!window.confirm("Clear the entire workspace?")) return;
    workspace.current.clear();

    const starter = workspace.current.newBlock("agent_start");
    starter.initSvg();
    starter.render();
    starter.moveBy(100, 80);

    setOutputItems([]);
    setShowOutput(false);
    setGeneratedCode("");
  };

  // -----------------------------------------------------------------------
  // OUTPUT CLASS HELPER
  // -----------------------------------------------------------------------
  const outputClass = (type) => {
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
  };

  // -----------------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------------
  return (
    <div className="builder">
      {/* ──── HEADER ──── */}
      <div className="builder-header">
        <div className="builder-title">
          <h1>AI Agent Builder</h1>
          <span className="builder-subtitle">drag blocks · run · automate</span>
        </div>

        <div className="builder-actions">
          <button
            className="hdr-btn hdr-btn-secondary"
            onClick={() => setShowTemplates((s) => !s)}
          >
            Templates
          </button>
          <button className="hdr-btn hdr-btn-secondary" onClick={handleClear}>
            Clear
          </button>
          <button
            className="hdr-btn hdr-btn-secondary"
            onClick={handleShowCode}
          >
            {showCode ? "Hide Code" : "Show Code"}
          </button>
          <button className="hdr-btn hdr-btn-secondary" onClick={handleSave}>
            Save
          </button>

          {gmailConnected ? (
            <button
              className="hdr-btn hdr-btn-gmail-connected"
              onClick={() => setShowAccountManager(true)}
            >
              {gmailUserEmail?.split("@")[0] || "Gmail"} ✓
            </button>
          ) : (
            <button className="hdr-btn hdr-btn-gmail" onClick={connectGmail}>
              Connect Gmail
            </button>
          )}

          <button
            className={`hdr-btn hdr-btn-run ${isRunning ? "running" : ""}`}
            onClick={runWorkflow}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <span className="spinner spinner--sm"></span> Running…
              </>
            ) : (
              "▶  Run Workflow"
            )}
          </button>
        </div>
      </div>

      {/* ──── INFO BANNER ──── */}
      {((gmailConnected && gmailTestMode) || groqApiCalls > 0) && (
        <div className="info-banner">
          {gmailConnected && gmailTestMode && (
            <span>TEST MODE — emails validated but not sent externally</span>
          )}
          {groqApiCalls > 0 && (
            <span>AI calls this session: {groqApiCalls}</span>
          )}
        </div>
      )}

      {/* ──── TEMPLATES PANEL ──── */}
      {showTemplates && (
        <div className="templates-panel">
          <div className="templates-header">
            <h3>Quick Start Templates</h3>
            <button
              className="templates-close"
              onClick={() => setShowTemplates(false)}
            >
              &times;
            </button>
          </div>
          <div className="templates-grid">
            <div
              className="template-card"
              onClick={() => loadTemplate("customerSupport")}
            >
              <h4>📧 Customer Support</h4>
              <p>Analyse a customer email and draft a professional response.</p>
            </div>
            <div
              className="template-card"
              onClick={() => loadTemplate("salesReport")}
            >
              <h4>📊 Sales Report</h4>
              <p>Turn sales data into insights and an executive summary.</p>
            </div>
            <div
              className="template-card template-card--highlight"
              onClick={() => loadTemplate("gmailAutoReply")}
            >
              <h4>⚡ Gmail Auto-Reply</h4>
              <p>
                Fetch unread → AI reply → send → archive. Fully wired — just hit
                Run.
              </p>
            </div>
            <div
              className="template-card"
              onClick={() => loadTemplate("gmailDigest")}
            >
              <h4>📋 Inbox Digest</h4>
              <p>Fetch unread emails and display sender + subject for each.</p>
            </div>
          </div>
        </div>
      )}

      {/* ──── MAIN CONTENT ──── */}
      <div className="builder-content">
        {/* Blockly canvas */}
        <div
          ref={blocklyDiv}
          className="blockly-container"
          style={{ width: showOutput || showCode ? "60%" : "100%" }}
        />

        {/* Output panel */}
        {showOutput && (
          <div className="output-panel">
            <div className="output-header">
              <span>⚙ Output</span>
              <button
                className="output-close"
                onClick={() => setShowOutput(false)}
              >
                &times;
              </button>
            </div>
            <div className="output-content">
              {isRunning && outputItems.length === 0 && (
                <div className="output-loading">
                  <div className="spinner"></div>
                  <p>Starting workflow…</p>
                </div>
              )}
              {!isRunning && outputItems.length === 0 && (
                <p className="output-empty">
                  Run your workflow to see output here.
                </p>
              )}
              {outputItems.map((item, i) => (
                <div
                  key={i}
                  className={`output-item ${outputClass(item.type)}`}
                >
                  <div className="output-item-header">
                    <span className="output-type">
                      {item.type.toUpperCase().replace(/-/g, " ")}
                    </span>
                    <span className="output-time">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="output-item-content">{item.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code panel  (shown when output is hidden) */}
        {showCode && !showOutput && (
          <div className="code-panel">
            <div className="code-header">
              <span>Generated Code</span>
              <button className="code-close" onClick={() => setShowCode(false)}>
                &times;
              </button>
            </div>
            <pre className="code-content">{generatedCode}</pre>
          </div>
        )}
      </div>

      {/* ──── FOOTER ──── */}
      <div className="builder-footer">
        <p>
          Tip: Gmail access is requested automatically when a Gmail block runs.
          Try the <strong>Gmail Auto-Reply</strong> template for a fully working
          example.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MODALS
          ═══════════════════════════════════════════════════════════════════ */}

      {/* Gmail Required (mid-execution prompt) */}
      {showGmailPrompt && (
        <div className="modal-overlay">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Gmail Required</h2>
            <p>
              This workflow needs Gmail access to continue. Connect your account
              and it will resume automatically.
            </p>
            <div className="modal-actions">
              <button
                className="modal-btn modal-btn--secondary"
                onClick={() => setShowGmailPrompt(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn modal-btn--primary"
                onClick={() => {
                  connectGmail();
                  setShowGmailPrompt(false);
                }}
              >
                Connect Gmail Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Manager */}
      {showAccountManager && (
        <div
          className="modal-overlay"
          onClick={() => setShowAccountManager(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Gmail Account</h2>
            <p className="modal-status-connected">
              {gmailTestMode ? "⚡ Test Mode Active" : "✓ Connected"}
            </p>
            <div className="modal-email-chip">{gmailUserEmail}</div>
            {gmailTestMode && (
              <div className="modal-test-box">
                <strong>TEST MODE</strong>
                <p>
                  Emails are validated but not sent to external addresses. Only
                  allowed test addresses will actually receive mail.
                </p>
                <p className="modal-test-note">
                  Set TEST_MODE = false in your server .env to enable production
                  sending.
                </p>
              </div>
            )}
            <div className="modal-actions">
              <button
                className="modal-btn modal-btn--secondary"
                onClick={() => setShowAccountManager(false)}
              >
                Close
              </button>
              <button
                className="modal-btn modal-btn--danger"
                onClick={() => setShowDisconnectConfirm(true)}
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Confirm */}
      {showDisconnectConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowDisconnectConfirm(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Disconnect Gmail?</h2>
            <p>
              This removes the saved session for{" "}
              <strong>{gmailUserEmail}</strong>. You'll need to re-authorise
              next time.
            </p>
            <div className="modal-actions">
              <button
                className="modal-btn modal-btn--secondary"
                onClick={() => setShowDisconnectConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn modal-btn--danger"
                onClick={disconnectGmail}
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
