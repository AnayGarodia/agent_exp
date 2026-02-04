import React from "react";

const OutputPanel = ({ showOutput, setShowOutput, outputItems, isRunning, outputClass }) => {
  if (!showOutput) return null;

  return (
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
  );
};

export default OutputPanel;