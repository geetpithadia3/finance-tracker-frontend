// Shared utility functions for transaction components

export const formatCurrency = (amount) => {
  const value = parseFloat(amount);
  return isNaN(value) ? '$0.00' : `$${value.toFixed(2)}`;
};

export const getCategoryName = (transaction) => {
  if (!transaction.category) return 'No Category';
  if (typeof transaction.category === 'string') return transaction.category;
  if (transaction.category.name) return transaction.category.name;
  return 'No Category';
};

export const isSharedTransaction = (transaction) => {
  return transaction.owedShare > 0 || 
         (transaction.shareMetadata && Object.keys(transaction.shareMetadata).length > 0);
};

export const isSplitTransaction = (transaction) => {
  return transaction.isSplit || 
         (transaction.parentTransactionId) || 
         (transaction.splitTransactions && transaction.splitTransactions.length > 0);
};

export const getFrequencyLabel = (frequency) => {
  const options = {
    'DAILY': 'Daily',
    'WEEKLY': 'Weekly',
    'BIWEEKLY': 'Bi-weekly',
    'FOUR_WEEKLY': 'Every 4 weeks',
    'MONTHLY': 'Monthly',
    'YEARLY': 'Yearly'
  };
  return options[frequency] || frequency;
};

export const getDateFlexibilityLabel = (flexibility, recurrence) => {
  if (!flexibility) return 'Exact date';
  
  switch (flexibility) {
    case 'EXACT':
      if (recurrence.frequency === 'WEEKLY' && recurrence.preference) {
        const days = {
          'MONDAY': 'Monday',
          'TUESDAY': 'Tuesday',
          'WEDNESDAY': 'Wednesday',
          'THURSDAY': 'Thursday',
          'FRIDAY': 'Friday',
          'SATURDAY': 'Saturday',
          'SUNDAY': 'Sunday'
        };
        return `Every ${days[recurrence.preference]}`;
      }
      return 'Exact date';
    case 'EARLY_MONTH': return 'Early month (1st-10th)';
    case 'MID_MONTH': return 'Mid month (11th-20th)';
    case 'LATE_MONTH': return 'Late month (21st-31st)';
    case 'CUSTOM_RANGE': return 'Custom day range';
    case 'WEEKDAY': return 'Weekdays only (Mon-Fri)';
    case 'WEEKEND': return 'Weekends only (Sat-Sun)';
    case 'MONTH_RANGE': return 'Month range';
    case 'SEASON': 
      const seasons = {
        'SPRING': 'Spring (Mar-May)',
        'SUMMER': 'Summer (Jun-Aug)',
        'FALL': 'Fall (Sep-Nov)',
        'WINTER': 'Winter (Dec-Feb)'
      };
      return seasons[recurrence.preference] || 'Seasonal';
    default: return flexibility;
  }
};

export const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[parseInt(monthNumber) - 1];
};

export const getTransactionTypeColor = (type) => {
  return type?.toLowerCase() === 'credit'
    ? 'bg-green-100 text-green-700 border-green-200' 
    : 'bg-red-100 text-red-700 border-red-200';
};

export const getTransactionAmountColor = (type) => {
  return type?.toLowerCase() === 'credit'
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';
};