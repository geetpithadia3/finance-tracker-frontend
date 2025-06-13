import { apiClient } from './client';

/**
 * API methods for account management
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

export const accountsApi = {
  /**
   * Get all accounts
   * @returns {Promise<Array>} List of accounts
   */
  getAll: async () => {
    const res = await apiClient.get('/account');
    return toCamel(res);
  },
  
  /**
   * Create a new account
   * @param {Object} accountData - Account creation data
   * @returns {Promise<Object>} Created account
   */
  create: async (accountData) => {
    const res = await apiClient.post('/account', toSnake(accountData));
    return toCamel(res);
  },
  
  /**
   * Delete an account
   * @param {string} accountId - Account ID to delete
   * @returns {Promise<void>}
   */
  delete: async (accountId) => {
    const res = await apiClient.delete(`/account/${accountId}`);
    return toCamel(res);
  },
  
  /**
   * Save external credentials
   * @param {string} externalKey - External service key
   * @returns {Promise<Object>} Update result
   */
  saveExternalCredentials: async (externalKey) => {
    const res = await apiClient.put('/user/external-credentials', toSnake({ externalKey }));
    return toCamel(res);
  }
};
