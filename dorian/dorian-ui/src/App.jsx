import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/home/HomePage';
import BuilderPage from './components/builder/BuilderPage';
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
        <Route path="/builder" element={<BuilderPage />} />
      </Routes>
    </Router>
  );
}

export default App;
