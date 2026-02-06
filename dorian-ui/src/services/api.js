// API service to connect the UI to the backend
const API_BASE_URL = '/api'; // Using relative path for proxy

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Execute a workflow
  async executeWorkflow(workflowData) {
    return this.request('/workflows/execute', {
      method: 'POST',
      body: JSON.stringify(workflowData),
    });
  }

  // Save a workflow
  async saveWorkflow(workflowData) {
    return this.request('/workflows/save', {
      method: 'POST',
      body: JSON.stringify(workflowData),
    });
  }

  // Get list of saved workflows
  async getWorkflows() {
    return this.request('/workflows/list');
  }

  // Get a specific workflow
  async getWorkflow(id) {
    return this.request(`/workflows/${id}`);
  }

  // Delete a workflow
  async deleteWorkflow(id) {
    return this.request(`/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  // Check authentication status
  async checkAuthStatus() {
    return this.request('/auth/status');
  }

  // Get Gmail connection status
  async getGmailStatus() {
    return this.request('/gmail/status');
  }

  // Get Google OAuth URL
  getGoogleAuthUrl() {
    return `${this.baseURL}/auth/google/url`;
  }
}

export default new ApiService();