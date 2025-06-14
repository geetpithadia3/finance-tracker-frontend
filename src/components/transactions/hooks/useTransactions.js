import { useState, useEffect } from 'react';
import moment from 'moment';
import { transactionsApi } from '../../../api/transactions';
import { formatCurrency } from '../utils/transactionHelpers';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().subtract(1, 'months'));
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async (date) => {
    try {
      setIsLoading(true);
      setError(null);
      const month = date.format('MM');
      const year = date.year();

      const data = await transactionsApi.getAll(`${year}-${month}`);
      const formattedData = formatTransactionData(data);
      setTransactions(formattedData);
    } catch (error) {
      setError('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(selectedDate);
  }, [selectedDate]);

  const formatTransactionData = (data) => {
    return (Array.isArray(data) ? data : []).map(item => ({
      ...item,
      key: item.id.toString(),
      date: moment(item.date),
      deleted: false,
    }));
  };

  const handleMonthChange = (direction) => {
    setSelectedDate(prev => prev.clone().add(direction, 'months'));
  };

  const handleEdit = (transaction, field, value) => {
    setTransactions(prev =>
      prev.map(t =>
        t.key === transaction.key
          ? { ...t, [field]: value, modified: true }
          : t
      )
    );
  };

  const handleDelete = (transaction) => {
    setTransactions(prev =>
      prev.map(t =>
        t.key === transaction.key
          ? { ...t, deleted: !t.deleted, modified: true }
          : t
      )
    );
  };

  const handleSaveChanges = async () => {
    try {
      const updatedTransactions = transactions
        .filter(t => t.deleted || t.modified)
        .map(formatTransactionForUpdate);

      await transactionsApi.update(updatedTransactions);
      await fetchTransactions(selectedDate);
      setEditMode(false);
    } catch (error) {
      // Error handling could be improved with toast notifications
    }
  };


  return {
    transactions,
    selectedDate,
    editMode,
    isLoading,
    error,
    handleMonthChange,
    handleEdit,
    handleDelete,
    handleSaveChanges,
    setEditMode,
    formatCurrency,
    fetchTransactions,
  };
}; 