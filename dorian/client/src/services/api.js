/**
 * api.js — thin service layer over Dorian's Express routes.
 *
 * All network calls in the client go through here so that
 * Builder (and any future page) never hard-codes a URL.
 */

const BASE = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

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
  /** Returns the Google OAuth URL the popup should navigate to. */
  getAuthUrl() {
    return `${BASE}/auth/google/url`; // the popup opens this directly
  },

  /** Check whether the session is authenticated. */
  async checkAuthStatus() {
    return req("/auth/status");
    // Expected shape: { authenticated: bool, hasGmailTokens: bool }
    // We map extra fields (email, testMode, groqApiCalls) if the server adds them.
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
};
