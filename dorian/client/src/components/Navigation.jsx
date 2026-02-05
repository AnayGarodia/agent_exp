import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navigation.css";

export default function Navigation() {
  const location = useLocation();
  const isBuilder = location.pathname === "/builder";

  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">
        Dorian
      </Link>

      {!isBuilder && (
        <div className="nav-links">
          <Link to="/builder" className="btn-primary nav-cta">
            Launch Builder
          </Link>
        </div>
      )}
    </nav>
  );
}
