import React from "react";

const DisconnectConfirmModal = ({
  showDisconnectConfirm,
  setShowDisconnectConfirm,
  disconnectGmail,
  gmailUserEmail,
}) => {
  if (!showDisconnectConfirm) return null;

  return (
    <div
      className="modal-overlay"
      onClick={() => setShowDisconnectConfirm(false)}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Disconnect Gmail?</h2>
        </div>

        <div className="modal-body">
          <p>
            This will remove the saved session for{" "}
            <strong>{gmailUserEmail}</strong>. You'll need to re-authorize next
            time.
          </p>
        </div>

        <div className="modal-actions">
          <button
            className="modal-btn modal-btn-secondary"
            onClick={() => setShowDisconnectConfirm(false)}
          >
            Cancel
          </button>
          <button
            className="modal-btn modal-btn-danger"
            onClick={disconnectGmail}
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisconnectConfirmModal;
