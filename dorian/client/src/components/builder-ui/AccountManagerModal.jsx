import React from "react";

const AccountManagerModal = ({
  showAccountManager,
  setShowAccountManager,
  gmailTestMode,
  gmailUserEmail,
  setShowDisconnectConfirm,
}) => {
  if (!showAccountManager) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowAccountManager(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Gmail Account</h2>
        </div>

        <div className="modal-body">
          <p>
            <strong>
              {gmailTestMode ? "⚡ Test Mode Active" : "✓ Connected"}
            </strong>
          </p>
          <div className="modal-email">{gmailUserEmail}</div>

          {gmailTestMode && (
            <p style={{ fontSize: "13px", color: "#F59E0B" }}>
              Test mode: Emails validated but not sent externally. Set
              TEST_MODE=false in server .env for production.
            </p>
          )}
        </div>

        <div className="modal-actions">
          <button
            className="modal-btn modal-btn-secondary"
            onClick={() => setShowAccountManager(false)}
          >
            Close
          </button>
          <button
            className="modal-btn modal-btn-danger"
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
