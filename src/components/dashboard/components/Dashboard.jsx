import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, TrendingUp, Target } from 'lucide-react';
import { useDashboardData } from '../../../hooks/useDashboardData';
import FinancialDistributionChart from './FinancialDistributionChart';
import ExpensesByCategoryChart from './ExpensesByCategoryChart';
import SpendingTrendsChart from './SpendingTrendsChart';
import BudgetProgressChart from './BudgetProgressChart';
import BudgetWidgets from './BudgetWidgets';

// Empty state components
const EmptyChartState = ({ title, emoji, description }) => (
  <Card className="h-full bg-gray-50 border border-gray-200">
    <CardContent className="h-full flex flex-col items-center justify-center p-8">
      <div className="text-4xl mb-3 text-gray-400">{emoji}</div>
      <div className="font-medium text-gray-700 mb-1 text-center">{title}</div>
      <div className="text-sm text-gray-500 text-center max-w-xs">{description}</div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const {
    selectedDate,
    expenses,
    savings,
    income,
    expensesByCategory,
    handleMonthChange,
    budgetCategories,
    spendingTrends,
    netFlow,
    budgetUtilization,
    financialStatus,
  } = useDashboardData();

  const hasNoData = !expensesByCategory || expensesByCategory.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Financial Dashboard</h1>
              <p className="text-gray-600">Track your money, achieve your goals</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => handleMonthChange(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-lg font-medium min-w-[140px] text-center text-gray-900">
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
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">${income?.toFixed(0) || '0'}</div>
              <div className="text-sm text-gray-600">Income</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">${expenses?.toFixed(0) || '0'}</div>
              <div className="text-sm text-gray-600">Expenses</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">${savings?.toFixed(0) || '0'}</div>
              <div className="text-sm text-gray-600">Savings</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">${netFlow?.toFixed(0) || '0'}</div>
              <div className="text-sm text-gray-600">Net Flow</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  financialStatus.status_color === 'green' ? 'bg-green-100' :
                  financialStatus.status_color === 'blue' ? 'bg-blue-100' :
                  financialStatus.status_color === 'yellow' ? 'bg-yellow-100' :
                  financialStatus.status_color === 'orange' ? 'bg-orange-100' :
                  financialStatus.status_color === 'red' ? 'bg-red-100' :
                  'bg-gray-100'
                }`}>
                  <TrendingUp className={`h-5 w-5 ${
                    financialStatus.status_color === 'green' ? 'text-green-600' :
                    financialStatus.status_color === 'blue' ? 'text-blue-600' :
                    financialStatus.status_color === 'yellow' ? 'text-yellow-600' :
                    financialStatus.status_color === 'orange' ? 'text-orange-600' :
                    financialStatus.status_color === 'red' ? 'text-red-600' :
                    'text-gray-600'
                  }`} />
                </div>
                <div>
                  <div className="text-sm text-gray-600 font-medium">Financial Health</div>
                  <div className="text-lg font-semibold text-gray-900">{financialStatus.status}</div>
                  <div className="text-xs text-gray-500">Score: {financialStatus.score}/100</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Target className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 font-medium">Budget Used</div>
                  <div className="text-lg font-semibold text-gray-900">{budgetUtilization.toFixed(1)}%</div>
                  {financialStatus.details && financialStatus.details.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">{financialStatus.details[0]}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="w-full">
                {hasNoData ? (
                  <EmptyChartState 
                    title="No Financial Data" 
                    emoji="💰" 
                    description="Start adding transactions to see your financial story"
                  />
                ) : (
                  <FinancialDistributionChart income={income} expenses={expenses} savings={savings} />
                )}
              </div>
              
              <div className="w-full">
                {hasNoData ? (
                  <EmptyChartState 
                    title="No Categories" 
                    emoji="📊" 
                    description="Categorize your expenses to see spending patterns"
                  />
                ) : (
                  <ExpensesByCategoryChart expensesByCategory={expensesByCategory} />
                )}
              </div>
            </div>

            {/* Spending Trends */}
            <div className="w-full">
              <SpendingTrendsChart spendingTrends={spendingTrends} />
            </div>
          </div>

          {/* Right Column - Budget */}
          <div className="space-y-6">
            {/* Budget Progress */}
            <div className="w-full">
              {hasNoData ? (
                <EmptyChartState 
                  title="No Budget Data" 
                  emoji="🎯" 
                  description="Set up budgets to track your spending goals"
                />
              ) : (
                <BudgetProgressChart budgetCategories={budgetCategories} />
              )}
            </div>

            {/* Budget Widgets */}
            <div className="w-full">
              <BudgetWidgets budgetData={budgetCategories} selectedDate={selectedDate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;