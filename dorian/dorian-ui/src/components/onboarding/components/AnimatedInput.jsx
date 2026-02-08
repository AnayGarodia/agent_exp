import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import './AnimatedInput.css';

const AnimatedInput = ({
  label,
  value,
  onChange,
  error,
  isValid,
  helperText,
  type = 'text',
  placeholder,
  autoFocus = false,
  onEnter,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onEnter && !error && value) {
      onEnter();
    }
  };

  return (
    <div className="animated-input">
      <div className="animated-input__wrapper">
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`animated-input__field ${error ? 'animated-input__field--error' : ''} ${
            isValid ? 'animated-input__field--valid' : ''
          }`}
        />
        {label && (
          <label
            className={`animated-input__label ${value ? 'animated-input__label--floating' : ''}`}
          >
            {label}
          </label>
        )}
        {isValid && (
          <motion.div
            className="animated-input__check"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
          >
            <Check size={16} />
          </motion.div>
        )}
      </div>
      {helperText && !error && (
        <p className="animated-input__helper">{helperText}</p>
      )}
      {error && (
        <motion.p
          className="animated-input__error"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default AnimatedInput;
