import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Menu, X } from "lucide-react";
import Button from "../shared/Button";
import "./Navigation.css";

const Navigation = () => {
  const [theme, setTheme] = useState("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const isBuilder = location.pathname === "/builder";

  return (
    <motion.nav
      className={`navigation ${scrolled ? "navigation--scrolled" : ""} ${
        isBuilder ? "navigation--builder" : ""
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="navigation__container container">
        <Link to="/" className="navigation__logo">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <span className="navigation__logo-text">Dorian</span>
          </motion.div>
        </Link>

        <div className="navigation__menu">
          <Link to="/" className="navigation__link">
            Home
          </Link>
          <Link to="/builder" className="navigation__link">
            Builder
          </Link>
          <a href="#features" className="navigation__link">
            Features
          </a>
          <a href="#docs" className="navigation__link">
            Docs
          </a>
        </div>

        <div className="navigation__actions">
          <button
            onClick={toggleTheme}
            className="navigation__theme-toggle"
            aria-label="Toggle theme"
          >
            <motion.div
              initial={false}
              animate={{ rotate: theme === "dark" ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </motion.div>
          </button>

          <Button
            variant="primary"
            size="small"
            onClick={() => (window.location.href = "/builder")}
          >
            Get Started
          </Button>

          <button
            className="navigation__mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="navigation__mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              to="/"
              className="navigation__mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/builder"
              className="navigation__mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Builder
            </Link>
            <a
              href="#features"
              className="navigation__mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#docs"
              className="navigation__mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Docs
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;
