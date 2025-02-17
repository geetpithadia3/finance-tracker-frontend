import apiClient from './client';

/**
 * API methods for authentication
 */
export const authApi = {
  /**
   * Login user
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise<Object>} Authentication response with token
   */
  login: (username, password) =>
    apiClient.post('/auth/login', { username, password }),

  /**
   * Register new user
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise<Object>} Registration response
   */
  register: (username, password) =>
    apiClient.post('/auth/register', { username, password })
};
