import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home">
      {/* ─── Hero Section ─── */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Transform Ideas Into
              </h1>
              <h1 className="hero-title-bold">
                Powerful AI Agents
              </h1>
              <p className="hero-subtitle">
                Visual workflow builder to create, train, and deploy AI agents without writing code.
              </p>
              <Link to="/builder" className="btn-primary">
                Build Your First Agent
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Feature Cards moved up to replace workflow diagram ─── */}
      <section className="features-section">
        <div className="container">
          <div className="feature-cards">
            <div className="minimalist-card">
              <h3 className="card-title">Visual Builder</h3>
              <p className="card-description">Intuitive drag-and-drop interface for building AI workflows</p>
            </div>
            <div className="minimalist-card">
              <h3 className="card-title">AI-Powered</h3>
              <p className="card-description">Advanced language models power your automated workflows</p>
            </div>
            <div className="minimalist-card">
              <h3 className="card-title">One-Click Deploy</h3>
              <p className="card-description">Deploy your agents with a single click to production</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
