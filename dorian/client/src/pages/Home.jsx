import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home">
      {/* ─── Hero Section (50/50 Split) ─── */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            {/* Left Side: Text Content */}
            <div className="hero-text">
              <h1 className="hero-title">
                Transform Ideas Into <span className="gradient-text">Powerful AI Agents</span>
              </h1>
              <p className="hero-subtitle">
                Visual workflow builder to create, train, and deploy AI agents without writing code.
              </p>
              <button className="btn-primary">
                Start Building Today
              </button>
            </div>

            {/* Right Side: Animated Demo Canvas */}
            <div className="demo-canvas">
              <div className="animation-container glass">
                <div className="node trigger-node">
                  <div className="node-icon">⚡</div>
                  <div className="node-title">Trigger</div>
                </div>
                <div className="node action-node">
                  <div className="node-icon">⚙️</div>
                  <div className="node-title">Action</div>
                </div>
                <div className="node output-node">
                  <div className="node-icon">📤</div>
                  <div className="node-title">Output</div>
                </div>
                <div className="connection conn-1"></div>
                <div className="connection conn-2"></div>
                <div className="particle particle-1"></div>
                <div className="particle particle-2"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Floating Feature Cards ─── */}
      <section className="features-section">
        <div className="container">
          <div className="feature-cards">
            <div className="glass-card glass-hover">
              <h3 className="card-title">Visual Builder</h3>
              <p className="card-description">Intuitive drag-and-drop interface for building AI workflows</p>
            </div>
            <div className="glass-card glass-hover">
              <h3 className="card-title">AI-Powered</h3>
              <p className="card-description">Advanced language models power your automated workflows</p>
            </div>
            <div className="glass-card glass-hover">
              <h3 className="card-title">One-Click Deploy</h3>
              <p className="card-description">Deploy your agents with a single click to production</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
