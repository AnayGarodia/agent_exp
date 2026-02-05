import React from "react";

const TemplatesPanel = ({ showTemplates, setShowTemplates, loadTemplate }) => {
  if (!showTemplates) return null;

  return (
    <>
      <div className="modal-overlay" onClick={() => setShowTemplates(false)}>
        <div className="templates-panel" onClick={(e) => e.stopPropagation()}>
          <div className="templates-header">
            <h3>Templates</h3>
            <button
              className="panel-close"
              onClick={() => setShowTemplates(false)}
            >
              ×
            </button>
          </div>

          <div className="templates-content">
            <div
              className="template-card"
              onClick={() => loadTemplate("customerSupport")}
            >
              <h4>📧 Customer Support</h4>
              <p>Analyze customer emails and generate professional responses</p>
            </div>

            <div
              className="template-card"
              onClick={() => loadTemplate("salesReport")}
            >
              <h4>📊 Sales Report</h4>
              <p>Transform sales data into executive summaries with insights</p>
            </div>

            <div
              className="template-card template-card-highlight"
              onClick={() => loadTemplate("gmailAutoReply")}
            >
              <h4>⚡ Gmail Auto-Reply</h4>
              <p>Fetch unread → AI reply → send → archive. Fully automated.</p>
            </div>

            <div
              className="template-card"
              onClick={() => loadTemplate("gmailDigest")}
            >
              <h4>📋 Inbox Digest</h4>
              <p>
                Create a daily digest of unread emails with sender and subject
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplatesPanel;
