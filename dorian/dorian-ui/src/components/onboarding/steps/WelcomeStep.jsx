import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StepContainer from '../components/StepContainer';
import AnimatedInput from '../components/AnimatedInput';
import '../OnboardingFlow.css';

const WelcomeStep = ({ onContinue, initialData }) => {
  const [email, setEmail] = useState(initialData?.email || '');
  const [password, setPassword] = useState(initialData?.password || '');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('');
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value) => {
    if (!value) {
      setPasswordError('');
      return false;
    }
    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (value) => {
    if (!value) {
      setConfirmError('');
      return false;
    }
    if (value !== password) {
      setConfirmError('Passwords do not match');
      return false;
    }
    setConfirmError('');
    return true;
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (value) validateEmail(value);
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (value) validatePassword(value);
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    if (value) validateConfirmPassword(value);
  };

  const handleContinue = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(confirmPassword);

    if (isEmailValid && isPasswordValid && isConfirmValid) {
      onContinue({ email, password });
    }
  };

  const isEmailValid = email && !emailError && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password && !passwordError && password.length >= 8;
  const isConfirmValid = confirmPassword && !confirmError && confirmPassword === password;
  const isFormValid = isEmailValid && isPasswordValid && isConfirmValid;

  return (
    <StepContainer>
      <motion.div
        className="onboarding-step"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="onboarding-step__title">Welcome to Dorian</h1>
        <p className="onboarding-step__subtitle">
          We'll help you build powerful AI agents in minutes. First, let's get to know each other.
        </p>

        <p className="onboarding-step__label">What's your email address?</p>

        <AnimatedInput
          value={email}
          onChange={handleEmailChange}
          error={emailError}
          isValid={isEmailValid}
          type="email"
          placeholder="you@example.com"
          autoFocus={true}
          helperText="We'll use this to save your work and send important updates"
        />

        <p className="onboarding-step__label" style={{ marginTop: 'var(--space-xl)' }}>
          Create a password
        </p>

        <AnimatedInput
          value={password}
          onChange={handlePasswordChange}
          error={passwordError}
          isValid={isPasswordValid}
          type="password"
          placeholder="At least 8 characters"
          helperText="Choose a strong password to keep your account secure"
        />

        <AnimatedInput
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          error={confirmError}
          isValid={isConfirmValid}
          type="password"
          placeholder="Confirm your password"
          onEnter={handleContinue}
        />

        <motion.button
          className="onboarding-button"
          onClick={handleContinue}
          disabled={!isFormValid}
          whileHover={isFormValid ? { scale: 1.02 } : {}}
          whileTap={isFormValid ? { scale: 0.98 } : {}}
          transition={{ duration: 0.1 }}
        >
          Continue
        </motion.button>
      </motion.div>
    </StepContainer>
  );
};

export default WelcomeStep;
