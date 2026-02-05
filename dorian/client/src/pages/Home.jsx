import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function WorkflowVizBlock({ bg, icon, label }) {
  return (
    <div className="workflow-viz-block" style={{ background: bg }}>
      <span className="workflow-viz-icon" aria-hidden>{icon}</span>
      <span className="workflow-viz-label">{label}</span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="home">
      {/* ─── Hero Section ─── */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-heading">
              <span className="hero-heading-line1">Transform Ideas Into</span>
              <span className="hero-heading-line2">Powerful AI Agents</span>
            </h1>
            <p className="hero-subtitle">
              Visual workflow builder to create, train, and deploy AI agents without writing code.
            </p>
            <Link to="/builder" className="hero-cta">
              Get Started
            </Link>
            <div className="workflow-viz">
              <WorkflowVizBlock bg="#FFA726" icon="⚡" label="Trigger" />
              <span className="workflow-viz-arrow" aria-hidden />
              <WorkflowVizBlock bg="#8B5CF6" icon="◇" label="Action" />
              <span className="workflow-viz-arrow" aria-hidden />
              <WorkflowVizBlock bg="#06B6D4" icon="▸" label="Output" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Feature Cards ─── */}
      <section className="features-section">
        <div className="features-container">
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-card-icon" aria-hidden>▣</div>
              <h3 className="feature-card-title">Visual Builder</h3>
              <p className="feature-card-description">Intuitive drag-and-drop interface for building AI workflows</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon" aria-hidden>◆</div>
              <h3 className="feature-card-title">AI-Powered</h3>
              <p className="feature-card-description">Advanced language models power your automated workflows</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon" aria-hidden>◉</div>
              <h3 className="feature-card-title">One-Click Deploy</h3>
              <p className="feature-card-description">Deploy your agents with a single click to production</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
