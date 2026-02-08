import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as Blockly from "blockly";
import {
  Play,
  Save,
  Code,
  Terminal,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle,
  FolderOpen,
} from "lucide-react";
import Navigation from "../layout/Navigation";
import WorkflowCanvas from "./WorkflowCanvas";
import PropertiesPanel from "./PropertiesPanel";
import GmailPrompt from "./GmailPrompt";
import WorkflowsModal from "./WorkflowsModal";
import useBuilderStore from "../../store/builderStore";
import "./BuilderPage.css";

const BuilderPage = () => {
  const location = useLocation();
  const workspaceRef = useRef(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isToolboxOpen, setIsToolboxOpen] = useState(true);
  const [showGmailBadge, setShowGmailBadge] = useState(false);
  const [prevGmailConnected, setPrevGmailConnected] = useState(false);

  const {
    theme,
    setTheme,
    isRunning,
    outputItems,
    showOutput,
    setShowOutput,
    showCode,
    generatedCode,
    runWorkflow,
    handleSave,
    handleShowCode,
    gmailConnected,
    checkGmailStatus,
    setShowGmailPrompt,
    outputClass,
    currentWorkflowName,
    setShowWorkflowsModal,
  } = useBuilderStore();

  useEffect(() => {
    checkGmailStatus();
  }, [checkGmailStatus]);

  // When OAuth popup sends success, refresh status and close prompt immediately
  useEffect(() => {
    const onMessage = (event) => {
      if (event.data?.type === "gmail-auth-success") {
        checkGmailStatus().then(() => {
          setShowGmailPrompt(false);
        });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [checkGmailStatus, setShowGmailPrompt]);

  // Show Gmail badge for 3 seconds when connection changes
  useEffect(() => {
    if (gmailConnected && !prevGmailConnected) {
      setShowGmailBadge(true);
      const timer = setTimeout(() => {
        setShowGmailBadge(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    setPrevGmailConnected(gmailConnected);
  }, [gmailConnected, prevGmailConnected]);

  // Load template from navigation state
  useEffect(() => {
    const template = location.state?.template;
    if (template && workspaceRef.current && template.blocks) {
      try {
        // Clear workspace first
        workspaceRef.current.clear();
        // Load template blocks
        Blockly.serialization.workspaces.load(template.blocks, workspaceRef.current);
      } catch (error) {
        console.error('Error loading template:', error);
      }
    }
  }, [location.state]);

  const handleRunWorkflow = () => {
    if (workspaceRef.current) {
      runWorkflow(workspaceRef.current);
    }
  };

  const handleSaveWorkflow = () => {
    if (workspaceRef.current) {
      handleSave(workspaceRef.current);
    }
  };

  const handleToggleCode = () => {
    if (workspaceRef.current) {
      handleShowCode(workspaceRef.current);
    }
  };

  const toggleToolbox = () => {
    setIsToolboxOpen(!isToolboxOpen);
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
            <button
              className="builder-toolbar__toolbox-toggle"
              onClick={toggleToolbox}
              title={isToolboxOpen ? "Hide blocks" : "Show blocks"}
            >
              {isToolboxOpen ? (
                <PanelLeftClose size={20} />
              ) : (
                <PanelLeftOpen size={20} />
              )}
            </button>
            <h1 className="builder-toolbar__title">{currentWorkflowName}</h1>
            <span className="builder-toolbar__status">
              <span
                className={`builder-toolbar__status-indicator ${
                  isRunning ? "running" : ""
                }`}
              />
              {isRunning ? "Running..." : "Draft"}
            </span>

            {/* Gmail connected badge - auto-hides after 3 seconds */}
            <AnimatePresence>
              {showGmailBadge && (
                <motion.span
                  className="builder-toolbar__badge builder-toolbar__badge--success"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", duration: 0.5 }}
                >
                  <CheckCircle size={14} />
                  Gmail Connected
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="builder-toolbar__right">
            <button
              className="builder-toolbar__button"
              onClick={() => setShowWorkflowsModal(true)}
              title="Load saved workflow"
            >
              <FolderOpen size={16} />
              <span>Load</span>
            </button>
            <button
              className="builder-toolbar__button"
              onClick={handleSaveWorkflow}
              title="Save workflow"
            >
              <Save size={16} />
              <span>Save</span>
            </button>
            <button
              className="builder-toolbar__button"
              onClick={handleToggleCode}
              title="View generated code"
            >
              <Code size={16} />
              <span>Code</span>
            </button>
            <button
              className="builder-toolbar__button"
              onClick={() => setShowOutput(!showOutput)}
              title="Toggle output panel"
            >
              <Terminal size={16} />
              <span>Output</span>
            </button>
            <button
              className="builder-toolbar__button builder-toolbar__button--primary"
              onClick={handleRunWorkflow}
              disabled={isRunning}
              title="Run workflow"
            >
              <Play size={16} />
              <span>{isRunning ? "Running..." : "Run"}</span>
            </button>
          </div>
        </motion.div>

        <div className="builder-page__main">
          {/* Canvas */}
          <WorkflowCanvas
            workspaceRef={workspaceRef}
            isToolboxOpen={isToolboxOpen}
            onToolboxToggle={toggleToolbox}
          />

          {/* Properties Panel */}
          <AnimatePresence>
            {isPropertiesOpen && selectedBlock && (
              <PropertiesPanel
                block={selectedBlock}
                onUpdate={() => {}}
                onClose={() => setIsPropertiesOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* Output Panel */}
          <AnimatePresence>
            {showOutput && (
              <motion.div
                className="builder-output"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
              >
                <div className="builder-output__header">
                  <div className="builder-output__title">
                    <Terminal size={18} />
                    <span>Output</span>
                    {outputItems.length > 0 && (
                      <span className="builder-output__count">
                        {outputItems.length}{" "}
                        {outputItems.length === 1 ? "log" : "logs"}
                      </span>
                    )}
                  </div>
                  <button
                    className="builder-output__close"
                    onClick={() => setShowOutput(false)}
                    title="Close output"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="builder-output__content">
                  {outputItems.length === 0 ? (
                    <div className="builder-output__empty">
                      <Terminal size={32} opacity={0.3} />
                      <p>No output yet.</p>
                      <p className="builder-output__empty-hint">
                        Click <strong>Run</strong> to execute your workflow
                      </p>
                    </div>
                  ) : (
                    outputItems.map((item, index) => (
                      <motion.div
                        key={index}
                        className={`builder-output__item ${outputClass(
                          item.type
                        )}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <span className="builder-output__timestamp">
                          {new Date(item.timestamp).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            }
                          )}
                        </span>
                        <span className="builder-output__message">
                          {item.content}
                        </span>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Code Panel */}
          <AnimatePresence>
            {showCode && (
              <motion.div
                className="builder-code"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
              >
                <div className="builder-code__header">
                  <div className="builder-code__title">
                    <Code size={18} />
                    <span>Generated Code</span>
                  </div>
                  <button
                    className="builder-code__close"
                    onClick={handleToggleCode}
                    title="Close code view"
                  >
                    <X size={16} />
                  </button>
                </div>
                <pre className="builder-code__content">
                  <code>
                    {generatedCode ||
                      "// No blocks to generate code from.\n// Add blocks to your workspace to see generated code here."}
                  </code>
                </pre>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gmail Connection Prompt Modal */}
          <GmailPrompt />

          {/* Workflows Modal */}
          <WorkflowsModal workspaceRef={workspaceRef} />
        </div>
      </div>
    </div>
  );
};

export default BuilderPage;
