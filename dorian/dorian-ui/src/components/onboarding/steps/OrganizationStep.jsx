import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StepContainer from '../components/StepContainer';
import AnimatedInput from '../components/AnimatedInput';
import '../OnboardingFlow.css';

const OrganizationStep = ({ onContinue, onBack, initialData }) => {
  const [organizationName, setOrganizationName] = useState(initialData?.organizationName || '');

  const handleContinue = () => {
    onContinue({ organizationName: organizationName.trim() });
  };

  const handleSkip = () => {
    onContinue({ organizationName: '' });
  };

  return (
    <StepContainer onBack={onBack} showBack={true}>
      <motion.div
        className="onboarding-step"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <button className="onboarding-skip" onClick={handleSkip}>
          Skip this step →
        </button>

        <h1 className="onboarding-step__title">Tell us about your work</h1>
        <p className="onboarding-step__subtitle">
          Understanding your context helps us recommend the right building blocks
        </p>

        <AnimatedInput
          value={organizationName}
          onChange={setOrganizationName}
          placeholder="Acme Inc."
          autoFocus={true}
          onEnter={handleContinue}
          helperText="Company or organization name"
        />

        <motion.button
          className="onboarding-button"
          onClick={handleContinue}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.1 }}
        >
          Continue
        </motion.button>
      </motion.div>
    </StepContainer>
  );
};

export default OrganizationStep;
