import React from 'react';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight, DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { StatCard } from './StatCard';
import { TransactionTable } from './TransactionTable';
import { useDashboardData } from '../../../hooks/useDashboardData';
import FinancialDistributionChart from './FinancialDistributionChart';
import ExpensesByCategoryChart from './ExpensesByCategoryChart';
import TransactionsSection from './TransactionsSection';

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];

const Dashboard = () => {
  const {
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
  } = useDashboardData();

  const expenseColumns = [
    {
      title: 'Date',
      dataIndex: 'occurredOn',
      render: (date) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'Category',
      dataIndex: 'category',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (amount) => `$${parseFloat(amount).toFixed(2)}`,
    },
  ];

  const incomeAndSavingsColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      render: (date) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (amount) => `$${parseFloat(amount).toFixed(2)}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleMonthChange(-1)}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-base font-medium">
          {selectedDate.format('MMMM YYYY')}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleMonthChange(1)}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Total Income" value={income} icon={TrendingUp} />
        <StatCard title="Total Expenses" value={expenses} icon={TrendingDown} />
        <StatCard title="Total Savings" value={savings} icon={Wallet} />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <FinancialDistributionChart income={income} expenses={expenses} savings={savings} />
        <ExpensesByCategoryChart expensesByCategory={expensesByCategory} />
      </div>

      {/* Transactions Section */}
      <TransactionsSection
        transactions={transactions}
        incomeTransactions={incomeTransactions}
        savingsTransactions={savingsTransactions}
        expenseColumns={expenseColumns}
        incomeAndSavingsColumns={incomeAndSavingsColumns}
      />
    </div>
  );
};

export default Dashboard;