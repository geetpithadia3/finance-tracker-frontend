import { useState, useEffect } from 'react';
import moment from 'moment';
import { apiClient } from '../api/client';

export const useDashboardData = (initialDate = moment().subtract(1, 'months')) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [expenses, setExpenses] = useState(0);
  const [savings, setSavings] = useState(0);
  const [income, setIncome] = useState(0);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [spendingTrends, setSpendingTrends] = useState([]);
  const [projectBudgets, setProjectBudgets] = useState([]);
  const [netFlow, setNetFlow] = useState(0);
  const [savingsRate, setSavingsRate] = useState(0);
  const [budgetUtilization, setBudgetUtilization] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [avgDailySpending, setAvgDailySpending] = useState(0);
  const [daysInMonth, setDaysInMonth] = useState(0);
  const [financialStatus, setFinancialStatus] = useState({
    status: "No Budget",
    score: 0,
    status_color: "gray",
    details: ["No budget data available"]
  });

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard data from the updated endpoint
      const response = await apiClient.get(`/dashboard?year_month=${selectedDate.format('YYYY-MM')}`);
      const dashboardData = response;
      console.log("dashboardData", response);
      
      if (dashboardData) {
        // Set transaction-based stats as numbers
        setExpenses(Number(dashboardData.total_expenses) || 0);
        setIncome(Number(dashboardData.total_income) || 0);
        setSavings(Number(dashboardData.total_savings) || 0);
        
        // Set expenses by category from transactions
        if (dashboardData.expenses_by_category) {
          setExpensesByCategory(
            Object.entries(dashboardData.expenses_by_category).map(([category, value]) => ({
              category,
              value: parseFloat(value.toFixed(2)),
            }))
          );
        }
        
        // Set budget data
        if (dashboardData.budget_categories) {
          setBudgetCategories(dashboardData.budget_categories);
          setBudgets(dashboardData.budget_categories);
        }
        
        // Set spending trends
        if (dashboardData.spending_trends) {
          setSpendingTrends(dashboardData.spending_trends);
        }
        
        // Set project budgets
        if (dashboardData.project_budgets) {
          setProjectBudgets(dashboardData.project_budgets);
        }
        
        // Set additional metrics
        setNetFlow(Number(dashboardData.net_flow) || 0);
        setSavingsRate(Number(dashboardData.savings_rate) || 0);
        setBudgetUtilization(Number(dashboardData.budget_utilization) || 0);
        setCategoryCount(Number(dashboardData.category_count) || 0);
        setAvgDailySpending(Number(dashboardData.avg_daily_spending) || 0);
        setDaysInMonth(Number(dashboardData.days_in_month) || 0);
        
        // Set financial status
        if (dashboardData.financial_status) {
          setFinancialStatus(dashboardData.financial_status);
        }
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
    expensesByCategory,
    budgets,
    budgetCategories,
    spendingTrends,
    projectBudgets,
    netFlow,
    savingsRate,
    budgetUtilization,
    categoryCount,
    avgDailySpending,
    daysInMonth,
    financialStatus,
    handleMonthChange,
  };
}; 