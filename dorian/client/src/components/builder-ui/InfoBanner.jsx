import React from "react";

const InfoBanner = ({ gmailConnected, gmailTestMode, groqApiCalls }) => {
  return (
    ((gmailConnected && gmailTestMode) || groqApiCalls > 0) && (
      <div className="info-banner">
        {gmailConnected && gmailTestMode && (
          <span>TEST MODE — emails validated but not sent externally</span>
        )}
        {groqApiCalls > 0 && (
          <span>AI calls this session: {groqApiCalls}</span>
        )}
      </div>
    )
  );
};

export default InfoBanner;