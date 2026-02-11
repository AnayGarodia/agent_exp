/**
 * api.js — thin service layer over Dorian's Express routes.
 *
 * All network calls in the client go through here so that
 * Builder (and any future page) never hard-codes a URL.
 */

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/* helper: fetch + auto-throw on non-ok */
async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include", // sessions / cookies
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.message || `HTTP ${res.status}`);
  }
  return res.json();
}

/* helper: GET request */
async function get(path) {
  return req(path, { method: "GET" });
}

export const api = {
  // ── Generic helpers ───────────────────────────────────
  get,

  // ── User Auth ─────────────────────────────────────────
  /** Sign up a new user */
  async signup(userData) {
    const res = await fetch(`${BASE}/user/signup`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    return data;
  },

  /** Login existing user */
  async login(email, password) {
    const res = await fetch(`${BASE}/user/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    return data;
  },

  /** Get current user */
  async getCurrentUser() {
    const res = await fetch(`${BASE}/user/me`, {
      credentials: "include",
    });
    const data = await res.json();
    return data;
  },

  /** Logout user */
  async logoutUser() {
    const res = await fetch(`${BASE}/user/logout`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();
    return data;
  },

  // ── Google OAuth ──────────────────────────────────────
  /** Returns the Google OAuth URL for the popup to navigate to. */
  getAuthUrl() {
    return `${BASE}/auth/google/url`;
  },

  /** Check whether the session is authenticated. */
  async checkAuthStatus() {
    return req("/auth/status");
  },

  /** End the session (logout). */
  async logout() {
    return req("/auth/logout", { method: "POST" });
  },

  // ── Gmail ─────────────────────────────────────────────
  /** Fetch recent messages. */
  async getMessages(maxResults = 10, query = "") {
    return req(
      `/gmail/messages?maxResults=${maxResults}&query=${encodeURIComponent(
        query
      )}`
    );
  },

  /** Send a new email. */
  async sendEmail(to, subject, body) {
    return req("/gmail/send", {
      method: "POST",
      body: JSON.stringify({ to, subject, body }),
    });
  },

  // ── Workflows ─────────────────────────────────────────
  /**
   * Execute a workflow.
   * @param {{ blocks, agentType, code }} payload
   */
  async executeWorkflow(payload) {
    return req("/workflows/execute", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** Save a workflow (stub — server returns a mock id). */
  async saveWorkflow(name, blocks) {
    return req("/workflows/save", {
      method: "POST",
      body: JSON.stringify({ name, blocks }),
    });
  },

  /** List saved workflows. */
  async listWorkflows() {
    return req("/workflows/list");
  },

  // ── User Workflows ────────────────────────────────────
  /** Get user's workflows */
  async getUserWorkflows() {
    const res = await fetch(`${BASE}/user/workflows`, {
      credentials: "include",
    });
    const data = await res.json();
    return data;
  },

  /** Save workflow to user account */
  async saveUserWorkflow(workflowData) {
    const res = await fetch(`${BASE}/user/workflows`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workflowData),
    });
    const data = await res.json();
    return data;
  },

  /** Get specific workflow */
  async getWorkflow(id) {
    const res = await fetch(`${BASE}/user/workflows/${id}`, {
      credentials: "include",
    });
    const data = await res.json();
    return data;
  },

  /** Update workflow */
  async updateWorkflow(id, workflowData) {
    const res = await fetch(`${BASE}/user/workflows/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workflowData),
    });
    const data = await res.json();
    return data;
  },

  /** Delete workflow */
  async deleteWorkflow(id) {
    const res = await fetch(`${BASE}/user/workflows/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    return data;
  },

  // ── Credits & Usage ───────────────────────────────────
  /** Get credit balance */
  async getCredits() {
    const res = await fetch(`${BASE}/user/credits`, {
      credentials: "include",
    });
    const data = await res.json();
    return data;
  },

  /** Get credit transaction history */
  async getCreditHistory() {
    const res = await fetch(`${BASE}/user/credits/history`, {
      credentials: "include",
    });
    const data = await res.json();
    return data;
  },

  /** Use credits (deduct from balance) */
  async useCredits(amount, actionType, workflowId, details) {
    const res = await fetch(`${BASE}/user/credits/use`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, actionType, workflowId, details }),
    });
    const data = await res.json();
    return data;
  },

  /** Add credits (purchase or bonus) */
  async addCredits(amount, transactionType, description) {
    const res = await fetch(`${BASE}/user/credits/add`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, transactionType, description }),
    });
    const data = await res.json();
    return data;
  },

  /** Get usage statistics */
  async getUsageStats() {
    const res = await fetch(`${BASE}/user/usage/stats`, {
      credentials: "include",
    });
    const data = await res.json();
    return data;
  },
};
