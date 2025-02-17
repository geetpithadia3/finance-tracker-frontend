import { useState, useEffect } from 'react';
import { accountsApi } from '../../../api/accounts';
import { toast } from "@/components/ui/use-toast";

export const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);

  const fetchAccounts = async () => {
    try {
      const data = await accountsApi.getAll();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const createAccount = async (accountData) => {
    try {
      await accountsApi.create(accountData);
      await fetchAccounts();
      toast({
        title: "Account Created! 🎉",
        description: "Your money has a new home sweet home",
      });
      return true;
    } catch (error) {
      console.error('Error saving account:', error);
      toast({
        title: "Oopsie! 😅",
        description: "Your account took a rain check. Let's try again!",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteAccount = async (accountId) => {
    try {
      await accountsApi.delete(accountId);
      await fetchAccounts();
      toast({
        title: "Account Deleted 👋",
        description: "That account has sailed into the sunset",
      });
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Houston, We Have a Problem! 🚀",
        description: "That account is being stubborn. Give it another shot!",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return {
    accounts,
    fetchAccounts,
    createAccount,
    deleteAccount,
  };
}; 