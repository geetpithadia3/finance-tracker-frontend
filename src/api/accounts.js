import apiClient from './client';

export const accountsApi = {
  getAll: () => apiClient.get('/account'),
  
  create: (accountData) => apiClient.post('/account', accountData),
  
  delete: (accountId) => apiClient.delete(`/account/${accountId}`),
  
  syncTransactions: (accountId) => 
    apiClient.post('/sync-transactions', { accountId }),
    
  saveExternalCredentials: (externalKey) => 
    apiClient.put('/user/external-credentials', { externalKey })
};
