import { useState, useEffect, useMemo } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { budgetsApi } from '../../../api/budgets';
import moment from 'moment';

export const useBudget = (initialDate = moment()) => {
  const { toast } = useToast();
  const [budgets, setBudgets] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const currentYearMonth = useMemo(() => 
    selectedDate.format('YYYY-MM'),
    [selectedDate.format('YYYY-MM')]
  );

  const fetchBudgets = async () => {
    try {
      const data = await budgetsApi.get(currentYearMonth);
      
      if (data && data.categories && data.categories.length > 0) {
        const filteredCategories = data.categories.filter(cat => cat.categoryName !== 'Income');
        setBudgets(filteredCategories);
        const total = filteredCategories.reduce((acc, budget) => acc + budget.limit, 0);
        const spent = filteredCategories.reduce((acc, budget) => acc + budget.spent, 0);
        
        setTotalBudget(total);
        setTotalSpent(spent);

        handleOverBudgetAlert(filteredCategories);
      } else {
        handleEmptyBudgets();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleOverBudgetAlert = (categories) => {
    const overBudgetCategories = categories.filter(cat => cat.spent > cat.limit);
    if (overBudgetCategories.length > 0) {
      toast({
        title: "Budget Alert! 🚨",
        description: `Whoopsie! ${overBudgetCategories.length} ${
          overBudgetCategories.length === 1 ? 'category is' : 'categories are'
        } doing a little happy dance over their limits!`,
        variant: "destructive",
      });
    }
  };

  const handleEmptyBudgets = () => {
    setBudgets([]);
    setTotalBudget(0);
    setTotalSpent(0);
    toast({
      title: "Fresh Start! 🌱",
      description: "Time to set up your first budget and make those money goals happen!",
    });
  };

  const handleError = (error) => {
    console.error('Error loading budgets:', error);
    toast({
      title: "Budget Hiccup! 🎪",
      description: "Your budgets are playing hide and seek. Let's try again!",
      variant: "destructive",
    });
  };

  useEffect(() => {
    fetchBudgets();
  }, [selectedDate]);

  return {
    budgets,
    totalBudget,
    totalSpent,
    selectedDate,
    setSelectedDate,
    currentYearMonth
  };
}; 