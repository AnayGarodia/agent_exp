import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

export default function Navigation() {
  const location = useLocation();
  const isBuilder = location.pathname === "/builder";

  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">
        AgentForge
      </Link>

      {!isBuilder && (
        <div className="nav-links">
          <a href="#features" className="nav-link">
            Features
          </a>
          <a href="#how-it-works" className="nav-link">
            How It Works
          </a>
          <Link to="/builder" className="btn-primary nav-cta">
            Launch Builder
          </Link>
        </div>
      )}
    </nav>
  );
}
