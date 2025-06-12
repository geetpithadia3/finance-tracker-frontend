export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  smartURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  defaultHeaders: {
    'Content-Type': 'application/json'
  }
}; 