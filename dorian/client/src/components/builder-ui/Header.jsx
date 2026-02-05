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
}) => {
  return (
    <header className="builder-header">
      <div className="builder-title-wrap">
        <h1 className="builder-title">AI Agent Builder</h1>
        <p className="builder-subtitle">drag blocks • run • automate</p>
        {gmailTestMode && (
          <span className="builder-test-badge">Test mode</span>
        )}
      </div>

      <div className="builder-actions">
        <button
          className="hdr-btn hdr-btn-outline"
          onClick={() => setShowTemplates((s) => !s)}
        >
          Templates
        </button>
        <button className="hdr-btn hdr-btn-outline" onClick={handleClear}>
          Clear
        </button>
        <button
          className="hdr-btn hdr-btn-outline"
          onClick={handleShowCode}
        >
          {showCode ? "Hide Code" : "Show Code"}
        </button>
        <button className="hdr-btn hdr-btn-outline" onClick={handleSave}>
          Save
        </button>

        {gmailConnected ? (
          <button className="hdr-btn hdr-btn-gmail-connected">
            Gmail ✓
          </button>
        ) : (
          <button className="hdr-btn hdr-btn-gmail" onClick={connectGmail}>
            Connect Gmail
          </button>
        )}

        <button
          className={`hdr-btn hdr-btn-run ${isRunning ? "running" : ""}`}
          onClick={runWorkflow}
          disabled={isRunning || showOutput}
        >
          {isRunning ? (
            <>
              <span className="spinner spinner--sm" /> Running…
            </>
          ) : (
            "▶ Run Workflow"
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;