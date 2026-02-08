import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import WelcomeStep from './steps/WelcomeStep';
import PersonalStep from './steps/PersonalStep';
import OrganizationStep from './steps/OrganizationStep';
import BusinessCategoryStep from './steps/BusinessCategoryStep';
import TeamSizeStep from './steps/TeamSizeStep';
import PrimaryIntentStep from './steps/PrimaryIntentStep';
import ToolkitStep from './steps/ToolkitStep';
import LoadingStep from './steps/LoadingStep';
import ProgressIndicator from './components/ProgressIndicator';
import './OnboardingFlow.css';

const STORAGE_KEY = 'dorian_onboarding_data';
const COMPLETE_KEY = 'dorian_onboarding_complete';

const TOTAL_STEPS = 7;

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });
  const [isLoading, setIsLoading] = useState(false);

  // Save progress to localStorage
  useEffect(() => {
    if (Object.keys(onboardingData).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(onboardingData));
    }
  }, [onboardingData]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && currentStep > 1 && !isLoading) {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, isLoading]);

  const handleStepComplete = useCallback((stepData) => {
    setOnboardingData((prev) => ({ ...prev, ...stepData }));

    if (currentStep === TOTAL_STEPS) {
      setIsLoading(true);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1 && !isLoading) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep, isLoading]);

  const handleComplete = useCallback(async () => {
    try {
      const finalData = {
        ...onboardingData,
        completedAt: Date.now(),
      };

      // Try to signup via API
      const result = await api.signup({
        email: finalData.email,
        password: finalData.password,
        firstName: finalData.firstName,
        lastName: finalData.lastName,
        organizationName: finalData.organizationName,
        businessCategory: finalData.businessCategory,
        teamSize: finalData.teamSize,
        primaryGoals: finalData.primaryGoals,
        tools: finalData.tools
      });

      if (result.success) {
        // Save user data and completion status
        localStorage.setItem(COMPLETE_KEY, 'true');
        localStorage.setItem('dorian_user', JSON.stringify(result.user));

        // Remove password from stored data
        delete finalData.password;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalData));

        // Navigate to dashboard
        navigate('/dashboard', {
          state: {
            fromOnboarding: true,
            user: result.user
          }
        });
      } else {
        // If signup fails, show error and allow retry
        console.error('Signup failed:', result.error);
        alert(`Failed to create account: ${result.error}\n\nPlease try again or contact support.`);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Signup error:', error);
      // Fallback: save to localStorage only
      const finalData = {
        ...onboardingData,
        completedAt: Date.now(),
      };

      localStorage.setItem(COMPLETE_KEY, 'true');
      delete finalData.password;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalData));

      // Navigate to dashboard anyway
      navigate('/dashboard', {
        state: {
          fromOnboarding: true,
          user: {
            email: finalData.email,
            firstName: finalData.firstName,
            lastName: finalData.lastName
          }
        }
      });
    }
  }, [onboardingData, navigate]);

  const renderStep = () => {
    if (isLoading) {
      return <LoadingStep onComplete={handleComplete} />;
    }

    switch (currentStep) {
      case 1:
        return (
          <WelcomeStep
            onContinue={handleStepComplete}
            initialData={onboardingData}
          />
        );
      case 2:
        return (
          <PersonalStep
            onContinue={handleStepComplete}
            onBack={handleBack}
            initialData={onboardingData}
          />
        );
      case 3:
        return (
          <OrganizationStep
            onContinue={handleStepComplete}
            onBack={handleBack}
            initialData={onboardingData}
          />
        );
      case 4:
        return (
          <BusinessCategoryStep
            onContinue={handleStepComplete}
            onBack={handleBack}
            initialData={onboardingData}
          />
        );
      case 5:
        return (
          <TeamSizeStep
            onContinue={handleStepComplete}
            onBack={handleBack}
            initialData={onboardingData}
          />
        );
      case 6:
        return (
          <PrimaryIntentStep
            onContinue={handleStepComplete}
            onBack={handleBack}
            initialData={onboardingData}
          />
        );
      case 7:
        return (
          <ToolkitStep
            onContinue={handleStepComplete}
            onBack={handleBack}
            initialData={onboardingData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-flow">
      <div className="onboarding-flow__container">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {!isLoading && (
          <ProgressIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
