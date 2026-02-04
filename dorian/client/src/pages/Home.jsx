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
                <span className="gradient-text">Build AI Agents Visually</span>
              </h1>
              <p className="hero-subtitle">
                Drag, drop, deploy. No code required.
              </p>
              <button className="btn-primary btn-glow btn-large">
                Start Building
              </button>
            </div>

            {/* Right Side: Animated Demo Canvas */}
            <div className="demo-canvas">
              <div className="animation-container">
                <div className="node node-1"></div>
                <div className="node node-2"></div>
                <div className="node node-3"></div>
                <div className="connection conn-1"></div>
                <div className="connection conn-2"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Floating Feature Cards ─── */}
      <section className="features-section">
        <div className="container">
          <div className="feature-cards">
            <div className="glass-card">
              <h3 className="card-title">Visual Builder</h3>
              <p className="card-description">Intuitive drag-and-drop interface for building AI workflows</p>
            </div>
            <div className="glass-card">
              <h3 className="card-title">AI-Powered</h3>
              <p className="card-description">Advanced language models power your automated workflows</p>
            </div>
            <div className="glass-card">
              <h3 className="card-title">One-Click Deploy</h3>
              <p className="card-description">Deploy your agents with a single click to production</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
