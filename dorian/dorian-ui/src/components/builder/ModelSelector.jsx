import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronDown, Check } from "lucide-react";
import "./ModelSelector.css";

// Hardcoded Production Models from Groq (as of Feb 2026)
const PRODUCTION_MODELS = [
  { id: "llama-3.3-70b-versatile", speed: "280 t/s", description: "Best quality, latest LLaMA 3.3" },
  { id: "llama-3.1-8b-instant", speed: "560 t/s", description: "Fast and efficient" },
  { id: "openai/gpt-oss-120b", speed: "500 t/s", description: "OpenAI 120B flagship" },
  { id: "openai/gpt-oss-20b", speed: "1000 t/s", description: "Fastest text generation" },
  { id: "groq/compound", speed: "450 t/s", description: "Agentic AI with tools" },
  { id: "groq/compound-mini", speed: "450 t/s", description: "Compact agentic AI" },
  { id: "meta-llama/llama-guard-4-12b", speed: "1200 t/s", description: "Content moderation" },
];

const ModelSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    localStorage.getItem("dorian_selected_model") || "llama-3.3-70b-versatile"
  );

  useEffect(() => {
    // Listen for storage changes (when auto-switched)
    const handleStorageChange = (e) => {
      if (e.key === "dorian_selected_model" && e.newValue) {
        setSelectedModel(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleSelectModel = (modelId) => {
    setSelectedModel(modelId);
    localStorage.setItem("dorian_selected_model", modelId);
    setIsOpen(false);
  };

  const formatModelName = (id) => {
    // Convert model ID to friendly name
    return id
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const selectedModelName = formatModelName(selectedModel);

  return (
    <div className="model-selector">
      <button
        className="model-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Select AI Model"
      >
        <Brain size={18} />
        <span className="model-selector-label">{selectedModelName}</span>
        <ChevronDown
          size={16}
          className={`model-selector-chevron ${isOpen ? "open" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="model-selector-backdrop"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              className="model-selector-dropdown"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="model-selector-header">
                <Brain size={16} />
                <span>Select AI Model</span>
              </div>

              <div className="model-selector-success-notice">
                <Check size={14} />
                <span>✓ Production models</span>
              </div>

              <div className="model-selector-list">
                {PRODUCTION_MODELS.map((model) => (
                  <button
                    key={model.id}
                    className={`model-selector-item ${
                      selectedModel === model.id ? "selected" : ""
                    }`}
                    onClick={() => handleSelectModel(model.id)}
                  >
                    <div className="model-selector-item-content">
                      <span className="model-selector-item-name">
                        {formatModelName(model.id)}
                      </span>
                      <span className="model-selector-item-description">
                        {model.description}
                      </span>
                    </div>
                    {selectedModel === model.id && (
                      <Check size={16} className="model-selector-check" />
                    )}
                  </button>
                ))}
              </div>

              <div className="model-selector-footer">
                <p>Model changes apply to all AI operations</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModelSelector;
