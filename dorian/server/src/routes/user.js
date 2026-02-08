const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../config/database');

const router = express.Router();

// Use Node.js built-in crypto for UUID generation
const uuidv4 = () => crypto.randomUUID();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  next();
};

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      organizationName,
      businessCategory,
      teamSize,
      primaryGoals,
      tools
    } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const now = Date.now();

    const stmt = db.prepare(`
      INSERT INTO users (
        id, email, password_hash, first_name, last_name,
        organization_name, business_category, team_size,
        primary_goals, tools, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      userId,
      email,
      passwordHash,
      firstName || null,
      lastName || null,
      organizationName || null,
      businessCategory || null,
      teamSize || null,
      primaryGoals ? JSON.stringify(primaryGoals) : null,
      tools ? JSON.stringify(tools) : null,
      now,
      now
    );

    // Create session
    req.session.userId = userId;
    req.session.email = email;

    // Log initial credit transaction
    const txId = uuidv4();
    const creditStmt = db.prepare(`
      INSERT INTO credit_transactions (id, user_id, amount, transaction_type, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    creditStmt.run(txId, userId, 100, 'signup_bonus', 'Welcome bonus - 100 free credits', now);

    res.json({
      success: true,
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        credits: 100,
        subscriptionTier: 'free'
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create account'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Create session
    req.session.userId = user.id;
    req.session.email = user.email;

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        credits: user.credits || 0,
        subscriptionTier: user.subscription_tier || 'free'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
    res.clearCookie('dorian.sid');
    res.json({ success: true });
  });
});

// Get current user
router.get('/me', requireAuth, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, email, first_name, last_name, organization_name,
             business_category, team_size, primary_goals, tools,
             credits, total_credits_used, subscription_tier, subscription_expires
      FROM users WHERE id = ?
    `).get(req.session.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        organizationName: user.organization_name,
        businessCategory: user.business_category,
        teamSize: user.team_size,
        primaryGoals: user.primary_goals ? JSON.parse(user.primary_goals) : [],
        tools: user.tools ? JSON.parse(user.tools) : [],
        credits: user.credits || 0,
        totalCreditsUsed: user.total_credits_used || 0,
        subscriptionTier: user.subscription_tier || 'free',
        subscriptionExpires: user.subscription_expires
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user'
    });
  }
});

// Get user's workflows
router.get('/workflows', requireAuth, (req, res) => {
  try {
    const workflows = db.prepare(`
      SELECT id, name, description, agent_type, created_at, updated_at
      FROM workflows
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `).all(req.session.userId);

    res.json({
      success: true,
      workflows: workflows.map(w => ({
        id: w.id,
        name: w.name,
        description: w.description,
        agentType: w.agent_type,
        createdAt: w.created_at,
        updatedAt: w.updated_at
      }))
    });
  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get workflows'
    });
  }
});

// Save workflow
router.post('/workflows', requireAuth, (req, res) => {
  try {
    const { name, description, blocklyState, agentType } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Workflow name is required'
      });
    }

    const workflowId = uuidv4();
    const now = Date.now();

    const stmt = db.prepare(`
      INSERT INTO workflows (
        id, user_id, name, description, blockly_state, agent_type,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      workflowId,
      req.session.userId,
      name,
      description || null,
      blocklyState ? JSON.stringify(blocklyState) : null,
      agentType || null,
      now,
      now
    );

    res.json({
      success: true,
      workflow: {
        id: workflowId,
        name,
        description,
        agentType,
        createdAt: now,
        updatedAt: now
      }
    });
  } catch (error) {
    console.error('Save workflow error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save workflow'
    });
  }
});

// Update workflow
router.put('/workflows/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, blocklyState, agentType } = req.body;

    // Check if workflow exists and belongs to user
    const existing = db.prepare(
      'SELECT id FROM workflows WHERE id = ? AND user_id = ?'
    ).get(id, req.session.userId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    const now = Date.now();
    const stmt = db.prepare(`
      UPDATE workflows
      SET name = ?, description = ?, blockly_state = ?,
          agent_type = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(
      name,
      description || null,
      blocklyState ? JSON.stringify(blocklyState) : null,
      agentType || null,
      now,
      id,
      req.session.userId
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update workflow error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update workflow'
    });
  }
});

// Delete workflow
router.delete('/workflows/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare(
      'DELETE FROM workflows WHERE id = ? AND user_id = ?'
    );
    const result = stmt.run(id, req.session.userId);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete workflow error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete workflow'
    });
  }
});

// Get workflow by ID
router.get('/workflows/:id', requireAuth, (req, res) => {
  try {
    const { id } = req.params;

    const workflow = db.prepare(`
      SELECT * FROM workflows WHERE id = ? AND user_id = ?
    `).get(id, req.session.userId);

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      workflow: {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        blocklyState: workflow.blockly_state ? JSON.parse(workflow.blockly_state) : null,
        agentType: workflow.agent_type,
        createdAt: workflow.created_at,
        updatedAt: workflow.updated_at
      }
    });
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get workflow'
    });
  }
});

// ============================================
// CREDITS & USAGE TRACKING ENDPOINTS
// ============================================

// Get credit balance
router.get('/credits', requireAuth, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT credits, total_credits_used, subscription_tier, subscription_expires
      FROM users WHERE id = ?
    `).get(req.session.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      credits: user.credits || 0,
      totalCreditsUsed: user.total_credits_used || 0,
      subscriptionTier: user.subscription_tier || 'free',
      subscriptionExpires: user.subscription_expires
    });
  } catch (error) {
    console.error('Get credits error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get credits'
    });
  }
});

