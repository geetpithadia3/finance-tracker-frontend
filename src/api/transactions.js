import { apiClient } from './client';

// Utility functions for snake_case <-> camelCase mapping
function toSnake(obj) {
  if (Array.isArray(obj)) return obj.map(toSnake);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
        toSnake(v)
      ])
    );
  }
  return obj;
}

function toCamel(obj) {
  if (Array.isArray(obj)) return obj.map(toCamel);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/_([a-z])/g, g => g[1].toUpperCase()),
        toCamel(v)
      ])
    );
  }
  return obj;
}

export const transactionsApi = {
  getAll: async (yearMonth) => {
    console.log(`Fetching transactions for yearMonth: ${yearMonth}`);
    // Parse yearMonth format "2025-05" into separate year and month
    const [year, month] = yearMonth.split('-').map(Number);
    const res = await apiClient.post('/transactions/list', { year, month });
    return toCamel(res);
  },
  
  create: async (transactions) => {
    console.log(`Creating transactions: ${JSON.stringify(transactions)}`);
    const sanitizedTransactions = transactions.map(transaction => {
      if (!transaction.categoryId) {
        throw new Error('Transaction must have a valid categoryId');
      }
      return {
        description: transaction.description,
        amount: parseFloat(transaction.amount),
        type: transaction.type ? transaction.type.toUpperCase() : 'DEBIT',
        occurredOn: transaction.occurredOn
          ? new Date(transaction.occurredOn).toISOString().split('.')[0] // 'YYYY-MM-DDTHH:mm:ss'
          : undefined,
        categoryId: transaction.categoryId
      };
    });
    const res = await apiClient.post('/transactions', toSnake(sanitizedTransactions));
    return toCamel(res);
  },
  
  update: async (transactions) => {
    console.log(`Updating transactions: ${JSON.stringify(transactions)}`);
    const updates = await Promise.all(transactions.map(async transaction => {
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
      return toSnake(updateData);
    }));
    const res = await apiClient.put('/transactions', updates);
    return toCamel(res);
  },
  
  getDashboardData: async (yearMonth) => {
    console.log(`Fetching dashboard data for yearMonth: ${yearMonth}`);
    const res = await apiClient.get(`/dashboard?yearMonth=${yearMonth}`);
    return toCamel(res);
  },

  updateParentAndCreateSplits: async (parentTransaction, parentUpdate, newSplits) => {
    console.log(`Updating parent transaction: ${JSON.stringify(parentTransaction)}`);
    // Update parent transaction
    await apiClient.put('/transactions', [toSnake({
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
    })]);

    console.log(`Creating split transactions: ${JSON.stringify(newSplits)}`);
    // Create split transactions
    const splitPayload = newSplits.map(split => toSnake({
      amount: parseFloat(split.amount),
      description: split.description || parentTransaction.description,
      categoryId: split.category.id,
      occurredOn: parentTransaction.occurredOn,
      type: 'DEBIT'
    }));
    const res = await apiClient.post('/transactions', splitPayload);
    return toCamel(res);
  },
  
  updateRecurrence: (transactionId, recurrenceData) => {
    console.log(`Updating recurrence for transaction ${transactionId}: ${JSON.stringify(recurrenceData)}`);
    return apiClient.put(`/transactions/${transactionId}/recurrence`, toSnake(recurrenceData));
  },
  
  removeRecurrence: (transactionId) => {
    console.log(`Removing recurrence for transaction ${transactionId}`);
    return apiClient.delete(`/transactions/${transactionId}/recurrence`);
  },

  getRecurringExpenses: async () => {
    console.log('Fetching recurring expenses');
    try {
      const response = await apiClient.get('/recurring-transactions');
      return toCamel(response);
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
      return toCamel(response);
    } catch (error) {
      console.error('Error fetching smart allocation data:', error);
      throw error;
    }
  },

  updateRecurringStatus: async (transactionId, isActive) => {
    console.log(`Updating recurring transaction status for ${transactionId} to ${isActive ? 'active' : 'inactive'}`);
    try {
      const response = await apiClient.put(`/recurring-transactions/${transactionId}/status`, toSnake({ isActive }));
      return toCamel(response);
    } catch (error) {
      console.error('Error updating recurring transaction status:', error);
      throw error;
    }
  },

  updateVariableAmountSettings: async (transactionId, variableAmountData) => {
    console.log(`Updating variable amount settings for transaction ${transactionId}: ${JSON.stringify(variableAmountData)}`);
    try {
      const response = await apiClient.put(`/transactions/${transactionId}/variable-amount`, toSnake(variableAmountData));
      return toCamel(response);
    } catch (error) {
      console.error('Error updating variable amount settings:', error);
      throw error;
    }
  },
};
