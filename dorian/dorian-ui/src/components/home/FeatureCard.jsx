import React from 'react';
import { motion } from 'framer-motion';
import './FeatureCard.css';

const FeatureCard = ({ icon, title, description, index }) => {
  return (
    <motion.div
      className="feature-card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1]
      }}
      whileHover={{ y: -8 }}
    >
      <div className="feature-card__icon">
        {icon}
      </div>
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__description">{description}</p>
      <div className="feature-card__glow" />
    </motion.div>
  );
};

export default FeatureCard;
