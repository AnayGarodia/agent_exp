import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, AlertCircle, ArrowRight, Loader, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import './AuthPages.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password strength indicator
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await api.getCurrentUser();
        if (result.success) {
          navigate('/dashboard', { replace: true });
        }
      } catch (e) {
        // Not logged in, stay on signup page
      }
    };
    checkAuth();
  }, [navigate]);

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    setPasswordStrength(Math.min(strength, 4));
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password || !firstName) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await api.signup({
        email,
        password,
        firstName
      });

      if (result.success) {
        // Store user data and onboarding completion
        localStorage.setItem('dorian_user', JSON.stringify(result.user));
        localStorage.setItem('dorian_onboarding_complete', 'true');
        localStorage.setItem('dorian_onboarding_data', JSON.stringify({
          email,
          firstName,
          completedAt: Date.now()
        }));

        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = ['#e05050', '#ff9933', '#ffc933', '#79d479'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

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
          <p className="auth-page__tagline">Start building AI agents</p>
        </motion.div>

        {/* Signup Form */}
        <motion.div
          className="auth-page__card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="auth-page__title">Create your account</h2>
          <p className="auth-page__subtitle">Get 100 free credits to start</p>

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
              <label htmlFor="firstName" className="auth-page__label">
                First name
              </label>
              <div className="auth-page__input-wrapper">
                <User size={20} className="auth-page__input-icon" />
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  className="auth-page__input"
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

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
              {password && (
                <div className="auth-page__password-strength">
                  <div className="auth-page__strength-bars">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="auth-page__strength-bar"
                        style={{
                          background: i < passwordStrength ? strengthColors[passwordStrength - 1] : '#e0e0e0'
                        }}
                      />
                    ))}
                  </div>
                  {passwordStrength > 0 && (
                    <span
                      className="auth-page__strength-label"
                      style={{ color: strengthColors[passwordStrength - 1] }}
                    >
                      {strengthLabels[passwordStrength - 1]}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="auth-page__field">
              <label htmlFor="confirmPassword" className="auth-page__label">
                Confirm password
              </label>
              <div className="auth-page__input-wrapper">
                <Lock size={20} className="auth-page__input-icon" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-page__input"
                  disabled={loading}
                />
                {confirmPassword && password === confirmPassword && (
                  <CheckCircle size={20} className="auth-page__input-check" />
                )}
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
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-page__footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-page__link">
                Log in
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

export default SignupPage;
