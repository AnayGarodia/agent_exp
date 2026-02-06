const express = require("express");
const router = express.Router();
const { executeWorkflow } = require("../services/workflowEngine");

// Execute a workflow from Blockly-generated code
router.post("/execute", async (req, res) => {
  try {
    const { code, tokens } = req.body;

    if (!code) {
      return res.status(400).json({ error: "No workflow code provided" });
    }

    // Use tokens from session if not provided in request
    const googleTokens = tokens || req.session.googleTokens;

    console.log("📝 Executing workflow...");
    const result = await executeWorkflow(code, googleTokens);

    res.json({
      success: result.success,
      logs: result.logs,
      error: result.error,
    });
  } catch (error) {
    console.error("Workflow execution error:", error);
    res.status(500).json({
      success: false,
      error: "Workflow execution failed",
      message: error.message,
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

    console.log(`💾 Workflow "${name}" saved (mock): ${workflowId}`);

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

module.exports = router;
