import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Link as LinkIcon } from 'lucide-react';
import './WorkflowBlock.css';

const WorkflowBlock = ({ 
  block, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDelete,
  onStartConnection,
  onEndConnection,
  isConnecting 
}) => {
  const blockRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.target.closest('.workflow-block__action')) return;
    
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX - block.position.x,
      y: e.clientY - block.position.y
    };
    onSelect();
    e.stopPropagation();
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;

    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;

    onUpdate({
      position: { x: newX, y: newY }
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  React.useEffect(() => {
    if (isDragging.current) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [block.position]);

  return (
    <motion.div
      ref={blockRef}
      className={`workflow-block ${isSelected ? 'workflow-block--selected' : ''} ${isConnecting ? 'workflow-block--connecting' : ''}`}
      style={{
        position: 'absolute',
        left: block.position.x,
        top: block.position.y,
        borderColor: block.color
      }}
      onMouseDown={handleMouseDown}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <div 
        className="workflow-block__header"
        style={{ backgroundColor: block.color }}
      >
        <div className="workflow-block__icon">
          {block.icon}
        </div>
        <div className="workflow-block__title">{block.label}</div>
      </div>

      <div className="workflow-block__body">
        <div className="workflow-block__type">{block.type}</div>
      </div>

      {isSelected && (
        <motion.div 
          className="workflow-block__actions"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            className="workflow-block__action workflow-block__action--connect"
            onClick={(e) => {
              e.stopPropagation();
              onStartConnection();
            }}
            title="Connect to another block"
          >
            <LinkIcon size={14} />
          </button>
          <button
            className="workflow-block__action workflow-block__action--delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete block"
          >
            <Trash2 size={14} />
          </button>
        </motion.div>
      )}

      {/* Connection points */}
      <div 
        className="workflow-block__port workflow-block__port--input"
        onMouseUp={(e) => {
          e.stopPropagation();
          onEndConnection();
        }}
      />
      <div 
        className="workflow-block__port workflow-block__port--output"
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartConnection();
        }}
      />
    </motion.div>
  );
};

export default WorkflowBlock;
