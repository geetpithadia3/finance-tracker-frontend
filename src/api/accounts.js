import apiClient from './client';

/**
 * API methods for account management
 */
export const accountsApi = {
  /**
   * Get all accounts
   * @returns {Promise<Array>} List of accounts
   */
  getAll: () => apiClient.get('/account'),
  
  /**
   * Create a new account
   * @param {Object} accountData - Account creation data
   * @returns {Promise<Object>} Created account
   */
  create: (accountData) => apiClient.post('/account', accountData),
  
  /**
   * Delete an account
   * @param {string} accountId - Account ID to delete
   * @returns {Promise<void>}
   */
  delete: (accountId) => apiClient.delete(`/account/${accountId}`),
  
  /**
   * Save external credentials
   * @param {string} externalKey - External service key
   * @returns {Promise<Object>} Update result
   */
  saveExternalCredentials: (externalKey) => 
    apiClient.put('/user/external-credentials', { externalKey })
};
