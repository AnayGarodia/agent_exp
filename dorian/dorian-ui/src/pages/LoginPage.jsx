import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, ArrowRight, Loader } from 'lucide-react';
import { api } from '../services/api';
import './AuthPages.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await api.getCurrentUser();
        if (result.success) {
          navigate('/dashboard', { replace: true });
        }
      } catch (e) {
        // Not logged in, stay on login page
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const result = await api.login(email, password);

      if (result.success) {
        // Store user data in localStorage
        localStorage.setItem('dorian_user', JSON.stringify(result.user));
        localStorage.setItem('dorian_onboarding_complete', 'true');

        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        {/* Logo / Brand */}
        <motion.div
          className="auth-page__brand"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="auth-page__logo">Dorian</h1>
          <p className="auth-page__tagline">Welcome back</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="auth-page__card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="auth-page__title">Log in to your account</h2>

          {error && (
            <motion.div
              className="auth-page__error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="auth-page__form">
            <div className="auth-page__field">
              <label htmlFor="email" className="auth-page__label">
                Email address
              </label>
              <div className="auth-page__input-wrapper">
                <Mail size={20} className="auth-page__input-icon" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="auth-page__input"
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            <div className="auth-page__field">
              <label htmlFor="password" className="auth-page__label">
                Password
              </label>
              <div className="auth-page__input-wrapper">
                <Lock size={20} className="auth-page__input-icon" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-page__input"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="auth-page__submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={18} className="auth-page__spinner" />
                  Logging in...
                </>
              ) : (
                <>
                  Log in
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-page__footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="auth-page__link">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          className="auth-page__back"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link to="/" className="auth-page__back-link">
            ← Back to home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
