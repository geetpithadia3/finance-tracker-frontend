import apiClient from './client';

export const incomeApi = {
  getSources: () => apiClient.get('/income-sources'),
  
  create: (incomeData) => apiClient.post('/income-sources', incomeData),
  
  update: (incomeId, incomeData) => 
    apiClient.put(`/income-sources/${incomeId}`, incomeData),
    
  delete: (incomeId) => apiClient.delete(`/income-sources/${incomeId}`)
};
