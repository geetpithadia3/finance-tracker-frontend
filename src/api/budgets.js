import apiClient from './client';

/**
 * API methods for budget management
 */
export const budgetsApi = {
  /**
   * Get budget for specific month
   * @param {string} yearMonth - Year and month in YYYY-MM format
   * @returns {Promise<Object>} Budget data
   */
  get: (yearMonth) => 
    apiClient.get(`/budgets?yearMonth=${yearMonth}`),
  
  /**
   * Create new budget
   * @param {Object} budgetData - Budget creation data
   * @returns {Promise<Object>} Created budget
   */
  create: (budgetData) => 
    apiClient.post('/budgets', budgetData),
    
  /**
   * Get estimated income
   * @returns {Promise<Object>} Estimated income data
   */
  getEstimatedIncome: () => 
    apiClient.get('/income-sources'),
    
  /**
   * Get dashboard data
   * @param {string} yearMonth - Year and month in YYYY-MM format
   * @returns {Promise<Object>} Dashboard data
   */
  getDashboardData: (yearMonth) => 
    apiClient.get(`/dashboard?yearMonth=${yearMonth}`),

  /**
   * Download budget report
   * @param {string} yearMonth - Year and month in YYYY-MM format
   * @param {string} format - Report format ('PDF' or 'CSV')
   * @returns {Promise<Blob>} Report file blob
   */
  getReport: (yearMonth, format) => 
    apiClient.get(`/budgets/report?yearMonth=${yearMonth}&format=${format}`, 
      { responseType: 'blob' })
};
