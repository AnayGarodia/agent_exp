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

export const api = {
  // ── Auth ──────────────────────────────────────────────
  /** Returns the Google OAuth URL for the popup to navigate to. */
  getAuthUrl() {
    // FIXED: Return the full URL path that the popup should open
    // The backend /auth/google/url endpoint will redirect to Google's OAuth
    return `${BASE}/auth/google/url`;
  },

  /** Check whether the session is authenticated. */
  async checkAuthStatus() {
    return req("/auth/status");
    // Expected shape: { authenticated: bool, hasGmailTokens: bool, tokenExpiry: number }
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
    const result = await req("/workflows/execute", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    
    // Check if workflow execution failed and throw an error to be caught by the UI
    if (result.success === false) {
      throw new Error(result.error || "Workflow execution failed");
    }
    
    return result;
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
};
