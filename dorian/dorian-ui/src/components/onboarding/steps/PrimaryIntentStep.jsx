import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import StepContainer from '../components/StepContainer';
import '../OnboardingFlow.css';

const intents = [
  { id: 'email', title: 'Email Intelligence', description: 'Automatically categorize, respond to, and surface insights from your inbox' },
  { id: 'customer', title: 'Customer Conversations', description: 'Handle support inquiries and customer questions with AI assistance' },
  { id: 'data', title: 'Data Transformation', description: 'Process, analyze, and extract meaning from your data' },
  { id: 'content', title: 'Content Generation', description: 'Create reports, summaries, and structured content at scale' },
  { id: 'automation', title: 'Process Automation', description: 'Connect your tools and eliminate repetitive manual work' },
  { id: 'leads', title: 'Lead Management', description: 'Qualify prospects and streamline your sales workflow' },
];

const PrimaryIntentStep = ({ onContinue, onBack, initialData }) => {
  const [selected, setSelected] = useState(initialData?.primaryGoals || []);

  const handleToggle = (intentId) => {
    setSelected((prev) =>
      prev.includes(intentId)
        ? prev.filter((id) => id !== intentId)
        : [...prev, intentId]
    );
  };

  const handleContinue = () => {
    if (selected.length > 0) {
      onContinue({ primaryGoals: selected });
    }
  };

  return (
    <StepContainer onBack={onBack} showBack={true}>
      <motion.div
        className="onboarding-step"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="onboarding-step__title">What brings you to Dorian?</h1>
        <p className="onboarding-step__subtitle">
          Choose what you'd like to tackle first. You can explore everything else later.
        </p>

        <div className="onboarding-cards">
          {intents.map((intent, index) => (
            <motion.button
              key={intent.id}
              className={`onboarding-card ${selected.includes(intent.id) ? 'onboarding-card--selected' : ''}`}
              onClick={() => handleToggle(intent.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, borderColor: 'var(--primary)' }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="onboarding-card__content">
                <h3 className="onboarding-card__title">{intent.title}</h3>
                <p className="onboarding-card__description">{intent.description}</p>
              </div>
              {selected.includes(intent.id) && (
                <motion.div
                  className="onboarding-card__check"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                >
                  <Check size={16} />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {selected.length > 0 && (
            <motion.button
              className="onboarding-button"
              onClick={handleContinue}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              Continue
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </StepContainer>
  );
};

export default PrimaryIntentStep;
