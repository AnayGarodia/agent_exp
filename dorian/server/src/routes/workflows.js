const express = require("express");
const router = express.Router();
const { executeWorkflow } = require("../services/workflowEngine");
const Groq = require("groq-sdk");

// Execute a workflow from Blockly-generated code
router.post("/execute", async (req, res) => {
  try {
    const { code, tokens, selectedModel } = req.body;

    // Input validation
    if (!code || typeof code !== "string") {
      return res.status(400).json({
        success: false,
        error: "No workflow code provided",
        logs: [],
      });
    }

    if (code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Workflow code cannot be empty",
        logs: [],
      });
    }

    if (selectedModel && typeof selectedModel !== "string") {
      return res.status(400).json({
        success: false,
        error: "Invalid model selection",
        logs: [],
      });
    }

    // Use tokens from session if not provided in request
    const googleTokens = tokens || req.session?.googleTokens;

    console.log(" Executing workflow...");
    if (selectedModel) {
      console.log(` Using Groq model: ${selectedModel}`);
    }

    const result = await executeWorkflow(code, googleTokens, selectedModel);

    if (!result) {
      throw new Error("Workflow execution returned no result");
    }

    res.json({
      success: result.success || false,
      logs: Array.isArray(result.logs) ? result.logs : [],
      error: result.error || null,
    });
  } catch (error) {
    console.error("Workflow execution error:", error);
    res.status(500).json({
      success: false,
      error: "Workflow execution failed",
      message: error?.message || "Unknown error",
      logs: [],
    });
  }
});

// Save workflow (placeholder - implement with database)
router.post("/save", (req, res) => {
  try {
    const { name, blocks, code } = req.body;

    if (!name || !blocks) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // TODO: Save to database
    // For now, just return success

    const workflowId = `workflow_${Date.now()}`;

    console.log(` Workflow "${name}" saved (mock): ${workflowId}`);

    res.json({
      success: true,
      workflowId,
      message: "Workflow saved successfully",
    });
  } catch (error) {
    console.error("Save workflow error:", error);
    res.status(500).json({
      error: "Failed to save workflow",
      message: error.message,
    });
  }
});

// List saved workflows (placeholder)
router.get("/list", (req, res) => {
  // TODO: Fetch from database
  res.json({
    workflows: [],
    message: "No saved workflows (feature coming soon)",
  });
});

// Get specific workflow (placeholder)
router.get("/:id", (req, res) => {
  // TODO: Fetch from database
  res.status(404).json({
    error: "Workflow not found",
    message: "Workflow persistence not yet implemented",
  });
});

// Delete workflow (placeholder)
router.delete("/:id", (req, res) => {
  // TODO: Delete from database
  res.json({
    success: true,
    message: "Workflow deleted (mock)",
  });
});

// Get available Groq models - DYNAMICALLY from Groq SDK
router.get("/models", async (req, res) => {
  console.log(" Fetching available Groq models from SDK...");

  try {
    if (!process.env.GROQ_API_KEY) {
      console.error(" GROQ_API_KEY not configured");
      return res.status(500).json({
        success: false,
        error: "GROQ_API_KEY not configured",
        models: getFallbackModels(),
      });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log(" Calling Groq SDK models.list()...");

    const response = await groq.models.list();

    if (!response || !response.data) {
      throw new Error("Invalid response from Groq API");
    }

    console.log(` Groq SDK returned ${response.data.length} total models`);

    // Get ALL models and filter for chat-capable ones
    const allModels = response.data
      .filter((model) => {
        if (!model?.id) return false;

        // Log each model for debugging
        console.log(`  - ${model.id} (active: ${model.active ?? 'unknown'})`);

        // Only include models that are active (not decommissioned)
        const isActive = model.active !== false && model.active !== 'false';

        return isActive;
      })
      .map((model) => ({
        id: model.id,
        active: true,
        context_window: model.context_window || 8192,
        owned_by: model.owned_by || 'groq',
      }))
      .sort((a, b) => {
        // Sort newest/best models first
        const priority = (id) => {
          if (id.includes('llama-3.3')) return 0;
          if (id.includes('llama-3.1')) return 1;
          if (id.includes('llama3-')) return 2;
          if (id.includes('gemma2')) return 3;
          return 4;
        };

        const aPriority = priority(a.id);
        const bPriority = priority(b.id);

        if (aPriority !== bPriority) return aPriority - bPriority;
        return a.id.localeCompare(b.id);
      });

    console.log(` Returning ${allModels.length} active models to client`);

    if (allModels.length === 0) {
      console.warn("  No active models found, using fallback");
      return res.json({
        success: true,
        models: getFallbackModels(),
        fallback: true,
      });
    }

    res.json({
      success: true,
      models: allModels,
      source: "groq-sdk",
    });
  } catch (error) {
    console.error(" Error fetching from Groq SDK:", error?.message || error);
    console.error("Stack:", error?.stack);

    // Return minimal fallback only if SDK completely fails
    console.log("  Using minimal fallback models");
    res.json({
      success: true,
      models: getFallbackModels(),
      fallback: true,
      error: error?.message,
    });
  }
});

// Minimal fallback models - ONLY latest stable versions
function getFallbackModels() {
  return [
    { id: "llama-3.3-70b-versatile", active: true },
    { id: "llama-3.1-8b-instant", active: true },
    { id: "gemma2-9b-it", active: true },
  ];
}

module.exports = router;
