import React, { useRef, useEffect } from "react";
import useBuilderStore from "../store/builderStore";
import Header from "../components/builder-ui/Header";
import MainContent from "../components/builder-ui/MainContent";
import CodePanel from "../components/builder-ui/CodePanel";
import OutputPanel from "../components/builder-ui/OutputPanel";
import TemplatesPanel from "../components/builder-ui/TemplatesPanel";
import AccountManagerModal from "../components/builder-ui/AccountManagerModal";
import DisconnectConfirmModal from "../components/builder-ui/DisconnectConfirmModal";
import GmailPromptModal from "../components/builder-ui/GmailPromptModal";
import "./Builder.css";

export default function Builder() {
  const workspaceRef = useRef(null);
  const blocklyDivRef = useRef(null);

  const {
    isRunning,
    outputItems,
    showOutput,
    showCode,
    generatedCode,
    showTemplates,
    gmailConnected,
    gmailUserEmail,
    gmailTestMode,
    showGmailPrompt,
    showAccountManager,
    showDisconnectConfirm,
    setShowOutput,
    setShowCode,
    setShowTemplates,
    setShowGmailPrompt,
    setShowAccountManager,
    setShowDisconnectConfirm,
    runWorkflow,
    handleShowCode,
    handleSave,
    handleClear,
    connectGmail,
    disconnectGmail,
    loadTemplate,
    checkGmailStatus,
    outputClass,
  } = useBuilderStore();

  useEffect(() => {
    checkGmailStatus();
  }, [checkGmailStatus]);

  const handleRunWorkflow = () => {
    runWorkflow(workspaceRef.current);
  };

  const handleShowCodeClick = () => {
    handleShowCode(workspaceRef.current);
  };

  const handleSaveClick = () => {
    handleSave(workspaceRef.current);
  };

  const handleClearClick = () => {
    handleClear(workspaceRef.current);
  };

  const handleLoadTemplate = (templateKey) => {
    loadTemplate(workspaceRef.current, templateKey);
  };

  const handleWorkspaceInit = (workspace) => {
    // Initialize with starter block
    const starter = workspace.newBlock("agent_start");
    starter.initSvg();
    starter.render();
    starter.moveBy(100, 80);
  };

  return (
    <div className="builder">
      <Header
        showTemplates={showTemplates}
        setShowTemplates={setShowTemplates}
        handleClear={handleClearClick}
        handleShowCode={handleShowCodeClick}
        showCode={showCode}
        handleSave={handleSaveClick}
        gmailConnected={gmailConnected}
        gmailUserEmail={gmailUserEmail}
        connectGmail={connectGmail}
        runWorkflow={handleRunWorkflow}
        isRunning={isRunning}
        showOutput={showOutput}
        gmailTestMode={gmailTestMode}
        setShowAccountManager={setShowAccountManager}
      />

      <div className="builder-workspace">
        <MainContent
          workspaceRef={workspaceRef}
          blocklyDivRef={blocklyDivRef}
          showOutput={showOutput}
          showCode={showCode}
          onWorkspaceInit={handleWorkspaceInit}
        />

        <CodePanel
          showCode={showCode}
          setShowCode={setShowCode}
          generatedCode={generatedCode}
          showOutput={showOutput}
        />

        <OutputPanel
          showOutput={showOutput}
          setShowOutput={setShowOutput}
          outputItems={outputItems}
          isRunning={isRunning}
          outputClass={outputClass}
        />
      </div>

      <TemplatesPanel
        showTemplates={showTemplates}
        setShowTemplates={setShowTemplates}
        loadTemplate={handleLoadTemplate}
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

      <GmailPromptModal
        showGmailPrompt={showGmailPrompt}
        setShowGmailPrompt={setShowGmailPrompt}
        connectGmail={connectGmail}
      />
    </div>
  );
}