// Get credit transaction history
router.get('/credits/history', requireAuth, (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT * FROM credit_transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `).all(req.session.userId);

    res.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.transaction_type,
        description: t.description,
        createdAt: t.created_at
      }))
    });
  } catch (error) {
    console.error('Get credit history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get credit history'
    });
  }
});

// Use credits (internal - called by workflow execution)
router.post('/credits/use', requireAuth, (req, res) => {
  try {
    const { amount, actionType, workflowId, details } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credit amount'
      });
    }

    // Get current credits
    const user = db.prepare('SELECT credits FROM users WHERE id = ?').get(req.session.userId);

    if (!user || user.credits < amount) {
      return res.status(402).json({
        success: false,
        error: 'Insufficient credits',
        creditsNeeded: amount,
        creditsAvailable: user?.credits || 0
      });
    }

    const now = Date.now();

    // Deduct credits
    db.prepare(`
      UPDATE users
      SET credits = credits - ?,
          total_credits_used = total_credits_used + ?,
          updated_at = ?
      WHERE id = ?
    `).run(amount, amount, now, req.session.userId);

    // Log usage
    const usageId = uuidv4();
    db.prepare(`
      INSERT INTO api_usage (id, user_id, action_type, credits_used, workflow_id, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(usageId, req.session.userId, actionType, amount, workflowId || null, details || null, now);

    // Log transaction
    const txId = uuidv4();
    db.prepare(`
      INSERT INTO credit_transactions (id, user_id, amount, transaction_type, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(txId, req.session.userId, -amount, actionType, details || `Used for ${actionType}`, now);

    // Get updated balance
    const updated = db.prepare('SELECT credits FROM users WHERE id = ?').get(req.session.userId);

    res.json({
      success: true,
      creditsUsed: amount,
      creditsRemaining: updated.credits
    });
  } catch (error) {
    console.error('Use credits error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to use credits'
    });
  }
});

// Add credits (for purchases or admin bonuses)
router.post('/credits/add', requireAuth, (req, res) => {
  try {
    const { amount, transactionType, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credit amount'
      });
    }

    const now = Date.now();

    // Add credits
    db.prepare(`
      UPDATE users
      SET credits = credits + ?,
          updated_at = ?
      WHERE id = ?
    `).run(amount, now, req.session.userId);

    // Log transaction
    const txId = uuidv4();
    db.prepare(`
      INSERT INTO credit_transactions (id, user_id, amount, transaction_type, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(txId, req.session.userId, amount, transactionType || 'purchase', description || `Added ${amount} credits`, now);

    // Get updated balance
    const user = db.prepare('SELECT credits FROM users WHERE id = ?').get(req.session.userId);

    res.json({
      success: true,
      creditsAdded: amount,
      creditsTotal: user.credits
    });
  } catch (error) {
    console.error('Add credits error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add credits'
    });
  }
});

// Get API usage statistics
router.get('/usage/stats', requireAuth, (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT
        action_type,
        COUNT(*) as count,
        SUM(credits_used) as total_credits,
        AVG(credits_used) as avg_credits
      FROM api_usage
      WHERE user_id = ?
      GROUP BY action_type
      ORDER BY total_credits DESC
    `).all(req.session.userId);

    const recentUsage = db.prepare(`
      SELECT * FROM api_usage
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(req.session.userId);

    res.json({
      success: true,
      stats: stats.map(s => ({
        actionType: s.action_type,
        count: s.count,
        totalCredits: s.total_credits,
        avgCredits: s.avg_credits
      })),
      recentUsage: recentUsage.map(u => ({
        id: u.id,
        actionType: u.action_type,
        creditsUsed: u.credits_used,
        workflowId: u.workflow_id,
        details: u.details,
        createdAt: u.created_at
      }))
    });
  } catch (error) {
    console.error('Get usage stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get usage stats'
    });
  }
});

module.exports = router;
