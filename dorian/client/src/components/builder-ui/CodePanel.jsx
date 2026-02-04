import React from "react";

const CodePanel = ({ showCode, setShowCode, generatedCode, showOutput }) => {
  if (!showCode || showOutput) return null;

  return (
    <div className="code-panel">
      <div className="code-header">
        <span>Generated Code</span>
        <button className="code-close" onClick={() => setShowCode(false)}>
          &times;
        </button>
      </div>
      <pre className="code-content">{generatedCode}</pre>
    </div>
  );
};

export default CodePanel;