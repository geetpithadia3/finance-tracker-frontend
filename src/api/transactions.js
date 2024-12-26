import apiClient from './client';

export const transactionsApi = {
  getAll: (yearMonth) => apiClient.post('/transactions/list', { yearMonth }),
  
  create: (transactions) => apiClient.post('/transactions', transactions),
  
  update: (transactions) => apiClient.put('/transactions', transactions),
  
  getDashboardData: (yearMonth) => 
    apiClient.get(`/dashboard?yearMonth=${yearMonth}`)
};
