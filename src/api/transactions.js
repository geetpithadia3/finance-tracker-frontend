import apiClient from './client';

export const transactionsApi = {
  getAll: (yearMonth) => {
    console.log(`Fetching transactions for yearMonth: ${yearMonth}`);
    return apiClient.post('/transactions/list', { yearMonth });
  },
  
  create: (transactions) => {
    console.log(`Creating transactions: ${JSON.stringify(transactions)}`);
    return apiClient.post('/transactions', transactions);
  },
  
  update: (transactions) => {
    console.log(`Updating transactions: ${JSON.stringify(transactions)}`);
    return Promise.all(transactions.map(transaction => {
      const updateData = {
        id: transaction.id,
        description: transaction.description,
        amount: transaction.amount,
        categoryId: transaction.category.id,
        occurredOn: transaction.occurredOn,
        deleted: false,
        account: transaction.account,
        refunded: transaction.refunded,
        personalShare: transaction.personalShare,
        owedShare: transaction.owedShare,
        shareMetadata: transaction.shareMetadata,
        recurrence: transaction.recurrence
      };
      console.log(`Updating transaction: ${JSON.stringify(updateData)}`);
      return apiClient.put('/transactions', [updateData]);
    }));
  },
  
  getDashboardData: (yearMonth) => {
    console.log(`Fetching dashboard data for yearMonth: ${yearMonth}`);
    return apiClient.get(`/dashboard?yearMonth=${yearMonth}`);
  },

  updateParentAndCreateSplits: async (parentTransaction, parentUpdate, newSplits) => {
    console.log(`Updating parent transaction: ${JSON.stringify(parentTransaction)}`);
    // Update parent transaction
    await apiClient.put('/transactions', [{
      id: parentTransaction.id,
      description: parentTransaction.description,
      amount: parentUpdate.amount,
      categoryId: parentTransaction.category.id,
      occurredOn: parentTransaction.occurredOn,
      deleted: false,
      account: parentTransaction.account,
      recurrence: parentTransaction.recurrence
    }]);

    console.log(`Creating split transactions: ${JSON.stringify(newSplits)}`);
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
  },
  
  updateRecurrence: (transactionId, recurrenceData) => {
    console.log(`Updating recurrence for transaction ${transactionId}: ${JSON.stringify(recurrenceData)}`);
    return apiClient.put(`/transactions/${transactionId}/recurrence`, recurrenceData);
  },
  
  removeRecurrence: (transactionId) => {
    console.log(`Removing recurrence for transaction ${transactionId}`);
    return apiClient.delete(`/transactions/${transactionId}/recurrence`);
  }
};
