import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import {
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import Navigation from '../components/layout/Navigation';
import '../config/customBlocks';
import '../config/blockly.css';
import './DemoPage.css';

const DemoPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const workspaceRef = useRef(null);
  const blocklyDivRef = useRef(null);
  const blockIdsRef = useRef([]);

  const demoSteps = [
    {
      id: 1,
      blockType: 'gmail_fetch',
      action: 'Fetching unread emails...',
      result: 'Found 3 emails requiring responses'
    },
    {
      id: 2,
      blockType: 'ai_analyze',
      action: 'Analyzing email content...',
      result: '2 urgent, 1 informational'
    },
    {
      id: 3,
      blockType: 'ai_generate',
      action: 'Generating AI responses...',
      result: '3 replies generated'
    },
    {
      id: 4,
      blockType: 'gmail_send',
      action: 'Sending emails...',
      result: '3 emails sent successfully'
    }
  ];

  // Initialize Blockly workspace
  useEffect(() => {
    if (!blocklyDivRef.current || workspaceRef.current) return;

    const workspace = Blockly.inject(blocklyDivRef.current, {
      renderer: 'zelos',
      readOnly: true,
      scrollbars: false,
      zoom: {
        controls: false,
        wheel: false,
        startScale: 1.0,
      },
      move: {
        scrollbars: false,
        drag: false,
        wheel: false,
      },
      grid: {
        spacing: 20,
        length: 1,
        colour: 'var(--color-border)',
        snap: false,
      },
    });

    workspaceRef.current = workspace;

    // Create the demo workflow blocks
    const startBlock = workspace.newBlock('agent_start');
    startBlock.setFieldValue('email', 'AGENT_TYPE');
    startBlock.initSvg();
    startBlock.render();
    startBlock.moveBy(50, 30);

    let previousBlock = startBlock;
    const blockIds = [];

    // Add the workflow blocks
    const blocks = [
      { type: 'gmail_fetch_unread' },
      { type: 'ai_analyze' },
      { type: 'ai_generate' },
      { type: 'gmail_send_reply' },
    ];

    blocks.forEach((blockConfig, index) => {
      const block = workspace.newBlock(blockConfig.type);
      block.initSvg();
      block.render();

      // Connect to previous block
      if (previousBlock.nextConnection) {
        previousBlock.nextConnection.connect(block.previousConnection);
      } else if (index === 0 && startBlock.getInput('STEPS')) {
        const stepsConnection = startBlock.getInput('STEPS').connection;
        stepsConnection.connect(block.previousConnection);
      }

      previousBlock = block;
      blockIds.push(block.id);
    });

    blockIdsRef.current = blockIds;

    // Center the blocks
    workspace.scrollCenter();

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, []);

  // Highlight current block
  useEffect(() => {
    if (!workspaceRef.current || !isPlaying) return;

    const blockIds = blockIdsRef.current;

    // Remove all highlights
    blockIds.forEach(id => {
      const block = workspaceRef.current.getBlockById(id);
      if (block) {
        block.unselect();
        // Remove glow class if it exists
        const blockSvg = block.getSvgRoot();
        if (blockSvg) {
          blockSvg.classList.remove('demo-block-active');
          blockSvg.classList.remove('demo-block-complete');
        }
      }
    });

    // Highlight current block
    if (currentStep < blockIds.length) {
      const currentBlockId = blockIds[currentStep];
      const block = workspaceRef.current.getBlockById(currentBlockId);
      if (block) {
        const blockSvg = block.getSvgRoot();
        if (blockSvg) {
          blockSvg.classList.add('demo-block-active');
        }
      }
    }

    // Mark completed blocks
    completedSteps.forEach(stepIndex => {
      if (stepIndex < blockIds.length) {
        const blockId = blockIds[stepIndex];
        const block = workspaceRef.current.getBlockById(blockId);
        if (block) {
          const blockSvg = block.getSvgRoot();
          if (blockSvg) {
            blockSvg.classList.add('demo-block-complete');
          }
        }
      }
    });
  }, [currentStep, isPlaying, completedSteps]);

  // Auto-play timer
  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < demoSteps.length) {
      interval = setInterval(() => {
        setCompletedSteps(prev => [...prev, currentStep]);
        setCurrentStep(prev => prev + 1);

        if (currentStep === demoSteps.length - 1) {
          setIsPlaying(false);
        }
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, demoSteps.length]);

  const handlePlayPause = () => {
    if (currentStep >= demoSteps.length) {
      handleReset();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setIsPlaying(false);
  };

  const isComplete = currentStep >= demoSteps.length;

  return (
    <div className="demo-page">
      <Navigation />

      <div className="demo-container">
        <motion.div
          className="demo-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="demo-badge">
            <Sparkles size={16} />
            <span>Interactive Demo</span>
          </div>
          <h1 className="demo-title">See Dorian in Action</h1>
          <p className="demo-description">
            Watch how an AI workflow automatically handles incoming emails with intelligent responses
          </p>
        </motion.div>

        <div className="demo-workspace">
          {/* Blockly Canvas */}
          <div className="demo-canvas demo-canvas--blockly">
            <div ref={blocklyDivRef} className="demo-blockly-workspace" />
          </div>

          {/* Live Output */}
          <div className="demo-output">
            <div className="demo-output__header">
              <h3>Live Output</h3>
              {isComplete && (
                <motion.span
                  className="demo-output__status"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <CheckCircle size={16} />
                  Complete
                </motion.span>
              )}
            </div>

            <div className="demo-output__content">
              <AnimatePresence mode="wait">
                {currentStep === 0 && !isPlaying && completedSteps.length === 0 && (
                  <motion.div
                    key="idle"
                    className="demo-output__message demo-output__message--idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Play size={32} />
                    <p>Click play to start the demo workflow</p>
                  </motion.div>
                )}

                {isPlaying && currentStep < demoSteps.length && (
                  <motion.div
                    key={`active-${currentStep}`}
                    className="demo-output__log"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="demo-output__log-header">
                      <div className="demo-output__spinner" />
                      <span>{demoSteps[currentStep].action}</span>
                    </div>
                  </motion.div>
                )}

                {completedSteps.map((stepIndex) => (
                  <motion.div
                    key={`result-${stepIndex}`}
                    className="demo-output__log demo-output__log--success"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <CheckCircle size={16} />
                    <span>{demoSteps[stepIndex].result}</span>
                  </motion.div>
                ))}

                {isComplete && (
                  <motion.div
                    key="complete"
                    className="demo-output__message demo-output__message--success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <CheckCircle size={32} />
                    <p>Workflow completed successfully!</p>
                    <p className="demo-output__stats">
                      Processed 3 emails in 10 seconds
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="demo-controls">
          <button
            className="demo-control-btn demo-control-btn--primary"
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <>
                <Pause size={20} />
                Pause
              </>
            ) : isComplete ? (
              <>
                <RotateCcw size={20} />
                Replay
              </>
            ) : (
              <>
                <Play size={20} />
                {currentStep > 0 ? 'Resume' : 'Play Demo'}
              </>
            )}
          </button>

          {currentStep > 0 && (
            <button
              className="demo-control-btn demo-control-btn--secondary"
              onClick={handleReset}
            >
              <RotateCcw size={20} />
              Reset
            </button>
          )}
        </div>

        {/* CTA Section */}
        <motion.div
          className="demo-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2>Ready to build your own?</h2>
          <p>Create custom workflows with our visual builder</p>
          <Link to="/builder" className="demo-cta__button">
            <Sparkles size={18} />
            Open Builder
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default DemoPage;
