import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StepContainer from '../components/StepContainer';
import AnimatedInput from '../components/AnimatedInput';
import '../OnboardingFlow.css';

const PersonalStep = ({ onContinue, onBack, initialData }) => {
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');

  const handleContinue = () => {
    if (firstName.trim()) {
      onContinue({ firstName: firstName.trim(), lastName: lastName.trim() });
    }
  };

  const isValid = firstName.trim().length > 0;

  return (
    <StepContainer onBack={onBack} showBack={true}>
      <motion.div
        className="onboarding-step"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="onboarding-step__title">Let's start with the basics</h1>
        <p className="onboarding-step__subtitle">
          We'd like to personalize your experience
        </p>

        <AnimatedInput
          value={firstName}
          onChange={setFirstName}
          placeholder="First name"
          autoFocus={true}
          onEnter={handleContinue}
          helperText="This helps us make Dorian feel more natural to use"
        />

        <AnimatedInput
          value={lastName}
          onChange={setLastName}
          placeholder="Last name (optional)"
          onEnter={handleContinue}
        />

        <motion.button
          className="onboarding-button"
          onClick={handleContinue}
          disabled={!isValid}
          whileHover={isValid ? { scale: 1.02 } : {}}
          whileTap={isValid ? { scale: 0.98 } : {}}
          transition={{ duration: 0.1 }}
        >
          Continue
        </motion.button>
      </motion.div>
    </StepContainer>
  );
};

export default PersonalStep;
