const express = require("express");
const router = express.Router();
const { executeWorkflow } = require("../services/workflowEngine");

// Execute a workflow from Blockly XML
router.post("/execute", async (req, res) => {
  try {
    const { blocks, tokens } = req.body;

    if (!blocks) {
      return res.status(400).json({ error: "No workflow blocks provided" });
    }

    // Use tokens from session if not provided
    const googleTokens = tokens || req.session.googleTokens;

    const result = await executeWorkflow(blocks, googleTokens);

    res.json({
      success: true,
      result,
      logs: result.logs,
    });
  } catch (error) {
    console.error("Workflow execution error:", error);
    res.status(500).json({
      error: "Workflow execution failed",
      message: error.message,
    });
  }
});

// Save workflow (mock - in production use database)
router.post("/save", (req, res) => {
  try {
    const { name, blocks } = req.body;

    // TODO: Save to database
    // For now, just return success

    res.json({
      success: true,
      workflowId: Date.now().toString(),
      message: "Workflow saved (mock)",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to save workflow" });
  }
});

// List saved workflows (mock)
router.get("/list", (req, res) => {
  // TODO: Fetch from database
  res.json({ workflows: [] });
});

module.exports = router;
