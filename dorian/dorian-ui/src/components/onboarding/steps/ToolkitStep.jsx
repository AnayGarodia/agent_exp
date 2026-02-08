import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check } from 'lucide-react';
import StepContainer from '../components/StepContainer';
import '../OnboardingFlow.css';

const toolsByCategory = {
  Communication: ['Gmail', 'Outlook', 'Slack', 'Microsoft Teams', 'WhatsApp Business', 'Telegram'],
  Productivity: ['Google Sheets', 'Excel', 'Notion', 'Airtable', 'Asana', 'Trello', 'Monday'],
  'Customer Relationships': ['HubSpot', 'Salesforce', 'Pipedrive', 'Zoho CRM', 'Intercom'],
  Commerce: ['Shopify', 'WooCommerce', 'Stripe', 'Square'],
  Development: ['GitHub', 'GitLab', 'Jira', 'Linear'],
  Automation: ['Zapier', 'Make', 'n8n', 'Custom APIs'],
};

const ToolkitStep = ({ onContinue, onBack, initialData }) => {
  const [selected, setSelected] = useState(initialData?.tools || []);
  const [searchQuery, setSearchQuery] = useState('');

  const allTools = useMemo(() => {
    return Object.values(toolsByCategory).flat();
  }, []);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return toolsByCategory;

    const filtered = {};
    Object.entries(toolsByCategory).forEach(([category, tools]) => {
      const matchingTools = tools.filter((tool) =>
        tool.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchingTools.length > 0) {
        filtered[category] = matchingTools;
      }
    });
    return filtered;
  }, [searchQuery]);

  const handleToggle = (tool) => {
    setSelected((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleContinue = () => {
    onContinue({ tools: selected });
  };

  const handleSkip = () => {
    onContinue({ tools: [] });
  };

  return (
    <StepContainer onBack={onBack} showBack={true}>
      <motion.div
        className="onboarding-step onboarding-step--wide"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="onboarding-step__title">Which tools power your work?</h1>
        <p className="onboarding-step__subtitle">
          We'll prioritize integrations for the tools you use most. Search or browse below.
        </p>

        <div className="onboarding-search">
          <Search size={20} className="onboarding-search__icon" />
          <input
            type="text"
            className="onboarding-search__input"
            placeholder="Search for a tool..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="onboarding-tools">
          {Object.entries(filteredCategories).map(([category, tools]) => (
            <motion.div
              key={category}
              className="onboarding-tools__category"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="onboarding-tools__category-title">{category}</h3>
              <div className="onboarding-tools__grid">
                {tools.map((tool) => (
                  <motion.button
                    key={tool}
                    className={`onboarding-tool ${selected.includes(tool) ? 'onboarding-tool--selected' : ''}`}
                    onClick={() => handleToggle(tool)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="onboarding-tool__name">{tool}</span>
                    {selected.includes(tool) && (
                      <motion.div
                        className="onboarding-tool__check"
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
          ))}

          {Object.keys(filteredCategories).length === 0 && (
            <motion.p
              className="onboarding-tools__empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No tools found. Try a different search term.
            </motion.p>
          )}
        </div>

        <div className="onboarding-actions">
          <button className="onboarding-skip-link" onClick={handleSkip}>
            I'll configure this later
          </button>
          <motion.button
            className="onboarding-button"
            onClick={handleContinue}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
          >
            Continue
          </motion.button>
        </div>
      </motion.div>
    </StepContainer>
  );
};

export default ToolkitStep;
