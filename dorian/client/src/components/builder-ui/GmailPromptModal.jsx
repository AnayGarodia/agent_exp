import React from "react";

const GmailPromptModal = ({ showGmailPrompt, setShowGmailPrompt, connectGmail }) => {
  if (!showGmailPrompt) return null;

  return (
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
  );
};

export default GmailPromptModal;