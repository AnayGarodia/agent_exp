import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderOpen, Trash2, Clock } from 'lucide-react';
import useBuilderStore from '../../store/builderStore';
import './WorkflowsModal.css';

const WorkflowsModal = ({ workspaceRef }) => {
  const {
    showWorkflowsModal,
    setShowWorkflowsModal,
    savedWorkflows,
    loadWorkflow,
    deleteWorkflow
  } = useBuilderStore();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLoad = (workflow) => {
    if (workspaceRef?.current) {
      loadWorkflow(workflow, workspaceRef.current);
    }
  };

  return (
    <AnimatePresence>
      {showWorkflowsModal && (
        <>
          {/* Backdrop */}
          <motion.div
            className="workflows-modal__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowWorkflowsModal(false)}
          />

          {/* Modal */}
          <motion.div
            className="workflows-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="workflows-modal__header">
              <div className="workflows-modal__title">
                <FolderOpen size={24} />
                <h2>Saved Workflows</h2>
                <span className="workflows-modal__count">
                  {savedWorkflows.length}
                </span>
              </div>
              <button
                className="workflows-modal__close"
                onClick={() => setShowWorkflowsModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="workflows-modal__content">
              {savedWorkflows.length === 0 ? (
                <div className="workflows-modal__empty">
                  <FolderOpen size={48} opacity={0.3} />
                  <p>No saved workflows yet</p>
                  <p className="workflows-modal__empty-hint">
                    Click <strong>Save</strong> in the toolbar to save your first workflow
                  </p>
                </div>
              ) : (
                <div className="workflows-modal__list">
                  {savedWorkflows.map((workflow) => (
                    <motion.div
                      key={workflow.id}
                      className="workflows-modal__item"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="workflows-modal__item-content">
                        <h3 className="workflows-modal__item-name">
                          {workflow.name}
                        </h3>
                        <div className="workflows-modal__item-meta">
                          <Clock size={14} />
                          <span>Updated {formatDate(workflow.updatedAt)}</span>
                        </div>
                      </div>
                      <div className="workflows-modal__item-actions">
                        <button
                          className="workflows-modal__button workflows-modal__button--load"
                          onClick={() => handleLoad(workflow)}
                          title="Load this workflow"
                        >
                          <FolderOpen size={16} />
                          Load
                        </button>
                        <button
                          className="workflows-modal__button workflows-modal__button--delete"
                          onClick={() => deleteWorkflow(workflow.id)}
                          title="Delete this workflow"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WorkflowsModal;
