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
  showOutput
}) => {
  return (
    <div className="builder-header">
      <div className="builder-title">
        <h1>Dorian</h1> {/* Changed to just "Dorian" as requested */}
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
            onClick={() => setShowTemplates(false)} // This will close any open modals
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
          disabled={isRunning || showOutput}
        >
          {isRunning ? (
            <>
              <span className="spinner spinner--sm"></span> Running…
            </>
          ) : (
            "Run Workflow" /* Removed ▶ symbol as requested */
          )}
        </button>
      </div>
    </div>
  );
};

export default Header;