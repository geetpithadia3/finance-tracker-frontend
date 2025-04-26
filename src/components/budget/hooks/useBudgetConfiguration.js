import { useState, useEffect, useCallback } from 'react';
import { budgetsApi } from '@/api/budgets';
import { categoriesApi } from '@/api/categories';
import { useToast } from "@/components/ui/use-toast";

export const useBudgetConfiguration = (initialDate) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [totalBudget, setTotalBudget] = useState(0);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  }, [toast]);

  const fetchExistingBudgets = useCallback(async () => {
    try {
      if (categories.length === 0) return;

      const yearMonth = selectedDate.format('YYYY-MM');
      const response = await budgetsApi.get(yearMonth);
      
      const budgetMap = {};
      categories.forEach(category => {
        budgetMap[category.name] = 0;
      });

      if (response && response.categories) {
        response.categories.forEach(budget => {
          const category = categories.find(c => c.id === budget.categoryId);
          if (category) {
            budgetMap[category.name] = parseFloat(budget.limit) || 0;
          }
        });
      }
      
      setBudgets(budgetMap);
      
      const total = Object.values(budgetMap).reduce((sum, amount) => sum + parseFloat(amount || 0), 0);
      setTotalBudget(total);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast({
        title: "Error",
        description: "Failed to load existing budgets",
        variant: "destructive",
      });
    }
  }, [categories, selectedDate, toast]);

  const handleBudgetChange = useCallback((category, value) => {
    setBudgets(prevBudgets => {
      const newBudgets = { ...prevBudgets };
      newBudgets[category] = parseFloat(value) || 0;
      
      const total = Object.values(newBudgets).reduce((sum, amount) => sum + amount, 0);
      setTotalBudget(total);
      
      return newBudgets;
    });
  }, []);

  const saveBudgetConfiguration = useCallback(async () => {
    try {
      const budgetData = {
        yearMonth: selectedDate.format('YYYY-MM'),
        categoryLimits: categories.map(category => ({
          categoryId: category.id,
          budgetAmount: parseFloat(budgets[category.name] || 0)
        }))
      };

      await budgetsApi.create(budgetData);
      toast({
        title: "Success",
        description: "Budget configuration saved successfully",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save budget configuration",
        variant: "destructive",
      });
      return false;
    }
  }, [categories, budgets, selectedDate, toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      fetchExistingBudgets();
    }
  }, [categories, fetchExistingBudgets]);

  return {
    categories,
    budgets,
    totalBudget,
    selectedDate,
    setSelectedDate,
    handleBudgetChange,
    saveBudgetConfiguration
  };
}; 