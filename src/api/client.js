import { apiConfig } from './config';

class ApiClient {
  constructor() {
    // Use empty base URL for proxied requests
    this.baseUrl = '';
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    
    // Initialize theme from localStorage or default to 'light'
    this.initializeTheme();
  }

  initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }

  toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
    
    return newTheme;
  }

  async request(method, endpoint, data = null, retryCount = 0) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json'
    };

    try {
      console.log(`API Request: ${method} ${url}`, data ? { data } : '');
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : null,
      });

      console.log(`API Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.text().catch(() => null);
        console.error(`API Error (${response.status}):`, errorData);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorData || 'No details'}`);
      }

      const result = await response.json();
      console.log('API Response data:', result);
      return result;
    } catch (error) {
      console.error(`API Request Failed: ${method} ${url}`, error);
      
      if (retryCount < this.maxRetries && this.shouldRetry(error)) {
        console.log(`Retrying (${retryCount + 1}/${this.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this.request(method, endpoint, data, retryCount + 1);
      }
      throw error;
    }
  }

  shouldRetry(error) {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }

  get(endpoint) {
    return this.request('GET', endpoint);
  }

  post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }

  put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  }

  delete(endpoint) {
    return this.request('DELETE', endpoint);
  }
}

// Create and export the apiClient instance
const apiClient = new ApiClient();
export { apiClient }; 