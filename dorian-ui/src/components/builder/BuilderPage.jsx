import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Save, Settings, Grid, Zap, Mail, Database, Brain, AlertCircle, ExternalLink } from 'lucide-react';
import Navigation from '../layout/Navigation';
import WorkflowCanvas from './WorkflowCanvas';
import BlockPalette from './BlockPalette';
import PropertiesPanel from './PropertiesPanel';
import api from '../../services/api';
import './BuilderPage.css';

const BuilderPage = () => {
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isPaletteOpen, setIsPaletteOpen] = useState(true);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);
  const [authStatus, setAuthStatus] = useState(null);
  const [showAuthNotification, setShowAuthNotification] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const status = await api.checkAuthStatus();
        setAuthStatus(status);
        
        // Show notification if not authenticated with Gmail
        if (!status.hasGmailTokens) {
          setShowAuthNotification(true);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Still show notification if we can't determine status
        setShowAuthNotification(true);
      }
    };
    
    checkAuth();
  }, []);

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

  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [executionError, setExecutionError] = useState(null);

  const handleRunWorkflow = async () => {
    setIsRunning(true);
    setExecutionResult(null);
    setExecutionError(null);
    
    try {
      console.log('Running workflow...', { blocks, connections });
      
      // Generate code from blocks and connections (this is a simplified version)
      // In a real implementation, this would convert the visual workflow to executable code
      const generatedCode = generateWorkflowCode(blocks, connections);
      
      // Execute the workflow via API
      const result = await api.executeWorkflow({
        code: generatedCode,
        // Add any tokens if available
      });
      
      setExecutionResult(result);
      console.log('Workflow execution result:', result);
    } catch (error) {
      console.error('Error running workflow:', error);
      setExecutionError(error.message || 'Failed to run workflow');
    } finally {
      setIsRunning(false);
    }
  };

  // Helper function to generate code from blocks and connections
  const generateWorkflowCode = (blocks, connections) => {
    // This is a simplified representation - in a real implementation,
    // this would convert the visual workflow to executable JavaScript code
    let code = '';
    
    // Add initial context setup
    code += `
// Dorian Workflow Engine - Generated Code
async function executeWorkflow(context) {
  const { log, fetchEmails, searchEmails, sendNewEmail, sendReply, markRead, archiveEmail, generateReply, callAI, delay } = context;
  
  try {
`;

    // Process blocks in order based on connections
    // For now, we'll just add a simple example
    blocks.forEach(block => {
      switch(block.type) {
        case 'gmail':
          code += `    log("Processing Gmail block: ${block.label}");\n`;
          code += `    // Gmail operations would go here\n`;
          break;
        case 'database':
          code += `    log("Processing Database block: ${block.label}");\n`;
          code += `    // Database operations would go here\n`;
          break;
        case 'ai':
          code += `    log("Processing AI block: ${block.label}");\n`;
          code += `    // AI operations would go here\n`;
          break;
        case 'webhook':
          code += `    log("Processing Webhook block: ${block.label}");\n`;
          code += `    // Webhook trigger would go here\n`;
          break;
        case 'schedule':
          code += `    log("Processing Schedule block: ${block.label}");\n`;
          code += `    // Schedule operations would go here\n`;
          break;
        default:
          code += `    log("Processing block: ${block.label}");\n`;
      }
    });

    code += `
    log("Workflow completed successfully");
  } catch (error) {
    log("Workflow error: " + error.message);
    throw error;
  }
}

// Execute the workflow
await executeWorkflow(context);
`;
    
    return code;
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
              className={`builder-toolbar__button ${isRunning ? 'builder-toolbar__button--loading' : 'builder-toolbar__button--primary'}`}
              onClick={handleRunWorkflow}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <div className="spinner" />
                  Running...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Run
                </>
              )}
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

        {/* Auth Notification */}
        {showAuthNotification && (
          <div className="auth-notification">
            <div className="auth-notification__content">
              <AlertCircle size={16} />
              <span>Not authenticated with Gmail</span>
              <button 
                className="auth-notification__action"
                onClick={() => {
                  window.open(api.getGoogleAuthUrl(), '_blank');
                }}
              >
                Connect Account <ExternalLink size={12} />
              </button>
              <button 
                className="auth-notification__dismiss"
                onClick={() => setShowAuthNotification(false)}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Execution Results Panel */}
        {(executionResult || executionError) && (
          <div className="execution-results-panel">
            <div className="execution-results-header">
              <h3>Execution Results</h3>
              <button 
                className="close-results-btn"
                onClick={() => {
                  setExecutionResult(null);
                  setExecutionError(null);
                }}
              >
                ×
              </button>
            </div>
            
            {executionError && (
              <div className="execution-error">
                <AlertCircle size={16} />
                <span>{executionError}</span>
              </div>
            )}
            
            {executionResult && (
              <div className="execution-success">
                <pre className="execution-logs">
                  {JSON.stringify(executionResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuilderPage;
