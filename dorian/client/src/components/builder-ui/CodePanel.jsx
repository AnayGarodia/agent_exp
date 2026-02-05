import React from "react";

const CodePanel = ({ showCode, setShowCode, generatedCode, showOutput }) => {
  if (!showCode || showOutput) return null;

  return (
    <div className="code-panel">
      <div className="code-header">
        <span>Generated Code</span>
        <button className="panel-close" onClick={() => setShowCode(false)}>
          ×
        </button>
      </div>
      <pre className="code-content">
        {generatedCode || "// No code generated yet"}
      </pre>
    </div>
  );
};

export default CodePanel;
