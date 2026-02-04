import React from "react";

const TemplatesPanel = ({ showTemplates, setShowTemplates, loadTemplate }) => {
  if (!showTemplates) return null;

  return (
    <div className="templates-panel">
      <div className="templates-header">
        <h3>Quick Start Templates</h3>
        <button
          className="templates-close"
          onClick={() => setShowTemplates(false)}
        >
          &times;
        </button>
      </div>
      <div className="templates-grid">
        <div
          className="template-card"
          onClick={() => loadTemplate("customerSupport")}
        >
          <h4>📧 Customer Support</h4>
          <p>Analyse a customer email and draft a professional response.</p>
        </div>
        <div
          className="template-card"
          onClick={() => loadTemplate("salesReport")}
        >
          <h4>📊 Sales Report</h4>
          <p>Turn sales data into insights and an executive summary.</p>
        </div>
        <div
          className="template-card template-card--highlight"
          onClick={() => loadTemplate("gmailAutoReply")}
        >
          <h4>⚡ Gmail Auto-Reply</h4>
          <p>
            Fetch unread → AI reply → send → archive. Fully wired — just hit
            Run.
          </p>
        </div>
        <div
          className="template-card"
          onClick={() => loadTemplate("gmailDigest")}
        >
          <h4>📋 Inbox Digest</h4>
          <p>Fetch unread emails and display sender + subject for each.</p>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPanel;