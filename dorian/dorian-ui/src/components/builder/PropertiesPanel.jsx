import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import './PropertiesPanel.css';

const PropertiesPanel = ({ block, onUpdate, onClose }) => {
  const [properties, setProperties] = useState(block.properties || {});

  const handlePropertyChange = (key, value) => {
    const newProperties = { ...properties, [key]: value };
    setProperties(newProperties);
    onUpdate({ properties: newProperties });
  };

  const renderPropertyInput = (key, value, type = 'text') => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            className="properties-panel__input properties-panel__textarea"
            value={value || ''}
            onChange={(e) => handlePropertyChange(key, e.target.value)}
            placeholder={`Enter ${key}...`}
            rows={4}
          />
        );
      case 'select':
        return (
          <select
            className="properties-panel__input properties-panel__select"
            value={value || ''}
            onChange={(e) => handlePropertyChange(key, e.target.value)}
          >
            <option value="">Select an option...</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
          </select>
        );
      default:
        return (
          <input
            type={type}
            className="properties-panel__input"
            value={value || ''}
            onChange={(e) => handlePropertyChange(key, e.target.value)}
            placeholder={`Enter ${key}...`}
          />
        );
    }
  };

  const getPropertiesForBlockType = () => {
    switch (block.type) {
      case 'gmail':
        return [
          { key: 'to', label: 'To', type: 'text' },
          { key: 'subject', label: 'Subject', type: 'text' },
          { key: 'body', label: 'Body', type: 'textarea' }
        ];
      case 'webhook':
        return [
          { key: 'url', label: 'Webhook URL', type: 'text' },
          { key: 'method', label: 'Method', type: 'select' }
        ];
      case 'ai':
        return [
          { key: 'model', label: 'Model', type: 'text' },
          { key: 'prompt', label: 'Prompt', type: 'textarea' },
          { key: 'temperature', label: 'Temperature', type: 'number' }
        ];
      case 'database':
        return [
          { key: 'query', label: 'SQL Query', type: 'textarea' },
          { key: 'connection', label: 'Connection String', type: 'text' }
        ];
      default:
        return [
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' }
        ];
    }
  };

  const propertyFields = getPropertiesForBlockType();

  return (
    <motion.div
      className="properties-panel"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="properties-panel__header">
        <div>
          <h3 className="properties-panel__title">Properties</h3>
          <p className="properties-panel__subtitle">{block.label}</p>
        </div>
        <button 
          className="properties-panel__close"
          onClick={onClose}
          aria-label="Close properties"
        >
          <X size={18} />
        </button>
      </div>

      <div className="properties-panel__content">
        <div className="properties-panel__section">
          <h4 className="properties-panel__section-title">Block Information</h4>
          <div className="properties-panel__info">
            <div className="properties-panel__info-item">
              <span className="properties-panel__info-label">Type</span>
              <span className="properties-panel__info-value">{block.type}</span>
            </div>
            <div className="properties-panel__info-item">
              <span className="properties-panel__info-label">ID</span>
              <span className="properties-panel__info-value">{block.id}</span>
            </div>
          </div>
        </div>

        <div className="properties-panel__section">
          <h4 className="properties-panel__section-title">Configuration</h4>
          <div className="properties-panel__fields">
            {propertyFields.map(field => (
              <div key={field.key} className="properties-panel__field">
                <label className="properties-panel__label">
                  {field.label}
                </label>
                {renderPropertyInput(field.key, properties[field.key], field.type)}
              </div>
            ))}
          </div>
        </div>

        <div className="properties-panel__section">
          <h4 className="properties-panel__section-title">Advanced</h4>
          <div className="properties-panel__field">
            <label className="properties-panel__label">
              <input
                type="checkbox"
                checked={properties.enabled !== false}
                onChange={(e) => handlePropertyChange('enabled', e.target.checked)}
              />
              <span>Enabled</span>
            </label>
          </div>
          <div className="properties-panel__field">
            <label className="properties-panel__label">
              <input
                type="checkbox"
                checked={properties.logOutput || false}
                onChange={(e) => handlePropertyChange('logOutput', e.target.checked)}
              />
              <span>Log Output</span>
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertiesPanel;
