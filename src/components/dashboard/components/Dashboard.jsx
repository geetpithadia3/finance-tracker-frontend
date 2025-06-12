import React from 'react';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChevronLeft, ChevronRight, DollarSign, TrendingDown, TrendingUp, Wallet, PiggyBank, Calculator } from 'lucide-react';
import { StatCard } from './StatCard';
import { useDashboardData } from '../../../hooks/useDashboardData';
import FinancialDistributionChart from './FinancialDistributionChart';
import ExpensesByCategoryChart from './ExpensesByCategoryChart';
import TransactionsSection from './TransactionsSection';
import SmartAllocation from '../../allocation/SmartAllocation';

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];

// Empty state components
const EmptyChartState = ({ title }) => (
  <Card className="h-full">
    <CardContent className="h-full flex flex-col items-center justify-center p-6">
      <Alert className="border-none shadow-none">
        <PiggyBank className="h-12 w-12 text-muted-foreground mb-2" />
        <AlertTitle className="mb-2">{title}</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground">
          Your financial story is just beginning! Add some transactions to see your data come to life. 🌱
        </AlertDescription>
      </Alert>
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="allocation">Smart Allocation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Charts Section */}
          <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
            <div className="w-full lg:max-w-full overflow-hidden">
              {hasNoData ? (
                <EmptyChartState title="No Financial Data Yet" />
              ) : (
                <FinancialDistributionChart income={income} expenses={expenses} savings={savings} />
              )}
            </div>
            
            <div className="w-full lg:max-w-full overflow-hidden">
              {hasNoData ? (
                <EmptyChartState title="No Expense Categories Yet" />
              ) : (
                <ExpensesByCategoryChart expensesByCategory={expensesByCategory} />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          {/* Transactions Section */}
          <TransactionsSection
            transactions={transactions}
            incomeTransactions={incomeTransactions}
            savingsTransactions={savingsTransactions}
            expenseColumns={expenseColumns}
            incomeAndSavingsColumns={incomeAndSavingsColumns}
          />
        </TabsContent>

        <TabsContent value="allocation">
          {/* Smart Allocation Section */}
          <SmartAllocation />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;