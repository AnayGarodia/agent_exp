import React from "react";

const InfoBanner = ({ gmailConnected, gmailTestMode, groqApiCalls }) => {
  return (
    (groqApiCalls > 0) && (  /* Only show if there are API calls, not TEST MODE */
      <div className="info-banner">
        {groqApiCalls > 0 && (
          <span>AI calls this session: {groqApiCalls}</span>
        )}
      </div>
    )
  );
};

export default InfoBanner;