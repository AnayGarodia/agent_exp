import React from 'react';
import { motion } from 'framer-motion';
import './StepContainer.css';

const StepContainer = ({ children, onBack, showBack = false }) => {
  return (
    <motion.div
      className="step-container"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {showBack && (
        <button
          className="step-container__back"
          onClick={onBack}
          type="button"
        >
          ← Back
        </button>
      )}
      <div className="step-container__content">{children}</div>
    </motion.div>
  );
};

export default StepContainer;
