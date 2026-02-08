import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Menu, X, User, LogOut } from "lucide-react";
import Button from "../shared/Button";
import useBuilderStore from "../../store/builderStore";
import { api } from "../../services/api";
import "./Navigation.css";

const Navigation = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useBuilderStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await api.getCurrentUser();
        if (result.success && result.user) {
          setIsAuthenticated(true);
          setUserName(result.user.firstName || result.user.email);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [location]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const handleLogout = async () => {
    try {
      await api.logoutUser();
      localStorage.removeItem('dorian_user');
      localStorage.removeItem('dorian_onboarding_complete');
      setIsAuthenticated(false);
      setUserName('');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isBuilder = location.pathname === "/builder";

  const handleFeaturesClick = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      // Already on homepage, just scroll
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Navigate to homepage first, then scroll
      navigate('/');
      setTimeout(() => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

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
          <a href="#features" className="navigation__link" onClick={handleFeaturesClick}>
            Features
          </a>
          <Link to="/docs" className="navigation__link">
            Docs
          </Link>
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

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navigation__link">
                <User size={16} style={{ marginRight: '4px', display: 'inline' }} />
                {userName}
              </Link>

              <Button
                variant="secondary"
                size="small"
                onClick={handleLogout}
              >
                <LogOut size={16} style={{ marginRight: '4px' }} />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="navigation__link navigation__link--login">
                Log in
              </Link>

              <Button
                variant="primary"
                size="small"
                onClick={() => (window.location.href = "/signup")}
              >
                Get Started
              </Button>
            </>
          )}

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
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="navigation__mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/builder"
                  className="navigation__mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Builder
                </Link>
                <button
                  className="navigation__mobile-link navigation__mobile-link--logout"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
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
                <Link
                  to="/login"
                  className="navigation__mobile-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="navigation__mobile-link navigation__mobile-link--primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;
