import apiClient from './client';

export const incomeApi = {
  getSources: () => apiClient.get('/income-sources'),
  
  create: (incomeData) => {
    return apiClient.post('/income-sources', incomeData);
  },
  
  update: (incomeId, incomeData) => {
    return apiClient.put(`/income-sources/${incomeId}`, incomeData);
  },
    
  delete: (incomeId) => {
    return apiClient.delete(`/income-sources/${incomeId}`);
  }
};
