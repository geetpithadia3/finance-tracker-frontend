import apiClient from './client';

export const budgetsApi = {
  get: (yearMonth) => 
    apiClient.get(`/budgets?yearMonth=${yearMonth}`),
  
  create: (budgetData) => 
    apiClient.post('/budgets', budgetData),
    
  getEstimatedIncome: () => 
    apiClient.get('/income-sources'),
    
  getDashboardData: (yearMonth) => 
    apiClient.get(`/dashboard?yearMonth=${yearMonth}`)
};
