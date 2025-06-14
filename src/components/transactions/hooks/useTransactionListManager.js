import { useState, useEffect } from 'react';
import moment from 'moment';
import { transactionsApi } from '@/api/transactions';
import { categoriesApi } from '@/api/categories';
import { useToast } from "@/components/ui/use-toast";

export const useTransactionListManager = (initialDate = moment().subtract(1, 'months')) => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [editMode, setEditMode] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'ascending' });

  const fetchTransactions = async (date) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await transactionsApi.getAll(date.format('YYYY-MM'));
      const formattedData = formatTransactionData(data);
      setTransactions(formattedData);
    } catch (error) {
      setError('Failed to load transactions');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const formattedCategories = await categoriesApi.getAllFormatted();
      setCategories(formattedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const formatTransactionData = (data) => {
    return (Array.isArray(data) ? data : []).map(item => {
      // Handle category properly
      let category = item.category;
      
      // If category is a string but categoryId exists, create a proper category object
      if (typeof category === 'string' && item.categoryId) {
        category = {
          id: item.categoryId,
          name: category
        };
      }
      
      return {
        ...item,
        key: item.id.toString(),
        date: moment(item.date),
        deleted: false,
        category: category // Use the properly formatted category
      };
    });
  };

  const handleMonthChange = (direction) => {
    setSelectedDate(prev => prev.clone().add(direction, 'months'));
  };

  const handleEdit = (transaction, field, value) => {
    setTransactions(prev =>
      prev.map(t => {
        if (t.key === transaction.key) {
          // Handle category updates properly
          if (field === 'category') {
            const categoryObj = categories.find(c => c.name === value);
            return {
              ...t,
              category: categoryObj || { id: '', name: value },
              categoryId: categoryObj?.id || '',
              modified: true
            };
          }
          // Handle other field updates
          return {
            ...t,
            [field]: value,
            modified: true
          };
        }
        return t;
      })
    );
  };

  const handleSaveChanges = async () => {
    try {
      const updatedTransactions = transactions.filter(t => t.modified);
      await transactionsApi.update(updatedTransactions);
      await fetchTransactions(selectedDate);
      setEditMode(false);
      toast({
        title: "Changes Saved! 🎯",
        description: "Your transactions are all tucked in and updated",
      });
    } catch (error) {
      toast({
        title: "Uh-oh! 🎭",
        description: "Those changes played hide and seek. Let's try again!",
        variant: "destructive",
      });
    }
  };

  const handleRequestSort = (key) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
        };
      }
      return { key, direction: 'ascending' };
    });

    setTransactions(prev => {
      const sortedTransactions = [...prev].sort((a, b) => {
        let aValue = key === 'category' ? a[key]?.name : a[key];
        let bValue = key === 'category' ? b[key]?.name : b[key];

        // Handle date comparison
        if (key === 'occurredOn') {
          return moment(aValue).valueOf() - moment(bValue).valueOf();
        }

        // Handle amount comparison
        if (key === 'amount') {
          return parseFloat(aValue) - parseFloat(bValue);
        }

        // Handle string comparison
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      });

      return sortConfig.direction === 'descending' ? sortedTransactions.reverse() : sortedTransactions;
    });
  };

  useEffect(() => {
    fetchTransactions(selectedDate);
    fetchCategories();
  }, [selectedDate]);

  return {
    transactions,
    categories,
    selectedDate,
    editMode,
    selectedTransaction,
    isLoading,
    error,
    transactionModalOpen,
    sortConfig,
    setTransactionModalOpen,
    setSelectedTransaction,
    setEditMode,
    handleMonthChange,
    handleEdit,
    handleSaveChanges,
    fetchTransactions,
    handleRequestSort,
  };
}; 