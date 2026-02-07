import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X, Shield, Zap } from "lucide-react";
import useBuilderStore from "../../store/builderStore";
import "./GmailPrompt.css";

const GmailPrompt = () => {
  const { showGmailPrompt, setShowGmailPrompt, connectGmail, gmailConnected } =
    useBuilderStore();

  const handleConnect = () => {
    connectGmail();
  };

  const handleClose = () => {
    setShowGmailPrompt(false);
  };

  return (
    <AnimatePresence>
      {showGmailPrompt && !gmailConnected && (
        <>
          {/* Backdrop */}
          <motion.div
            className="gmail-prompt-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="gmail-prompt-modal"
            style={{ x: "-50%", y: "-50%" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <button className="gmail-prompt-close" onClick={handleClose}>
              <X size={20} />
            </button>

            <div className="gmail-prompt-content">
              {/* Icon */}
              <div className="gmail-prompt-icon">
                <Mail size={48} />
              </div>

              {/* Title */}
              <h2 className="gmail-prompt-title">Connect Your Gmail</h2>

              {/* Description */}
              <p className="gmail-prompt-description">
                This workflow needs access to your Gmail account to fetch and
                process emails.
              </p>

              {/* Features */}
              <div className="gmail-prompt-features">
                <div className="gmail-prompt-feature">
                  <Shield size={20} />
                  <div>
                    <strong>Secure OAuth</strong>
                    <span>Your credentials stay private</span>
                  </div>
                </div>
                <div className="gmail-prompt-feature">
                  <Zap size={20} />
                  <div>
                    <strong>Read & Send</strong>
                    <span>Fetch, reply, and manage emails</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="gmail-prompt-actions">
                <button
                  className="gmail-prompt-button gmail-prompt-button--secondary"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  className="gmail-prompt-button gmail-prompt-button--primary"
                  onClick={handleConnect}
                >
                  <Mail size={18} />
                  Connect Gmail
                </button>
              </div>

              {/* Fine print */}
              <p className="gmail-prompt-footnote">
                You'll be redirected to Google to authorize access
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GmailPrompt;
