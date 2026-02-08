import React from 'react';
import { motion } from 'framer-motion';
import './ProgressIndicator.css';

const ProgressIndicator = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="progress-indicator">
      <div className="progress-indicator__bar">
        <motion.div
          className="progress-indicator__fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      <div className="progress-indicator__text">
        {currentStep} of {totalSteps}
      </div>
    </div>
  );
};

export default ProgressIndicator;
