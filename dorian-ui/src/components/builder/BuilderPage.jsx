import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Save, Settings, Grid, Zap, Mail, Database, Brain } from 'lucide-react';
import Navigation from '../layout/Navigation';
import WorkflowCanvas from './WorkflowCanvas';
import BlockPalette from './BlockPalette';
import PropertiesPanel from './PropertiesPanel';
import './BuilderPage.css';

const BuilderPage = () => {
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);

  const blockTypes = [
    {
      id: 'trigger',
      category: 'Triggers',
      items: [
        { 
          type: 'webhook', 
          label: 'Webhook Trigger', 
          icon: <Zap size={16} />,
          color: '#D4745C',
          description: 'Trigger workflow via HTTP request'
        },
        { 
          type: 'schedule', 
          label: 'Schedule', 
          icon: <Grid size={16} />,
          color: '#6B8E99',
          description: 'Run workflow on a schedule'
        }
      ]
    },
    {
      id: 'actions',
      category: 'Actions',
      items: [
        { 
          type: 'gmail', 
          label: 'Gmail', 
          icon: <Mail size={16} />,
          color: '#EA4335',
          description: 'Send or read emails'
        },
        { 
          type: 'database', 
          label: 'Database', 
          icon: <Database size={16} />,
          color: '#4A90E2',
          description: 'Query or update data'
        },
        { 
          type: 'ai', 
          label: 'AI Processing', 
          icon: <Brain size={16} />,
          color: '#7B61FF',
          description: 'Use AI models'
        }
      ]
    }
  ];

  const handleAddBlock = (blockType) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type: blockType.type,
      label: blockType.label,
      icon: blockType.icon,
      color: blockType.color,
      position: { x: 100 + blocks.length * 30, y: 100 + blocks.length * 30 },
      properties: {}
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleBlockUpdate = (blockId, updates) => {
    setBlocks(blocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    ));
  };

  const handleBlockDelete = (blockId) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
    setConnections(connections.filter(conn => 
      conn.from !== blockId && conn.to !== blockId
    ));
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
  };

  const handleRunWorkflow = () => {
    console.log('Running workflow...', { blocks, connections });
    // Add your workflow execution logic here
  };

  const handleSaveWorkflow = () => {
    const workflow = { blocks, connections };
    console.log('Saving workflow...', workflow);
    // Add your save logic here
  };

  return (
    <div className="builder-page">
      <Navigation />
      
      <div className="builder-page__container">
        {/* Toolbar */}
        <motion.div 
          className="builder-toolbar"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="builder-toolbar__left">
            <h1 className="builder-toolbar__title">Untitled Workflow</h1>
            <span className="builder-toolbar__status">
              <span className="builder-toolbar__status-indicator" />
              Draft
            </span>
          </div>
          <div className="builder-toolbar__right">
            <button className="builder-toolbar__button" onClick={handleSaveWorkflow}>
              <Save size={16} />
              Save
            </button>
            <button className="builder-toolbar__button" onClick={() => {}}>
              <Settings size={16} />
              Settings
            </button>
            <button 
              className="builder-toolbar__button builder-toolbar__button--primary" 
              onClick={handleRunWorkflow}
            >
              <Play size={16} />
              Run
            </button>
          </div>
        </motion.div>

        <div className="builder-page__main">
          {/* Block Palette */}
          <AnimatePresence>
            {isPaletteOpen && (
              <BlockPalette 
                blockTypes={blockTypes}
                onAddBlock={handleAddBlock}
                onClose={() => setIsPaletteOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* Canvas */}
          <WorkflowCanvas
            blocks={blocks}
            connections={connections}
            selectedBlock={selectedBlock}
            onBlockSelect={setSelectedBlock}
            onBlockUpdate={handleBlockUpdate}
            onBlockDelete={handleBlockDelete}
            onConnectionCreate={(from, to) => {
              setConnections([...connections, { id: `conn-${Date.now()}`, from, to }]);
            }}
          />

          {/* Properties Panel */}
          <AnimatePresence>
            {isPropertiesOpen && selectedBlock && (
              <PropertiesPanel 
                block={selectedBlock}
                onUpdate={(updates) => handleBlockUpdate(selectedBlock.id, updates)}
                onClose={() => setIsPropertiesOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Toggle buttons for panels */}
        {!isPaletteOpen && (
          <button 
            className="builder-page__panel-toggle builder-page__panel-toggle--left"
            onClick={() => setIsPaletteOpen(true)}
          >
            <Grid size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default BuilderPage;
