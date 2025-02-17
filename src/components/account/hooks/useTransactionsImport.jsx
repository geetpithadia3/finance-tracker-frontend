import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { transactionsApi } from '../../../api/transactions';
import { categoriesApi } from '../../../api/categories';
import moment from 'moment';
import Papa from 'papaparse';

export const useTransactionsImport = (selectedAccount, onClose) => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    }
  };

  const formatTransactions = (transactions) => {
    return transactions.map((item, index) => {
      const category = categories.find(cat => cat.name === (item.category || 'General')) || { id: null };
      return {
        id: index.toString(),
        date: moment(item.date || item.Date),
        description: item.description || item.Description,
        type: item.type || item['Type of Transaction'],
        amount: item.amount || item.Amount,
        category: category || null,
      };
    });
  };

  const handleFileUpload = (file) => {
    setIsLoading(true);
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const formattedData = formatTransactions(results.data);
        setData(formattedData);
        setIsLoading(false);
        toast({
          title: "File Uploaded! 📂✨",
          description: `${formattedData.length} transactions ready for their debut!`,
        });
      },
      error: () => {
        toast({
          title: "File Fumble! 📁💨",
          description: "That file's playing hard to get. Try another?",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    });
  };

  const saveTransactions = async () => {
    setIsLoading(true);
    try {
      const formattedData = data.map(item => ({
        ...item,
        occurredOn: item.date.format('YYYY-MM-DD'),
        accountId: selectedAccount,
        categoryId: item.category?.id || null,
      }));

      await transactionsApi.create(formattedData);
      toast({
        title: "Transactions Saved! 🎊",
        description: "All your transactions are safe and sound!",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Save Stumble! 🎪",
        description: "Those transactions are being shy. Shall we try again?",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    setData,
    categories,
    isLoading,
    fetchCategories,
    handleFileUpload,
    saveTransactions,
  };
}; 