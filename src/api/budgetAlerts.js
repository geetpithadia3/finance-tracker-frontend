import { apiClient } from './client';

export const budgetAlertsAPI = {
  // Get budget alerts for specified or current month
  getBudgetAlerts: async (yearMonth = null) => {
    const params = yearMonth ? { year_month: yearMonth } : {};
    const response = await apiClient.get('/budget-alerts', { params });
    return response.data;
  },

  // Get monthly budget performance summary
  getBudgetAlertSummary: async () => {
    const response = await apiClient.get('/budget-alerts/summary');
    return response.data;
  }
};