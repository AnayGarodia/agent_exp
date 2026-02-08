import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/home/HomePage';
import BuilderPage from './components/builder/BuilderPage';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import Dashboard from './components/dashboard/Dashboard';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DocsPage from './pages/DocsPage';
import DemoPage from './pages/DemoPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import useBuilderStore from './store/builderStore';
import './styles/global.css';

function App() {
  // Initialize theme on mount
  useEffect(() => {
    useBuilderStore.getState().initTheme();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/builder"
          element={
            <ProtectedRoute>
              <BuilderPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
