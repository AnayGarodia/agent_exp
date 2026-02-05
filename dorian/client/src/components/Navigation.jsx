import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

export default function Navigation() {
  const location = useLocation();
  const isBuilder = location.pathname === "/builder";

  return (
    <nav className="nav">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="nav-logo-icon"
          >
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
          <span className="nav-logo-text">Dorian</span>
        </Link>

        {!isBuilder && (
          <div className="nav-actions">
            <Link to="/builder" className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3v10M3 8h10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Launch Builder
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
