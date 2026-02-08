import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Box,
  Zap,
  Mail,
  Brain,
  Database,
  GitBranch,
  PlayCircle,
  ArrowRight,
  Code,
  Workflow,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Navigation from '../components/layout/Navigation';
import './DocsPage.css';

const DocsPage = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', label: 'Getting Started', icon: <PlayCircle size={16} /> },
    { id: 'blocks', label: 'Block Reference', icon: <Box size={16} /> },
    { id: 'examples', label: 'Examples', icon: <Workflow size={16} /> },
    { id: 'api', label: 'API Reference', icon: <Code size={16} /> }
  ];

  const blockCategories = [
    {
      name: 'Control Flow',
      color: '#FFAB19',
      blocks: [
        { name: 'Start', description: 'Entry point for your workflow' },
        { name: 'If/Else', description: 'Conditional branching logic' },
        { name: 'Loop', description: 'Repeat actions multiple times' },
        { name: 'Wait', description: 'Pause execution for a duration' }
      ]
    },
    {
      name: 'Input',
      color: '#5CB1D6',
      blocks: [
        { name: 'Get User Input', description: 'Collect data from user' },
        { name: 'Get Variable', description: 'Retrieve stored value' },
        { name: 'Get Email Data', description: 'Extract email information' }
      ]
    },
    {
      name: 'Gmail',
      color: '#FFBF00',
      blocks: [
        { name: 'Get Emails', description: 'Fetch emails from inbox' },
        { name: 'Send Email', description: 'Send an email message' },
        { name: 'Reply to Email', description: 'Reply to a specific email' },
        { name: 'Mark as Read', description: 'Mark email as read' },
        { name: 'Archive Email', description: 'Archive an email' }
      ]
    },
    {
      name: 'AI',
      color: '#9966FF',
      blocks: [
        { name: 'AI Generate Text', description: 'Generate text with AI' },
        { name: 'AI Analyze', description: 'Analyze text with AI' },
        { name: 'AI Summarize', description: 'Create summaries' },
        { name: 'AI Extract Data', description: 'Extract structured data' }
      ]
    },
    {
      name: 'Data',
      color: '#59C059',
      blocks: [
        { name: 'Set Variable', description: 'Store a value' },
        { name: 'Transform Data', description: 'Modify data structure' },
        { name: 'Filter List', description: 'Filter array items' },
        { name: 'Merge Data', description: 'Combine data sources' }
      ]
    }
  ];

  const examples = [
    {
      title: 'Email Auto-Reply',
      description: 'Automatically respond to incoming emails with AI-generated replies',
      steps: [
        'Connect Gmail integration',
        'Add "Get Emails" block with filter',
        'Add "AI Generate Text" block for reply',
        'Add "Send Email" block to respond'
      ],
      difficulty: 'Beginner'
    },
    {
      title: 'Customer Support Agent',
      description: 'Intelligent agent that categorizes and responds to support emails',
      steps: [
        'Fetch unread support emails',
        'Use AI to categorize urgency',
        'Generate personalized responses',
        'Send replies and update labels'
      ],
      difficulty: 'Intermediate'
    },
    {
      title: 'Daily Email Digest',
      description: 'Summarize important emails and send daily report',
      steps: [
        'Get emails from last 24 hours',
        'Filter by importance criteria',
        'AI summarize each email',
        'Compile and send digest'
      ],
      difficulty: 'Beginner'
    }
  ];

  return (
    <div className="docs-page">
      <Navigation />

      <div className="docs-container">
        {/* Sidebar */}
        <aside className="docs-sidebar">
          <div className="docs-sidebar__header">
            <BookOpen size={20} />
            <h2>Documentation</h2>
          </div>

          <nav className="docs-nav">
            {sections.map(section => (
              <button
                key={section.id}
                className={`docs-nav__item ${activeSection === section.id ? 'docs-nav__item--active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.icon}
                <span>{section.label}</span>
              </button>
            ))}
          </nav>

          <div className="docs-sidebar__footer">
            <Link to="/builder" className="docs-sidebar__cta">
              <Zap size={16} />
              <span>Try the Builder</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="docs-content">
          {activeSection === 'getting-started' && (
            <motion.div
              key="getting-started"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="docs-title">Getting Started</h1>
              <p className="docs-lead">
                Build your first AI workflow in minutes. No coding required.
              </p>

              <section className="docs-section">
                <h2>Quick Start</h2>
                <div className="docs-steps">
                  <div className="docs-step">
                    <div className="docs-step__number">1</div>
                    <div className="docs-step__content">
                      <h3>Create an Account</h3>
                      <p>Sign up to get 100 free credits and start building workflows.</p>
                    </div>
                  </div>

                  <div className="docs-step">
                    <div className="docs-step__number">2</div>
                    <div className="docs-step__content">
                      <h3>Connect Integrations</h3>
                      <p>Link your Gmail account or other services you want to automate.</p>
                    </div>
                  </div>

                  <div className="docs-step">
                    <div className="docs-step__number">3</div>
                    <div className="docs-step__content">
                      <h3>Build Your Workflow</h3>
                      <p>Drag blocks onto the canvas and connect them to create logic.</p>
                    </div>
                  </div>

                  <div className="docs-step">
                    <div className="docs-step__number">4</div>
                    <div className="docs-step__content">
                      <h3>Run & Deploy</h3>
                      <p>Test your workflow and deploy it to run automatically.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="docs-section">
                <h2>Core Concepts</h2>

                <div className="docs-concept">
                  <div className="docs-concept__icon">
                    <Box size={24} />
                  </div>
                  <div className="docs-concept__content">
                    <h3>Blocks</h3>
                    <p>
                      Blocks are the building units of workflows. Each block performs a specific action like fetching emails,
                      generating AI responses, or storing data. Drag blocks from the toolbox and connect them to build logic.
                    </p>
                  </div>
                </div>

                <div className="docs-concept">
                  <div className="docs-concept__icon">
                    <GitBranch size={24} />
                  </div>
                  <div className="docs-concept__content">
                    <h3>Connections</h3>
                    <p>
                      Connect blocks to define the flow of your workflow. Data flows from one block to the next,
                      allowing you to chain actions together and build complex automation.
                    </p>
                  </div>
                </div>

                <div className="docs-concept">
                  <div className="docs-concept__icon">
                    <Database size={24} />
                  </div>
                  <div className="docs-concept__content">
                    <h3>Variables</h3>
                    <p>
                      Store and reuse data throughout your workflow. Variables let you save information like email content,
                      AI responses, or user input to use in later blocks.
                    </p>
                  </div>
                </div>
              </section>

              <div className="docs-callout docs-callout--info">
                <AlertCircle size={20} />
                <div>
                  <strong>Need help?</strong> Check out the <button onClick={() => setActiveSection('examples')}>examples</button> or visit our community forum.
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'blocks' && (
            <motion.div
              key="blocks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="docs-title">Block Reference</h1>
              <p className="docs-lead">
                Complete reference for all available blocks in Dorian.
              </p>

              {blockCategories.map((category, idx) => (
                <section key={idx} className="docs-section">
                  <div className="docs-category-header">
                    <div
                      className="docs-category-badge"
                      style={{ backgroundColor: category.color }}
                    />
                    <h2>{category.name}</h2>
                  </div>

                  <div className="docs-blocks">
                    {category.blocks.map((block, blockIdx) => (
                      <div key={blockIdx} className="docs-block">
                        <div
                          className="docs-block__indicator"
                          style={{ backgroundColor: category.color }}
                        />
                        <div className="docs-block__content">
                          <h3>{block.name}</h3>
                          <p>{block.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </motion.div>
          )}

          {activeSection === 'examples' && (
            <motion.div
              key="examples"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="docs-title">Workflow Examples</h1>
              <p className="docs-lead">
                Learn by example. Explore common workflow patterns and use cases.
              </p>

              <div className="docs-examples">
                {examples.map((example, idx) => (
                  <div key={idx} className="docs-example">
                    <div className="docs-example__header">
                      <h3>{example.title}</h3>
                      <span className={`docs-badge docs-badge--${example.difficulty.toLowerCase()}`}>
                        {example.difficulty}
                      </span>
                    </div>
                    <p className="docs-example__description">{example.description}</p>

                    <div className="docs-example__steps">
                      <h4>Steps:</h4>
                      <ol>
                        {example.steps.map((step, stepIdx) => (
                          <li key={stepIdx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <Link to="/builder" className="docs-example__cta">
                      <PlayCircle size={16} />
                      Try this workflow
                    </Link>
                  </div>
                ))}
              </div>

              <div className="docs-callout docs-callout--success">
                <CheckCircle size={20} />
                <div>
                  <strong>Want to contribute?</strong> Share your workflows with the community!
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'api' && (
            <motion.div
              key="api"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="docs-title">API Reference</h1>
              <p className="docs-lead">
                Programmatic access to Dorian workflows and execution.
              </p>

              <section className="docs-section">
                <h2>Authentication</h2>
                <p>All API requests require authentication via session cookies.</p>

                <div className="docs-code-block">
                  <div className="docs-code-header">
                    <span>POST /api/user/login</span>
                  </div>
                  <pre><code>{`{
  "email": "user@example.com",
  "password": "your-password"
}`}</code></pre>
                </div>
              </section>

              <section className="docs-section">
                <h2>Workflows</h2>

                <div className="docs-api-endpoint">
                  <div className="docs-api-method">GET</div>
                  <code>/api/user/workflows</code>
                </div>
                <p>Retrieve all workflows for the authenticated user.</p>

                <div className="docs-api-endpoint">
                  <div className="docs-api-method docs-api-method--post">POST</div>
                  <code>/api/user/workflows</code>
                </div>
                <p>Create a new workflow.</p>

                <div className="docs-code-block">
                  <div className="docs-code-header">
                    <span>Request Body</span>
                  </div>
                  <pre><code>{`{
  "name": "My Workflow",
  "description": "Automated email responses",
  "blocklyState": { ... },
  "agentType": "email"
}`}</code></pre>
                </div>
              </section>

              <section className="docs-section">
                <h2>Execution</h2>

                <div className="docs-api-endpoint">
                  <div className="docs-api-method docs-api-method--post">POST</div>
                  <code>/api/workflows/execute</code>
                </div>
                <p>Execute a workflow with generated code.</p>

                <div className="docs-code-block">
                  <div className="docs-code-header">
                    <span>Request Body</span>
                  </div>
                  <pre><code>{`{
  "code": "// Generated JavaScript",
  "agentType": "email",
  "blocks": { ... }
}`}</code></pre>
                </div>
              </section>

              <section className="docs-section">
                <h2>Credits</h2>

                <div className="docs-api-endpoint">
                  <div className="docs-api-method">GET</div>
                  <code>/api/user/credits</code>
                </div>
                <p>Get current credit balance and usage statistics.</p>

                <div className="docs-code-block">
                  <div className="docs-code-header">
                    <span>Response</span>
                  </div>
                  <pre><code>{`{
  "success": true,
  "credits": 95,
  "totalCreditsUsed": 5,
  "subscriptionTier": "free"
}`}</code></pre>
                </div>
              </section>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DocsPage;
