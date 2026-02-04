import React, { useEffect, useRef, useCallback } from "react";
import useBuilderStore from "../store/builderStore";
import Header from "../components/builder-ui/Header";
import InfoBanner from "../components/builder-ui/InfoBanner";
import TemplatesPanel from "../components/builder-ui/TemplatesPanel";
import OutputPanel from "../components/builder-ui/OutputPanel";
import CodePanel from "../components/builder-ui/CodePanel";
import MainContent from "../components/builder-ui/MainContent";
import Footer from "../components/builder-ui/Footer";
import GmailPromptModal from "../components/builder-ui/GmailPromptModal";
import AccountManagerModal from "../components/builder-ui/AccountManagerModal";
import DisconnectConfirmModal from "../components/builder-ui/DisconnectConfirmModal";
import "./Builder.css";


// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------
export default function Builder() {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);

  // Get all state and functions from the store
  const {
    // State
    isRunning,
    outputItems,
    showOutput,
    showCode,
    generatedCode,
    showTemplates,
    gmailConnected,
    gmailUserEmail,
    gmailTestMode,
    groqApiCalls,
    showGmailPrompt,
    showAccountManager,
    showDisconnectConfirm,

    // Actions
    setShowOutput,
    setShowCode,
    setShowTemplates,
    checkGmailStatus,
    loadTemplate,
    runWorkflow,
    handleShowCode,
    handleSave,
    handleClear,
    connectGmail,
    disconnectGmail,
    setShowGmailPrompt,
    setShowAccountManager,
    setShowDisconnectConfirm,
    outputClass,
  } = useBuilderStore();

  // Listen for postMessage from the OAuth popup
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

  // Function to initialize the workspace with initial blocks
  const initializeWorkspace = useCallback((workspace) => {
    if (workspace) {
      /* drop a starter block */
      const starter = workspace.newBlock("agent_start");
      starter.initSvg();
      starter.render();
      starter.moveBy(100, 80);
    }
  }, []);

  // -----------------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------------
  return (
    <div className="builder">
      <Header
        showTemplates={showTemplates}
        setShowTemplates={setShowTemplates}
        handleClear={() => handleClear(workspace.current)}
        handleShowCode={() => handleShowCode(workspace.current)}
        showCode={showCode}
        handleSave={() => handleSave(workspace.current)}
        gmailConnected={gmailConnected}
        gmailUserEmail={gmailUserEmail}
        connectGmail={connectGmail}
        runWorkflow={() => runWorkflow(workspace.current)}
        isRunning={isRunning}
        showOutput={showOutput}
      />

      <InfoBanner
        gmailConnected={gmailConnected}
        gmailTestMode={gmailTestMode}
        groqApiCalls={groqApiCalls}
      />

      <TemplatesPanel
        showTemplates={showTemplates}
        setShowTemplates={setShowTemplates}
        loadTemplate={(key) => loadTemplate(workspace.current, key)}
      />

      <MainContent
        workspaceRef={workspace}
        blocklyDivRef={blocklyDiv}
        showOutput={showOutput}
        showCode={showCode}
        onWorkspaceInit={initializeWorkspace}
      />

      {showOutput && (
        <OutputPanel
          showOutput={showOutput}
          setShowOutput={setShowOutput}
          outputItems={outputItems}
          isRunning={isRunning}
          outputClass={outputClass}
        />
      )}

      <CodePanel
        showCode={showCode}
        setShowCode={setShowCode}
        generatedCode={generatedCode}
        showOutput={showOutput}
      />

      <Footer />

      <GmailPromptModal
        showGmailPrompt={showGmailPrompt}
        setShowGmailPrompt={setShowGmailPrompt}
        connectGmail={connectGmail}
      />

      <AccountManagerModal
        showAccountManager={showAccountManager}
        setShowAccountManager={setShowAccountManager}
        gmailTestMode={gmailTestMode}
        gmailUserEmail={gmailUserEmail}
        setShowDisconnectConfirm={setShowDisconnectConfirm}
      />

      <DisconnectConfirmModal
        showDisconnectConfirm={showDisconnectConfirm}
        setShowDisconnectConfirm={setShowDisconnectConfirm}
        disconnectGmail={disconnectGmail}
        gmailUserEmail={gmailUserEmail}
      />
    </div>
  );
}
