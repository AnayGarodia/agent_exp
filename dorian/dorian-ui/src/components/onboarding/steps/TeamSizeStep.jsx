import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import StepContainer from '../components/StepContainer';
import '../OnboardingFlow.css';

const teamSizes = [
  { id: 'solo', title: 'Just me', description: "I'm working solo" },
  { id: 'small', title: '2–10 people', description: 'Small team' },
  { id: 'growing', title: '11–50 people', description: 'Growing team' },
  { id: 'midsize', title: '51–200 people', description: 'Mid-size company' },
  { id: 'large', title: '201–1,000 people', description: 'Large organization' },
  { id: 'enterprise', title: '1,000+ people', description: 'Enterprise' },
];

const TeamSizeStep = ({ onContinue, onBack, initialData }) => {
  const [selected, setSelected] = useState(initialData?.teamSize || null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelect = (sizeId) => {
    setSelected(sizeId);
    setIsAnimating(true);

    setTimeout(() => {
      onContinue({ teamSize: sizeId });
    }, 400);
  };

  return (
    <StepContainer onBack={onBack} showBack={true}>
      <motion.div
        className="onboarding-step"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="onboarding-step__title">How large is your team?</h1>
        <p className="onboarding-step__subtitle">
          Understanding your scale helps us suggest the right automation patterns
        </p>

        <div className="onboarding-pills">
          {teamSizes.map((size, index) => (
            <motion.button
              key={size.id}
              className={`onboarding-pill ${selected === size.id ? 'onboarding-pill--selected' : ''}`}
              onClick={() => handleSelect(size.id)}
              disabled={isAnimating}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="onboarding-pill__content">
                <span className="onboarding-pill__title">{size.title}</span>
                <span className="onboarding-pill__description">{size.description}</span>
              </div>
              {selected === size.id && (
                <motion.div
                  className="onboarding-pill__check"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                >
                  <Check size={14} />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </StepContainer>
  );
};

export default TeamSizeStep;
