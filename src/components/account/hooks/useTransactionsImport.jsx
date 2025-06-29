import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { transactionsApi } from '../../../api/transactions';
import { categoriesApi } from '../../../api/categories';
import { smartApiClient } from '../../../api/smartClient';
import moment from 'moment';
import Papa from 'papaparse';

export const useTransactionsImport = (selectedAccount, onClose) => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = async () => {
    if (isLoading) return; // Prevent concurrent fetches
    
    try {
      setIsLoading(true);
      console.log("Fetching categories...");
      const data = await categoriesApi.getAll();
      console.log("Categories fetched:", data);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTransactions = async (transactions) => {
    const formattedTransactions = [];
    const categorizationRequests = [];
    
    // First pass: prepare data for batch categorization
    for (const item of transactions) {
      console.log('Item:', item);
      const subDescription = item['Sub-description'] || item.subDescription || '';
      console.log('Sub-Description:', subDescription);
      const description = (item.description || item.Description || '') + 
                         (subDescription ? ` - ${subDescription}` : '');
      const amount = parseFloat(item.amount || item.Amount || 0);
      const type = (item.type || item['Type of Transaction'] || '').toUpperCase();
      const date = item.date || item.Date;
      
      if (description) {
        categorizationRequests.push({ 
          description,
          amount,
          type,
          occurred_on: moment(date).format('YYYY-MM-DD')
        });
      }
      
      // Add to formatted transactions with placeholder for category
      formattedTransactions.push({
        id: formattedTransactions.length.toString(),
        date: moment(item.date || item.Date),
        description: description,
        type: item.type || item['Type of Transaction'],
        amount: item.amount || item.Amount,
        category: null,
        autoCategorized: false
      });
    }
    
    // Make batch categorization request if we have any transactions
    if (categorizationRequests.length > 0) {
      try {
        const categorizations = await smartApiClient.post('/categorize-batch', categorizationRequests);
        
        // Apply categorization results to formatted transactions
        categorizations.forEach((result, index) => {
          console.log('Categorization result:', result);
          console.log('Category:', result.category);
          if (result.category) {
            const category = categories.find(cat => 
              cat.name.toLowerCase() === result.category.toLowerCase()
            );
            
            if (category) {
              formattedTransactions[index].category = category;
              formattedTransactions[index].autoCategorized = true;
              formattedTransactions[index].reasoning = "AutoCategorized:" + result.reasoning || 'Based on transaction pattern';
            }
          }
        });
      } catch (error) {
        console.error('Error getting batch category suggestions:', error);
      }
    }
    
    // Second pass: apply fallback categories for any transactions that weren't categorized
    for (let i = 0; i < formattedTransactions.length; i++) {
      const transaction = formattedTransactions[i];
      const originalItem = transactions[i];
      
      if (!transaction.category) {
        // If no category from API or error, fall back to manual matching or General
        const fallbackCategory = categories.find(cat => 
          cat.name === (originalItem.category || 'General')
        ) || { id: null };
        
        transaction.category = fallbackCategory;
      }
    }
    
    return formattedTransactions;
  };

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    
    // Make sure we have categories before processing
    if (categories.length === 0) {
      try {
        await fetchCategories();
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: "Error",
          description: "Failed to fetch categories for auto-categorization",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }
    
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const formattedData = await formatTransactions(results.data);
          setData(formattedData);
          toast({
            title: "File Uploaded! 📂✨",
            description: `${formattedData.length} transactions ready for their debut!`,
          });
        } catch (error) {
          console.error('Error formatting transactions:', error);
          toast({
            title: "Processing Error! 🔄❌",
            description: "Something went wrong while processing your transactions.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
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
    if (isLoading) return; // Prevent concurrent saves
    
    setIsLoading(true);
    try {
      console.log("Preparing to save transactions for account:", selectedAccount);
      const formattedData = data.map(item => ({
        ...item,
        occurredOn: item.date.format('YYYY-MM-DD'),
        accountId: selectedAccount,
        categoryId: item.category?.id || null,
      }));

      console.log("Saving transactions:", formattedData);
      await transactionsApi.create(formattedData);
      console.log("Transactions saved successfully");
      
      toast({
        title: "Transactions Saved! 🎊",
        description: "All your transactions are safe and sound!",
      });
      onClose();
    } catch (error) {
      console.error("Error saving transactions:", error);
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