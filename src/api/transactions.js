import apiClient from './client';

export const transactionsApi = {
  getAll: (yearMonth) => apiClient.post('/transactions/list', { yearMonth }),
  
  create: (transactions) => apiClient.post('/transactions', transactions),
  
  update: (transactions) => apiClient.put('/transactions', transactions),
  
  getDashboardData: (yearMonth) => 
    apiClient.get(`/dashboard?yearMonth=${yearMonth}`),

  updateParentAndCreateSplits: async (parentTransaction, parentUpdate, newSplits) => {
    // Update parent transaction
    await apiClient.put('/transactions', [{
      id: parentTransaction.id,
      description: parentTransaction.description,
      amount: parentUpdate.amount,
      categoryId: parentTransaction.category.id,
      occurredOn: parentTransaction.occurredOn,
      deleted: false,
      account: parentTransaction.account
    }]);

    // Create split transactions
    return apiClient.post('/transactions', 
      newSplits.map(split => ({
        amount: parseFloat(split.amount),
        description: split.description || parentTransaction.description,
        categoryId: split.category.id,
        occurredOn: parentTransaction.occurredOn,
        accountId: parentTransaction.account,
        type: 'DEBIT'
      }))
    );
  }
};
