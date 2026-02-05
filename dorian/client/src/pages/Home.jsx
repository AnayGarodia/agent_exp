import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-badge">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="6" fill="currentColor" />
            </svg>
            <span>Visual AI Workflow Builder</span>
          </div>

          <h1 className="hero-title">
            Build AI Agents
            <br />
            <span className="hero-title-gradient">Without Writing Code</span>
          </h1>

          <p className="hero-description">
            Drag, drop, and connect blocks to create powerful AI workflows. From
            email automation to data analysis, build intelligent agents in
            minutes.
          </p>

          <div className="hero-actions">
            <Link to="/builder" className="btn-primary btn-lg">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 4v12M4 10h12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Start Building
            </Link>
            <button className="btn-secondary btn-lg">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path d="M8 8l6 4-6 4V8z" fill="currentColor" />
              </svg>
              Watch Demo
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">20+</div>
              <div className="hero-stat-label">Pre-built Blocks</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-value">4</div>
              <div className="hero-stat-label">Quick Templates</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-value">∞</div>
              <div className="hero-stat-label">Possibilities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Everything you need</h2>
            <p className="section-description">
              Powerful building blocks for your AI workflows
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon feature-icon--control">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Control Flow</h3>
              <p className="feature-description">
                Smart triggers and conditional logic to control your workflow
                execution
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon--gmail">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M22 6l-10 7L2 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Gmail Integration</h3>
              <p className="feature-description">
                Read, send, and automate emails with powerful Gmail blocks
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon--ai">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="feature-title">AI Processing</h3>
              <p className="feature-description">
                Analyze, generate, and extract information with AI-powered
                blocks
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon--data">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="7"
                    height="7"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <rect
                    x="14"
                    y="3"
                    width="7"
                    height="7"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <rect
                    x="14"
                    y="14"
                    width="7"
                    height="7"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <rect
                    x="3"
                    y="14"
                    width="7"
                    height="7"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Data Handling</h3>
              <p className="feature-description">
                Process, combine, and transform data throughout your workflow
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon--output">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Rich Output</h3>
              <p className="feature-description">
                Display results, log messages, and track workflow execution in
                real-time
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon--utility">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 1v6m0 6v6M23 12h-6m-6 0H1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Utilities</h3>
              <p className="feature-description">
                Delays, logging, and helper blocks to fine-tune your workflows
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="templates">
        <div className="templates-container">
          <div className="section-header">
            <h2 className="section-title">Quick Start Templates</h2>
            <p className="section-description">
              Pre-built workflows to get you started instantly
            </p>
          </div>

          <div className="templates-grid">
            <div className="template-card">
              <div className="template-header">
                <span className="template-icon">📧</span>
                <span className="template-badge">Popular</span>
              </div>
              <h3 className="template-title">Customer Support</h3>
              <p className="template-description">
                Analyze customer emails and generate professional responses
                automatically
              </p>
              <div className="template-tags">
                <span className="template-tag">AI</span>
                <span className="template-tag">Gmail</span>
              </div>
            </div>

            <div className="template-card">
              <div className="template-header">
                <span className="template-icon">📊</span>
              </div>
              <h3 className="template-title">Sales Report</h3>
              <p className="template-description">
                Transform raw sales data into executive summaries with key
                insights
              </p>
              <div className="template-tags">
                <span className="template-tag">AI</span>
                <span className="template-tag">Data</span>
              </div>
            </div>

            <div className="template-card template-card--featured">
              <div className="template-header">
                <span className="template-icon">⚡</span>
                <span className="template-badge template-badge--featured">
                  Featured
                </span>
              </div>
              <h3 className="template-title">Gmail Auto-Reply</h3>
              <p className="template-description">
                Fetch unread emails, generate AI replies, send, and archive -
                fully automated
              </p>
              <div className="template-tags">
                <span className="template-tag">AI</span>
                <span className="template-tag">Gmail</span>
                <span className="template-tag">Automation</span>
              </div>
            </div>

            <div className="template-card">
              <div className="template-header">
                <span className="template-icon">📋</span>
              </div>
              <h3 className="template-title">Inbox Digest</h3>
              <p className="template-description">
                Create a daily digest of unread emails with sender and subject
                information
              </p>
              <div className="template-tags">
                <span className="template-tag">Gmail</span>
                <span className="template-tag">Report</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to automate?</h2>
            <p className="cta-description">
              Start building intelligent workflows in minutes, no coding
              required
            </p>
            <Link to="/builder" className="btn-primary btn-lg">
              Launch Builder
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M7 3l8 7-8 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M9 12h6M12 9v6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>Dorian</span>
            </div>
            <p className="footer-text">
              Visual AI workflow builder for everyone
            </p>
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">
              Documentation
            </a>
            <a href="#" className="footer-link">
              GitHub
            </a>
            <a href="#" className="footer-link">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
