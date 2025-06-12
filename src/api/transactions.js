import { apiClient } from './client';

export const transactionsApi = {
  getAll: (yearMonth) => {
    console.log(`Fetching transactions for yearMonth: ${yearMonth}`);
    return apiClient.post('/transactions/list', { yearMonth });
  },
  
  create: (transactions) => {
    console.log(`Creating transactions: ${JSON.stringify(transactions)}`);
    // Ensure we're not sending accountId field which is no longer needed
    const sanitizedTransactions = transactions.map(transaction => {
      const { accountId, ...rest } = transaction;
      return rest;
    });
    return apiClient.post('/transactions', sanitizedTransactions);
  },
  
  update: (transactions) => {
    console.log(`Updating transactions: ${JSON.stringify(transactions)}`);
    return Promise.all(transactions.map(transaction => {
      // If transaction is refunded, automatically remove any recurrence data
      // to prevent refunded transactions from continuing to repeat
      const shouldRemoveRecurrence = transaction.refunded && transaction.recurrence;
      
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
        // Only include recurrence data if transaction is not refunded
        recurrence: shouldRemoveRecurrence ? null : transaction.recurrence ? {
          id: transaction.recurrence.id,
          frequency: transaction.recurrence.frequency,
          startDate: transaction.recurrence.startDate,
          dateFlexibility: transaction.recurrence.dateFlexibility || 'EXACT',
          rangeStart: transaction.recurrence.rangeStart,
          rangeEnd: transaction.recurrence.rangeEnd,
          preference: transaction.recurrence.preference,
          isVariableAmount: transaction.recurrence.isVariableAmount || false,
          estimatedMinAmount: transaction.recurrence.estimatedMinAmount,
          estimatedMaxAmount: transaction.recurrence.estimatedMaxAmount
        } : null
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
      recurrence: parentTransaction.recurrence ? {
        ...parentTransaction.recurrence,
        // Preserve variable amount settings if they exist
        isVariableAmount: parentTransaction.recurrence.isVariableAmount || false,
        estimatedMinAmount: parentTransaction.recurrence.estimatedMinAmount,
        estimatedMaxAmount: parentTransaction.recurrence.estimatedMaxAmount
      } : null
    }]);

    console.log(`Creating split transactions: ${JSON.stringify(newSplits)}`);
    // Create split transactions
    return apiClient.post('/transactions', 
      newSplits.map(split => ({
        amount: parseFloat(split.amount),
        description: split.description || parentTransaction.description,
        categoryId: split.category.id,
        occurredOn: parentTransaction.occurredOn,
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
  },

  getRecurringExpenses: async () => {
    console.log('Fetching recurring expenses');
    try {
      const response = await apiClient.get('/recurring-transactions');
      return response;
    } catch (error) {
      console.error('Error fetching recurring expenses:', error);
      throw error;
    }
  },

  getSmartAllocation: async (yearMonth) => {
    console.log(`Fetching smart allocation data for yearMonth: ${yearMonth}`);
    try {
      const response = await apiClient.get(`/allocation?yearMonth=${yearMonth}`);
      console.log('Smart allocation data:', response);
      return response;
    } catch (error) {
      console.error('Error fetching smart allocation data:', error);
      throw error;
    }
  },

  updateRecurringStatus: async (transactionId, isActive) => {
    console.log(`Updating recurring transaction status for ${transactionId} to ${isActive ? 'active' : 'inactive'}`);
    try {
      const response = await apiClient.put(`/recurring-transactions/${transactionId}/status`, { isActive });
      return response;
    } catch (error) {
      console.error('Error updating recurring transaction status:', error);
      throw error;
    }
  },

  updateVariableAmountSettings: async (transactionId, variableAmountData) => {
    console.log(`Updating variable amount settings for transaction ${transactionId}: ${JSON.stringify(variableAmountData)}`);
    try {
      const response = await apiClient.put(`/transactions/${transactionId}/variable-amount`, variableAmountData);
      return response;
    } catch (error) {
      console.error('Error updating variable amount settings:', error);
      throw error;
    }
  },
};
