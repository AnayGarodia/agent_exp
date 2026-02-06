import React from 'react';
import { motion } from 'framer-motion';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  onClick,
  className = '',
  ...props 
}) => {
  const buttonClasses = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    fullWidth && 'button--full',
    disabled && 'button--disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <motion.button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="button__icon">{icon}</span>}
      <span className="button__text">{children}</span>
      {icon && iconPosition === 'right' && <span className="button__icon">{icon}</span>}
    </motion.button>
  );
};

export default Button;
