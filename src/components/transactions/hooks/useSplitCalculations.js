import { useMemo } from 'react';

export const useSplitCalculations = (transaction, splits) => {
  return useMemo(() => ({
    remainingAmount: transaction?.amount - splits.reduce((sum, split) =>
      sum + (parseFloat(split.amount) || 0), 0) || 0,
    totalSplitAmount: splits.reduce((sum, split) =>
      sum + (parseFloat(split.amount) || 0), 0),
    isValid: splits.length > 0 && splits.every(split =>
      parseFloat(split.amount) > 0 && split.category
    )
  }), [transaction?.amount, splits]);
}; 