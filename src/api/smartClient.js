import { apiClient } from './client';

class SmartApiClient {
  constructor() {
    // Use relative path for smart endpoints
    this.basePath = '/api/smart';
    
    console.log('SmartApiClient initialized with basePath:', this.basePath);
  }

  async post(endpoint, data) {
    console.log(`SmartAPI Request: POST ${this.basePath}${endpoint}`, data);
    return apiClient.post(`${this.basePath}${endpoint}`, data);
  }

  async get(endpoint) {
    console.log(`SmartAPI Request: GET ${this.basePath}${endpoint}`);
    return apiClient.get(`${this.basePath}${endpoint}`);
  }

  async put(endpoint, data) {
    console.log(`SmartAPI Request: PUT ${this.basePath}${endpoint}`, data);
    return apiClient.put(`${this.basePath}${endpoint}`, data);
  }

  async delete(endpoint) {
    console.log(`SmartAPI Request: DELETE ${this.basePath}${endpoint}`);
    return apiClient.delete(`${this.basePath}${endpoint}`);
  }
}

// Create and export the smartApiClient instance
const smartApiClient = new SmartApiClient();
export { smartApiClient }; 