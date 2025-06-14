import React from 'react';
import moment from 'moment';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Wallet, PiggyBank } from 'lucide-react';
import { StatCard } from './StatCard';
import { useDashboardData } from '../../../hooks/useDashboardData';
import FinancialDistributionChart from './FinancialDistributionChart';
import ExpensesByCategoryChart from './ExpensesByCategoryChart';
import TransactionsSection from './TransactionsSection';


// Empty state components
const EmptyChartState = ({ title }) => (
  <Card className="h-full">
    <CardContent className="h-full flex flex-col items-center justify-center p-4 sm:p-8">
      <PiggyBank className="h-8 w-8 sm:h-10 sm:w-10 text-sumi-ink-400 mb-2 sm:mb-3" />
      <div className="font-semibold text-sm sm:text-lg text-sumi-ink-700 mb-1 text-center">{title}</div>
      <div className="text-xs sm:text-sm text-sumi-ink-500 text-center max-w-xs">
        Your financial story is just beginning! Add some transactions to see your data come to life. 🌱
      </div>
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
      dataIndex: 'occurredOn',
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
    <div className="flex flex-col space-y-4 sm:space-y-6 w-full max-w-full">
      {/* Date Navigation */}
      <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 w-full max-w-full">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9"
          onClick={() => handleMonthChange(-1)}
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <div className="text-sm sm:text-lg font-medium min-w-[120px] sm:min-w-[160px] text-center">
          {selectedDate.format('MMMM YYYY')}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9"
          onClick={() => handleMonthChange(1)}
        >
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
        
      {/* Stats Overview */}
      <div className="grid gap-2 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 w-full max-w-full">
        <StatCard title="Total Income" value={income || 0} icon={TrendingUp} />
        <StatCard title="Total Expenses" value={expenses || 0} icon={TrendingDown} />
        <StatCard title="Total Savings" value={savings || 0} icon={Wallet} />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-2 sm:space-y-4 w-full max-w-full">
        <TabsList className="grid w-full grid-cols-2 gap-1 sm:gap-2">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs sm:text-sm">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Charts Section */}
          <div className="grid gap-2 sm:gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2 w-full max-w-full">
            <div className="w-full max-w-full overflow-x-auto">
              {hasNoData ? (
                <EmptyChartState title="No Financial Data Yet" />
              ) : (
                <FinancialDistributionChart income={income} expenses={expenses} savings={savings} />
              )}
            </div>
            
            <div className="w-full max-w-full overflow-x-auto">
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
      </Tabs>
    </div>
  );
};

export default Dashboard;