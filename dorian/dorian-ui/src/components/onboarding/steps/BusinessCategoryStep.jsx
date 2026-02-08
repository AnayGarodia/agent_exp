import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import StepContainer from '../components/StepContainer';
import '../OnboardingFlow.css';

const categories = [
  { id: 'ecommerce', title: 'E-commerce & Retail', description: 'Managing inventory, orders, and customer service' },
  { id: 'professional', title: 'Professional Services', description: 'Consulting, legal, accounting, or advisory work' },
  { id: 'b2b', title: 'B2B & SaaS', description: 'Building products and serving business customers' },
  { id: 'education', title: 'Education & Training', description: 'Teaching, courses, or educational content' },
  { id: 'healthcare', title: 'Healthcare & Wellness', description: 'Medical, therapy, or health-related services' },
  { id: 'financial', title: 'Financial Services', description: 'Banking, insurance, or investment services' },
  { id: 'creative', title: 'Creative & Agency', description: 'Design, content, marketing, or creative services' },
  { id: 'realestate', title: 'Real Estate & Construction', description: 'Property, development, or building services' },
  { id: 'food', title: 'Food & Hospitality', description: 'Restaurants, catering, or hospitality services' },
  { id: 'technology', title: 'Technology & Startups', description: 'Building software or tech products' },
  { id: 'marketing', title: 'Marketing & Media', description: 'Advertising, PR, or media production' },
  { id: 'other', title: 'Something else', description: "We'll help you find the right fit" },
];

const BusinessCategoryStep = ({ onContinue, onBack, initialData }) => {
  const [selected, setSelected] = useState(initialData?.businessCategory || null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelect = (categoryId) => {
    setSelected(categoryId);
    setIsAnimating(true);

    setTimeout(() => {
      onContinue({ businessCategory: categoryId });
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
        <h1 className="onboarding-step__title">What kind of work do you do?</h1>
        <p className="onboarding-step__subtitle">
          This helps us understand which workflows matter most to you
        </p>

        <div className="onboarding-cards">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              className={`onboarding-card ${selected === category.id ? 'onboarding-card--selected' : ''}`}
              onClick={() => handleSelect(category.id)}
              disabled={isAnimating}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.02, borderColor: 'var(--primary)' }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="onboarding-card__content">
                <h3 className="onboarding-card__title">{category.title}</h3>
                <p className="onboarding-card__description">{category.description}</p>
              </div>
              {selected === category.id && (
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
      </motion.div>
    </StepContainer>
  );
};

export default BusinessCategoryStep;
