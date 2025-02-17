import React from 'react';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight, DollarSign, TrendingDown, TrendingUp, Wallet, PiggyBank } from 'lucide-react';
import { StatCard } from './StatCard';
import { TransactionTable } from './TransactionTable';
import { useDashboardData } from '../../../hooks/useDashboardData';
import FinancialDistributionChart from './FinancialDistributionChart';
import ExpensesByCategoryChart from './ExpensesByCategoryChart';
import TransactionsSection from './TransactionsSection';

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];

// Empty state components
const EmptyChartState = ({ title }) => (
  <Card className="h-full">
    <CardContent className="h-full flex flex-col items-center justify-center p-6 text-center">
      <PiggyBank className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">
        Your financial story is just beginning! Add some transactions to see your data come to life. 🌱
      </p>
    </CardContent>
  </Card>
);

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

  const hasNoData = !expensesByCategory || expensesByCategory.length === 0;

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
      dataIndex: 'personalShare',
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
    <div className="flex flex-col space-y-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-center sm:justify-start gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => handleMonthChange(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-lg font-medium min-w-[160px] text-center">
          {selectedDate.format('MMMM YYYY')}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => handleMonthChange(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
        
      {/* Stats Overview */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <StatCard title="Total Income" value={income || 0} icon={TrendingUp} />
        <StatCard title="Total Expenses" value={expenses || 0} icon={TrendingDown} />
        <StatCard title="Total Savings" value={savings || 0} icon={Wallet} />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        {hasNoData ? (
          <EmptyChartState title="No Financial Data Yet" />
        ) : (
          <FinancialDistributionChart income={income} expenses={expenses} savings={savings} />
        )}
        
        {hasNoData ? (
          <EmptyChartState title="No Expense Categories Yet" />
        ) : (
          <ExpensesByCategoryChart expensesByCategory={expensesByCategory} />
        )}
      </div>

      {/* Transactions Section */}
      <div className="mt-4 md:mt-6">
        <TransactionsSection
          transactions={transactions}
          incomeTransactions={incomeTransactions}
          savingsTransactions={savingsTransactions}
          expenseColumns={expenseColumns}
          incomeAndSavingsColumns={incomeAndSavingsColumns}
        />
      </div>
    </div>
  );
};

export default Dashboard;