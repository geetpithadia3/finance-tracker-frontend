import { useState, useEffect } from 'react';
import moment from 'moment';
import { budgetsApi } from '../api/budgets';

export const useDashboardData = (initialDate = moment().subtract(1, 'months')) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [expenses, setExpenses] = useState(0);
  const [savings, setSavings] = useState(0);
  const [income, setIncome] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [incomeTransactions, setIncomeTransactions] = useState([]);
  const [savingsTransactions, setSavingsTransactions] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const formatTransactions = (data = []) => {
    return data.map(item => ({
      ...item,
      key: item.id.toString(),
      deleted: false,
    }));
  };

  const calculateTotal = (transactions, type = 'expense') => {
    return transactions.reduce((acc, item) => {
      // Only use personalShare for expenses if it has a value
      const amount = type === 'expense' && item.personalShare !== undefined && item.personalShare !== 0 ? 
        parseFloat(item.personalShare) : 
        parseFloat(item.amount);
      return acc + amount;
    }, 0).toFixed(2);
  };

  const fetchDashboardData = async () => {
    try {
      const data = await budgetsApi.getDashboardData(selectedDate.format('YYYY-MM'));

      const formattedExpenses = formatTransactions(data.expenses);
      const formattedIncome = formatTransactions(data.income);
      const formattedSavings = formatTransactions(data.savings);

      setTransactions(formattedExpenses);
      setIncomeTransactions(formattedIncome);
      setSavingsTransactions(formattedSavings);

      setExpenses(calculateTotal(formattedExpenses, 'expense'));
      setIncome(calculateTotal(formattedIncome, 'income'));
      setSavings(calculateTotal(formattedSavings, 'savings'));

      // Calculate expenses by category using personalShare for consistency
      const categoryTotals = formattedExpenses.reduce((acc, item) => {
        const amount = item.personalShare !== undefined && item.personalShare !== 0 ? 
          parseFloat(item.personalShare) : 
          parseFloat(item.amount);
        acc[item.category] = (acc[item.category] || 0) + amount;
        return acc;
      }, {});

      setExpensesByCategory(
        Object.entries(categoryTotals).map(([category, total]) => ({
          category,
          value: parseFloat(total.toFixed(2)),
        }))
      );

      if (Array.isArray(data.budgets)) {
        const budgetProgress = data.budgets.map(budget => ({
          ...budget,
          spent: formattedExpenses
            .filter(expense => expense.category === budget.category)
            .reduce((acc, expense) => {
              const amount = expense.personalShare !== undefined && expense.personalShare !== 0 ? 
                parseFloat(expense.personalShare) : 
                parseFloat(expense.amount);
              return acc + amount;
            }, 0),
        }));
        setBudgets(budgetProgress);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  const handleMonthChange = (direction) => {
    setSelectedDate(prev => prev.clone().add(direction, 'months'));
  };

  return {
    selectedDate,
    expenses,
    savings,
    income,
    transactions,
    incomeTransactions,
    savingsTransactions,
    expensesByCategory,
    budgets,
    handleMonthChange,
  };
}; 