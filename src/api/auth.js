import { apiClient } from './client';

/**
 * API methods for authentication
 */

// Utility functions for snake_case <-> camelCase mapping
function toSnake(obj) {
  if (Array.isArray(obj)) return obj.map(toSnake);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
        toSnake(v)
      ])
    );
  }
  return obj;
}

function toCamel(obj) {
  if (Array.isArray(obj)) return obj.map(toCamel);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/_([a-z])/g, g => g[1].toUpperCase()),
        toCamel(v)
      ])
    );
  }
  return obj;
}

export const authApi = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  register: async (userData) => {
    const res = await apiClient.post('/auth/register', toSnake(userData));
    return toCamel(res);
  },

  /**
   * Login a user
   * @param {Object} credentials - User login credentials
   * @returns {Promise<Object>} Login response with token
   */
  login: async (credentials) => {
    const res = await apiClient.post('/auth/login', toSnake(credentials));
    return toCamel(res);
  }
}; 