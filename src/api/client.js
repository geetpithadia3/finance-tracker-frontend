class ApiClient {
  constructor() {
    // Use environment variable for base URL with fallback
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    
    console.log('ApiClient initialized with baseUrl:', this.baseUrl);
    
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

  async request(method, endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json'
    };

    // Add Authorization header if token exists
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      console.log(`API Request: ${method} ${url}`, data ? { data } : '');
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : null
      });

      console.log(`API Response status: ${response.status}`);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.text().catch(() => null);
        console.error(`API Error (${response.status}):`, errorData);
        
        // Handle unauthorized responses
        if (response.status === 401) {
          // Clear auth data
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          // Redirect to login
          window.location.href = '/login';
        }
        
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorData || 'No details'}`);
      }

      const result = await response.json();
      console.log('API Response data:', result);
      return result;
    } catch (error) {
      console.error(`API Request Failed: ${method} ${url}`, error);
      throw error;
    }
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