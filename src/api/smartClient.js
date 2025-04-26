import { apiClient } from './client';

class SmartApiClient {
  constructor() {
    this.baseUrl = '/api/smart';
  }

  async post(endpoint, data) {
    console.log(`SmartAPI Request: POST ${this.baseUrl}${endpoint}`, data);
    return apiClient.post(`${this.baseUrl}${endpoint}`, data);
  }

  async get(endpoint) {
    console.log(`SmartAPI Request: GET ${this.baseUrl}${endpoint}`);
    return apiClient.get(`${this.baseUrl}${endpoint}`);
  }

  async put(endpoint, data) {
    console.log(`SmartAPI Request: PUT ${this.baseUrl}${endpoint}`, data);
    return apiClient.put(`${this.baseUrl}${endpoint}`, data);
  }

  async delete(endpoint) {
    console.log(`SmartAPI Request: DELETE ${this.baseUrl}${endpoint}`);
    return apiClient.delete(`${this.baseUrl}${endpoint}`);
  }
}

// Create and export the smartApiClient instance
const smartApiClient = new SmartApiClient();
export { smartApiClient }; 