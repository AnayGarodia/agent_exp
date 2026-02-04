import React from "react";

const AccountManagerModal = ({ showAccountManager, setShowAccountManager, gmailTestMode, gmailUserEmail, setShowDisconnectConfirm }) => {
  if (!showAccountManager) return null;

  return (
    <div
      className="modal-overlay"
      onClick={() => setShowAccountManager(false)}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Gmail Account</h2>
        <p className="modal-status-connected">
          {gmailTestMode ? "⚡ Test Mode Active" : "✓ Connected"}
        </p>
        <div className="modal-email-chip">{gmailUserEmail}</div>
        {gmailTestMode && (
          <div className="modal-test-box">
            <strong>TEST MODE</strong>
            <p>
              Emails are validated but not sent to external addresses. Only
              allowed test addresses will actually receive mail.
            </p>
            <p className="modal-test-note">
              Set TEST_MODE = false in your server .env to enable production
              sending.
            </p>
          </div>
        )}
        <div className="modal-actions">
          <button
            className="modal-btn modal-btn--secondary"
            onClick={() => setShowAccountManager(false)}
          >
            Close
          </button>
          <button
            className="modal-btn modal-btn--danger"
            onClick={() => setShowDisconnectConfirm(true)}
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountManagerModal;