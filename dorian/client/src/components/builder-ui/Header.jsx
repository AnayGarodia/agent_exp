import React from "react";

const Header = ({
  showTemplates,
  setShowTemplates,
  handleClear,
  handleShowCode,
  showCode,
  handleSave,
  gmailConnected,
  gmailUserEmail,
  connectGmail,
  runWorkflow,
  isRunning,
  showOutput,
  gmailTestMode,
  setShowAccountManager,
}) => {
  return (
    <header className="builder-header">
      <div className="builder-title-section">
        <div>
          <div className="builder-title">Workflow Builder</div>
          <div className="builder-subtitle">Visual AI automation platform</div>
        </div>
        {gmailTestMode && <span className="test-mode-badge">⚠️ Test Mode</span>}
      </div>

      <div className="builder-actions">
        <button
          className="header-btn"
          onClick={() => setShowTemplates(!showTemplates)}
        >
          Templates
        </button>

        <button className="header-btn" onClick={handleClear}>
          Clear
        </button>

        <button className="header-btn" onClick={handleShowCode}>
          {showCode ? "Hide Code" : "Show Code"}
        </button>

        <button className="header-btn" onClick={handleSave}>
          Save
        </button>

        {gmailConnected ? (
          <button
            className="header-btn header-btn-gmail-connected"
            onClick={() => setShowAccountManager(true)}
          >
            Gmail ✓
          </button>
        ) : (
          <button
            className="header-btn header-btn-gmail"
            onClick={connectGmail}
          >
            Connect Gmail
          </button>
        )}

        <button
          className="header-btn header-btn-run"
          onClick={runWorkflow}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <span className="spinner" />
              Running...
            </>
          ) : (
            "▶ Run"
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
