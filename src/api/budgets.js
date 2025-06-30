import { apiClient } from './client';

export const budgetAPI = {
  // Create new monthly budget
  createBudget: async (budgetData) => {
    return await apiClient.post('/budgets/', budgetData);
  },

  // Get all budgets
  getBudgets: async (skip = 0, limit = 100) => {
    return await apiClient.get(`/budgets/?skip=${skip}&limit=${limit}`);
  },

  // Get budget by year-month
  getBudgetByMonth: async (yearMonth) => {
    return await apiClient.get(`/budgets/${yearMonth}`);
  },

  // Update existing budget
  updateBudget: async (budgetId, budgetData) => {
    return await apiClient.put(`/budgets/${budgetId}`, budgetData);
  },

  // Delete budget
  deleteBudget: async (budgetId) => {
    return await apiClient.delete(`/budgets/${budgetId}`);
  },

  // Copy budget from previous month
  copyBudget: async (sourceYearMonth, targetYearMonth) => {
    return await apiClient.post('/budgets/copy', {
      source_year_month: sourceYearMonth,
      target_year_month: targetYearMonth
    });
  },

  // Rollover management
  getRolloverStatus: async (yearMonth) => {
    return await apiClient.get(`/budgets/${yearMonth}/rollover-status`);
  },

  recalculateRollover: async (yearMonth) => {
    return await apiClient.post(`/budgets/${yearMonth}/recalculate-rollover`);
  },

  // Get budget spending data
  getBudgetSpending: async (yearMonth) => {
    return await apiClient.get(`/budgets/${yearMonth}/spending`);
  },

  // Project Budget Methods
  
  // Create new project budget
  createProjectBudget: async (projectBudgetData) => {
    console.log('API: Creating project budget with data:', projectBudgetData);
    try {
      const result = await apiClient.post('/budgets/projects', projectBudgetData);
      console.log('API: Project budget created successfully:', result);
      return result;
    } catch (error) {
      console.error('API: Failed to create project budget:', error);
      throw error;
    }
  },

  // Get all project budgets
  getProjectBudgets: async (skip = 0, limit = 100, activeOnly = true) => {
    console.log('API: Fetching project budgets with params:', { skip, limit, activeOnly });
    try {
      const result = await apiClient.get(`/budgets/projects?skip=${skip}&limit=${limit}&active_only=${activeOnly}`);
      console.log('API: Project budgets fetched successfully:', result);
      return result;
    } catch (error) {
      console.error('API: Failed to fetch project budgets:', error);
      throw error;
    }
  },

  // Update project budget
  updateProjectBudget: async (projectBudgetId, projectBudgetData) => {
    return await apiClient.put(`/budgets/projects/${projectBudgetId}`, projectBudgetData);
  },

  // Delete project budget
  deleteProjectBudget: async (projectBudgetId) => {
    return await apiClient.delete(`/budgets/projects/${projectBudgetId}`);
  },

  // Get project budget progress
  getProjectBudgetProgress: async (projectBudgetId) => {
    return await apiClient.get(`/budgets/projects/${projectBudgetId}/progress`);
  },

  // Advanced Rollover Config
  getRolloverConfig: async (categoryId) => {
    return await apiClient.get(`/rollover-config/${categoryId}`);
  },

  updateRolloverConfig: async (categoryId, config) => {
    return await apiClient.put(`/rollover-config/${categoryId}`, config);
  },

  createRolloverConfig: async (config) => {
    return await apiClient.post('/rollover-config/', config);
  },
};