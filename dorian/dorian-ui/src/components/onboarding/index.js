export { default as OnboardingFlow } from './OnboardingFlow';
export { default as WelcomeStep } from './steps/WelcomeStep';
export { default as PersonalStep } from './steps/PersonalStep';
export { default as OrganizationStep } from './steps/OrganizationStep';
export { default as BusinessCategoryStep } from './steps/BusinessCategoryStep';
export { default as TeamSizeStep } from './steps/TeamSizeStep';
export { default as PrimaryIntentStep } from './steps/PrimaryIntentStep';
export { default as ToolkitStep } from './steps/ToolkitStep';
export { default as LoadingStep } from './steps/LoadingStep';

// Utility function to reset onboarding
export const resetOnboarding = () => {
  localStorage.removeItem('dorian_onboarding_data');
  localStorage.removeItem('dorian_onboarding_complete');
};

// Utility function to check if onboarding is complete
export const isOnboardingComplete = () => {
  return localStorage.getItem('dorian_onboarding_complete') === 'true';
};

// Utility function to get onboarding data
export const getOnboardingData = () => {
  const data = localStorage.getItem('dorian_onboarding_data');
  return data ? JSON.parse(data) : null;
};
