import React from "react";

const OutputPanel = ({
  showOutput,
  setShowOutput,
  outputItems,
  isRunning,
  outputClass,
}) => {
  if (!showOutput) return null;

  return (
    <div className="output-panel">
      <div className="output-header">
        <span>Workflow Output</span>
        <button className="panel-close" onClick={() => setShowOutput(false)}>
          ×
        </button>
      </div>

      <div className="output-content">
        {isRunning && outputItems.length === 0 && (
          <div className="output-loading">
            <div
              className="spinner"
              style={{ width: "2rem", height: "2rem" }}
            ></div>
            <p>Starting workflow...</p>
          </div>
        )}

        {!isRunning && outputItems.length === 0 && (
          <div className="output-empty">
            <p>No output yet</p>
            <p style={{ fontSize: "12px" }}>Run your workflow to see results</p>
          </div>
        )}

        {outputItems.map((item, i) => (
          <div key={i} className={`output-item ${outputClass(item.type)}`}>
            <div className="output-item-header">
              <span>{item.type.toUpperCase().replace(/-/g, " ")}</span>
              <span className="output-item-time">
                {new Date(item.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="output-item-content">{item.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutputPanel;
