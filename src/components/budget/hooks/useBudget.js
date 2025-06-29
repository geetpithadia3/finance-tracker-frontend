import { useState, useEffect, useCallback } from 'react';
import { budgetAPI } from '../../../api/budgets';
import { useToast } from '../../../hooks/use-toast';

export const useBudget = () => {
  const [budgets, setBudgets] = useState([]);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [budgetSpending, setBudgetSpending] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await budgetAPI.getBudgets();
      setBudgets(data);
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch budgets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchBudgetByMonth = useCallback(async (yearMonth) => {
    try {
      setLoading(true);
      setError(null);
      const data = await budgetAPI.getBudgetByMonth(yearMonth);
      setCurrentBudget(data);
      return data;
    } catch (err) {
      if (err.response?.status === 404) {
        setCurrentBudget(null);
        return null;
      }
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch budget",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchBudgetSpending = useCallback(async (yearMonth) => {
    try {
      setLoading(true);
      setError(null);
      const data = await budgetAPI.getBudgetSpending(yearMonth);
      setBudgetSpending(data);
      return data;
    } catch (err) {
      if (err.response?.status === 404) {
        setBudgetSpending(null);
        return null;
      }
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch budget spending data",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createBudget = useCallback(async (budgetData) => {
    try {
      setLoading(true);
      setError(null);
      const newBudget = await budgetAPI.createBudget(budgetData);
      setBudgets(prev => [newBudget, ...prev]);
      toast({
        title: "Success",
        description: "Budget created successfully",
      });
      return newBudget;
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to create budget",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateBudget = useCallback(async (budgetId, budgetData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedBudget = await budgetAPI.updateBudget(budgetId, budgetData);
      setBudgets(prev => 
        prev.map(budget => budget.id === budgetId ? updatedBudget : budget)
      );
      if (currentBudget && currentBudget.id === budgetId) {
        setCurrentBudget(updatedBudget);
      }
      toast({
        title: "Success",
        description: "Budget updated successfully",
      });
      return updatedBudget;
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to update budget",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBudget, toast]);

  const deleteBudget = useCallback(async (budgetId) => {
    try {
      setLoading(true);
      setError(null);
      await budgetAPI.deleteBudget(budgetId);
      setBudgets(prev => prev.filter(budget => budget.id !== budgetId));
      if (currentBudget && currentBudget.id === budgetId) {
        setCurrentBudget(null);
      }
      toast({
        title: "Success",
        description: "Budget deleted successfully",
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to delete budget",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentBudget, toast]);

  const copyBudget = useCallback(async (sourceYearMonth, targetYearMonth) => {
    try {
      setLoading(true);
      setError(null);
      const newBudget = await budgetAPI.copyBudget(sourceYearMonth, targetYearMonth);
      setBudgets(prev => [newBudget, ...prev]);
      toast({
        title: "Success",
        description: `Budget copied from ${sourceYearMonth} to ${targetYearMonth}`,
      });
      return newBudget;
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to copy budget",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    budgets,
    currentBudget,
    budgetSpending,
    loading,
    error,
    fetchBudgets,
    fetchBudgetByMonth,
    fetchBudgetSpending,
    createBudget,
    updateBudget,
    deleteBudget,
    copyBudget,
  };
};