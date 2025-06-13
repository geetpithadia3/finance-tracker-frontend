import { apiClient } from './client';

/**
 * API methods for budget management
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

export const budgetsApi = {
  /**
   * Get budget for specific month
   * @param {string} yearMonth - Year and month in YYYY-MM format
   * @returns {Promise<Object>} Budget data
   */
  get: async (yearMonth) => {
    const res = await apiClient.get(`/budgets?yearMonth=${yearMonth}`);
    return toCamel(res);
  },
  
  /**
   * Create new budget
   * @param {Object} budgetData - Budget creation data
   * @returns {Promise<Object>} Created budget
   */
  create: async (budgetData) => {
    const res = await apiClient.post('/budgets', toSnake(budgetData));
    return toCamel(res);
  },
    
  /**
   * Get estimated income
   * @returns {Promise<Object>} Estimated income data
   */
  getEstimatedIncome: async () => {
    const res = await apiClient.get('/income-sources');
    return toCamel(res);
  },
    
  /**
   * Get dashboard data
   * @param {string} yearMonth - Year and month in YYYY-MM format
   * @returns {Promise<Object>} Dashboard data
   */
  getDashboardData: async (yearMonth) => {
    const res = await apiClient.get(`/dashboard?yearMonth=${yearMonth}`);
    return toCamel(res);
  },

  /**
   * Download budget report
   * @param {string} yearMonth - Year and month in YYYY-MM format
   * @param {string} format - Report format ('PDF' or 'CSV')
   * @returns {Promise<Blob>} Report file blob
   */
  getReport: async (yearMonth, format) => {
    const res = await apiClient.get(`/budgets/report?yearMonth=${yearMonth}&format=${format}`, { responseType: 'blob' });
    return res; // No mapping for blobs
  }
};
