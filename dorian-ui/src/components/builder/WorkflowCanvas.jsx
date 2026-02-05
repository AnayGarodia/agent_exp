import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import WorkflowBlock from './WorkflowBlock';
import './WorkflowCanvas.css';

const WorkflowCanvas = ({ 
  blocks, 
  connections, 
  selectedBlock,
  onBlockSelect, 
  onBlockUpdate,
  onBlockDelete,
  onConnectionCreate 
}) => {
  const canvasRef = useRef(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Handle canvas panning
  const handleMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.classList.contains('workflow-canvas__grid')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
    }
  };

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    
    if (isPanning) {
      setCanvasOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    if (connectingFrom) {
      setConnectingFrom(null);
    }
  };

  // Handle zoom
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.max(0.5, Math.min(2, prev * delta)));
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, []);

  // Handle connection creation
  const handleStartConnection = (blockId) => {
    setConnectingFrom(blockId);
  };

  const handleEndConnection = (blockId) => {
    if (connectingFrom && connectingFrom !== blockId) {
      onConnectionCreate(connectingFrom, blockId);
    }
    setConnectingFrom(null);
  };

  // Draw connections
  const renderConnections = () => {
    return connections.map(conn => {
      const fromBlock = blocks.find(b => b.id === conn.from);
      const toBlock = blocks.find(b => b.id === conn.to);
      
      if (!fromBlock || !toBlock) return null;

      const fromPos = {
        x: (fromBlock.position.x + 100) * zoom + canvasOffset.x,
        y: (fromBlock.position.y + 35) * zoom + canvasOffset.y
      };
      
      const toPos = {
        x: (toBlock.position.x) * zoom + canvasOffset.x,
        y: (toBlock.position.y + 35) * zoom + canvasOffset.y
      };

      const midX = (fromPos.x + toPos.x) / 2;
      
      return (
        <svg
          key={conn.id}
          className="workflow-canvas__connection"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          <path
            d={`M ${fromPos.x} ${fromPos.y} C ${midX} ${fromPos.y}, ${midX} ${toPos.y}, ${toPos.x} ${toPos.y}`}
            stroke="var(--color-text-tertiary)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
          />
          <circle cx={fromPos.x} cy={fromPos.y} r="4" fill="var(--color-accent)" />
          <circle cx={toPos.x} cy={toPos.y} r="4" fill="var(--color-accent)" />
        </svg>
      );
    });
  };

  // Draw temporary connection line while dragging
  const renderTempConnection = () => {
    if (!connectingFrom) return null;

    const fromBlock = blocks.find(b => b.id === connectingFrom);
    if (!fromBlock) return null;

    const fromPos = {
      x: (fromBlock.position.x + 100) * zoom + canvasOffset.x,
      y: (fromBlock.position.y + 35) * zoom + canvasOffset.y
    };

    return (
      <svg
        className="workflow-canvas__connection"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        <line
          x1={fromPos.x}
          y1={fromPos.y}
          x2={mousePos.x}
          y2={mousePos.y}
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      </svg>
    );
  };

  return (
    <div 
      ref={canvasRef}
      className="workflow-canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="workflow-canvas__grid" />
      
      {renderConnections()}
      {renderTempConnection()}

      <div 
        className="workflow-canvas__content"
        style={{
          transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`
        }}
      >
        {blocks.length === 0 ? (
          <div className="workflow-canvas__empty">
            <p>Drag blocks from the left panel to start building your workflow</p>
          </div>
        ) : (
          blocks.map(block => (
            <WorkflowBlock
              key={block.id}
              block={block}
              isSelected={selectedBlock?.id === block.id}
              onSelect={() => onBlockSelect(block)}
              onUpdate={(updates) => onBlockUpdate(block.id, updates)}
              onDelete={() => onBlockDelete(block.id)}
              onStartConnection={() => handleStartConnection(block.id)}
              onEndConnection={() => handleEndConnection(block.id)}
              isConnecting={connectingFrom === block.id}
            />
          ))
        )}
      </div>

      {/* Zoom indicator */}
      <div className="workflow-canvas__zoom">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
};

export default WorkflowCanvas;
