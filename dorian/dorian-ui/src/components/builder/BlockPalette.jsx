import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import './BlockPalette.css';

const BlockPalette = ({ blockTypes, onAddBlock, onClose }) => {
  const [expandedCategories, setExpandedCategories] = useState(
    blockTypes.reduce((acc, cat) => ({ ...acc, [cat.id]: true }), {})
  );

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  return (
    <motion.div
      className="block-palette"
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="block-palette__header">
        <h3 className="block-palette__title">Blocks</h3>
        <button 
          className="block-palette__close"
          onClick={onClose}
          aria-label="Close palette"
        >
          <X size={18} />
        </button>
      </div>

      <div className="block-palette__content">
        {blockTypes.map((category) => (
          <div key={category.id} className="block-palette__category">
            <button
              className="block-palette__category-header"
              onClick={() => toggleCategory(category.id)}
            >
              {expandedCategories[category.id] ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              <span>{category.category}</span>
            </button>

            {expandedCategories[category.id] && (
              <motion.div
                className="block-palette__items"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {category.items.map((item, index) => (
                  <motion.div
                    key={index}
                    className="block-palette__item"
                    onClick={() => onAddBlock(item)}
                    whileHover={{ x: 4, backgroundColor: 'var(--color-bg-secondary)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div 
                      className="block-palette__item-icon"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.icon}
                    </div>
                    <div className="block-palette__item-content">
                      <div className="block-palette__item-label">{item.label}</div>
                      <div className="block-palette__item-description">{item.description}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </div>

      <div className="block-palette__footer">
        <p className="block-palette__hint">
          Click to add blocks to canvas
        </p>
      </div>
    </motion.div>
  );
};

export default BlockPalette;
