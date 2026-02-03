import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home">
      {/* ─── Hero ─── */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">No-code AI automation</div>
          <h1 className="hero-title">
            Automate your business
            <br />
            <span className="hero-title-accent">without writing code</span>
          </h1>
          <p className="hero-description">
            Drag and drop AI-powered blocks to handle your emails, data, and
            daily tasks — the way Scratch taught a generation to program.
          </p>
          <div className="hero-actions">
            <Link
              to="/builder"
              className="btn-primary btn-large hero-cta-primary"
            >
              Launch Builder
            </Link>
            <a href="#how-it-works" className="btn-secondary btn-large">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What you can build</h2>
          </div>

          <div className="feature-grid">
            <div className="feature">
              <div className="feature-icon">⬡</div>
              <h3 className="feature-title">Visual Builder</h3>
              <p className="feature-text">
                Drag and drop blocks to create workflows. If you can play a
                game, you can build an agent.
              </p>
            </div>

            <div className="feature">
              <div className="feature-icon">◎</div>
              <h3 className="feature-title">AI That Works For You</h3>
              <p className="feature-text">
                Powered by large language models to read, analyse, and reply to
                emails and data — automatically.
              </p>
            </div>

            <div className="feature">
              <div className="feature-icon">▤</div>
              <h3 className="feature-title">Ready Templates</h3>
              <p className="feature-text">
                Pre-built workflows for customer support, sales reporting, and
                Gmail auto-replies. Start in seconds.
              </p>
            </div>

            <div className="feature">
              <div className="feature-icon">◐</div>
              <h3 className="feature-title">Real-time Results</h3>
              <p className="feature-text">
                Watch your workflow run step by step. See exactly what the AI
                does at every stage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How it works</h2>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">01</div>
              <h3 className="step-title">Pick a template</h3>
              <p className="step-text">
                Start with a customer support or sales report template, or build
                from a blank canvas.
              </p>
            </div>

            {/* connector line rendered via CSS ::after on .steps */}

            <div className="step">
              <div className="step-number">02</div>
              <h3 className="step-title">Connect your tools</h3>
              <p className="step-text">
                Link your Gmail account with one click. More integrations —
                WhatsApp, Excel — coming soon.
              </p>
            </div>

            <div className="step">
              <div className="step-number">03</div>
              <h3 className="step-title">Run and automate</h3>
              <p className="step-text">
                Hit run. Watch the AI handle your tasks in real time. No code,
                no configuration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta">
        <div className="container">
          <div className="cta-inner">
            <h2 className="cta-title">Ready to save hours every week?</h2>
            <p className="cta-text">
              Build your first AI agent in under five minutes.
            </p>
            <Link to="/builder" className="btn-primary btn-large cta-btn">
              Get Started →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
