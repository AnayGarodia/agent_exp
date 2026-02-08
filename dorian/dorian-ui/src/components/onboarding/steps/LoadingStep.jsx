import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import '../OnboardingFlow.css';

const loadingMessages = [
  'Analyzing your workflow patterns...',
  'Configuring recommended templates...',
  'Preparing your integrations...',
  'Building your personalized dashboard...',
  'Almost ready...',
];

const LoadingStep = ({ onComplete }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev < loadingMessages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => {
        setIsComplete(true);
        setTimeout(() => {
          onComplete();
        }, 1000);
      }, 500);
    }
  }, [progress, onComplete]);

  return (
    <div className="loading-step">
      <motion.div
        className="loading-step__content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {!isComplete ? (
          <>
            <h1 className="loading-step__title">Setting up your workspace</h1>

            <div className="loading-step__messages">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentMessageIndex}
                  className="loading-step__message"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {loadingMessages[currentMessageIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="loading-step__progress">
              <div className="loading-step__progress-bar">
                <motion.div
                  className="loading-step__progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                />
              </div>
              <div className="loading-step__progress-text">{progress}%</div>
            </div>
          </>
        ) : (
          <motion.div
            className="loading-step__complete"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
          >
            <div className="loading-step__check">
              <Check size={48} />
            </div>
            <h2 className="loading-step__complete-title">All set</h2>
            <p className="loading-step__complete-message">
              Taking you to your dashboard...
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default LoadingStep;
