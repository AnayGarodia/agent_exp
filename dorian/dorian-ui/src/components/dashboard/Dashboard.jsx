import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus, Sparkles, Clock, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import Navigation from '../layout/Navigation';
import { workflowTemplates } from '../../config/workflowTemplates';
import './Dashboard.css';

// Convert templates object to array for display
const templates = Object.values(workflowTemplates);

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [workflows, setWorkflows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Try to get user from API first
      const userResult = await api.getCurrentUser();
      if (userResult.success) {
        setUserName(userResult.user.firstName || '');

        // Also load workflows from API
        const workflowsResult = await api.getUserWorkflows();
        if (workflowsResult.success) {
          setWorkflows(workflowsResult.workflows);
        }
      } else {
        // Fallback to localStorage
        loadFromLocalStorage();
      }
    } catch (error) {
      // Fallback to localStorage if API fails
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    // Get user name from localStorage (from onboarding)
    const onboardingData = localStorage.getItem('dorian_onboarding_data');
    if (onboardingData) {
      try {
        const data = JSON.parse(onboardingData);
        setUserName(data.firstName || '');
      } catch (e) {
        console.error('Error parsing onboarding data:', e);
      }
    }

    // Load saved workflows from localStorage
    loadWorkflows();
  };

  const loadWorkflows = () => {
    const saved = localStorage.getItem('dorian_saved_workflows');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWorkflows(parsed);
      } catch (e) {
        console.error('Error loading workflows:', e);
        setWorkflows([]);
      }
    }
  };

  const handleCreateNew = () => {
    navigate('/builder');
  };

  const handleSelectTemplate = (templateId) => {
    const template = workflowTemplates[templateId];
    if (template) {
      navigate('/builder', { state: { template } });
    }
  };

  const handleOpenWorkflow = (workflowId) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
      navigate('/builder', { state: { workflow } });
    }
  };

  const handleDeleteWorkflow = (workflowId, e) => {
    e.stopPropagation();

    if (!confirm('Delete this workflow? This cannot be undone.')) {
      return;
    }

    const updated = workflows.filter(w => w.id !== workflowId);
    setWorkflows(updated);
    localStorage.setItem('dorian_saved_workflows', JSON.stringify(updated));
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard">
      <Navigation />

      <div className="dashboard__container">
        {/* Hero Section */}
        <motion.div
          className="dashboard__hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="dashboard__title">
            What will you build today{userName ? `, ${userName}` : ''}?
          </h1>

          {/* Search Bar */}
          <div className="dashboard__search">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search templates"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="dashboard__quick-actions">
          <motion.button
            className="dashboard__action-button dashboard__action-button--primary"
            onClick={handleCreateNew}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={20} />
            Start from Scratch
          </motion.button>
        </div>

        {/* Templates Grid */}
        <section className="dashboard__section">
          <h2 className="dashboard__section-title">
            <Sparkles size={20} />
            Templates
          </h2>

          <div className="dashboard__templates-grid">
            {filteredTemplates.map((template, index) => (
              <motion.button
                key={template.id}
                className="dashboard__template-card"
                onClick={() => handleSelectTemplate(template.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="dashboard__template-icon"
                  style={{ background: template.gradient }}
                />
                <h3 className="dashboard__template-name">{template.name}</h3>
                <p className="dashboard__template-desc">{template.description}</p>
              </motion.button>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="dashboard__empty-search">
              <p>No templates found for "{searchQuery}"</p>
            </div>
          )}
        </section>

        {/* Recent Workflows */}
        {workflows.length > 0 && (
          <section className="dashboard__section">
            <h2 className="dashboard__section-title">
              <Clock size={20} />
              Recent Workflows
            </h2>

            <div className="dashboard__workflows-grid">
              {workflows.slice(0, 6).map((workflow, index) => {
                const initial = workflow.name.charAt(0).toUpperCase();
                return (
                  <motion.div
                    key={workflow.id}
                    className="dashboard__workflow-card"
                    onClick={() => handleOpenWorkflow(workflow.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="dashboard__workflow-icon">
                      {initial}
                    </div>
                    <div className="dashboard__workflow-content">
                      <div className="dashboard__workflow-header">
                        <h3 className="dashboard__workflow-name">{workflow.name}</h3>
                        <button
                          className="dashboard__workflow-delete"
                          onClick={(e) => handleDeleteWorkflow(workflow.id, e)}
                          title="Delete workflow"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {workflow.description && (
                        <p className="dashboard__workflow-desc">{workflow.description}</p>
                      )}
                      <div className="dashboard__workflow-meta">
                        <Clock size={14} />
                        <span>{formatDate(workflow.updatedAt)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
