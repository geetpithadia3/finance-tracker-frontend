import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Target } from 'lucide-react';
import { useDashboardData } from '../../../hooks/useDashboardData';
import { MonthSelector } from '@/components/ui/MonthSelector';
import FinancialDistributionChart from './FinancialDistributionChart';
import ExpensesByCategoryChart from './ExpensesByCategoryChart';
import SpendingTrendsChart from './SpendingTrendsChart';
import BudgetWidgets from './BudgetWidgets';
// import GoalList from '../../budget/components/GoalList';
import GoalsStats from '../../budget/components/GoalsStats';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import HelpButton from '@/components/ui/HelpButton';
import DashboardHowItWorks from './DashboardHowItWorks';

// Empty state components
const EmptyChartState = ({ title, emoji, description }) => (
  <Card className="h-full bg-muted border">
    <CardContent className="h-full flex flex-col items-center justify-center p-8">
      <div className="text-4xl mb-3 text-muted-foreground">{emoji}</div>
      <div className="font-medium text-foreground mb-1 text-center">{title}</div>
      <div className="text-sm text-muted-foreground text-center max-w-xs">{description}</div>
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 text-foreground p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Sumi Header - Philosophy-Inspired */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">墨</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Your Financial Canvas</h1>
              <p className="text-sm text-muted-foreground">
                {selectedDate.format('MMMM YYYY')} • Where intention meets insight
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <MonthSelector
              value={selectedDate.format('YYYY-MM')}
              onChange={(yearMonth) => {
                const [year, month] = yearMonth.split('-');
                const newDate = selectedDate.clone().year(parseInt(year)).month(parseInt(month) - 1);
                handleMonthChange(newDate.diff(selectedDate, 'months'));
              }}
              size="default"
            />
            <HelpButton title="Understanding Your Canvas" buttonText="Philosophy" size="sm">
              <DashboardHowItWorks />
            </HelpButton>
          </div>
        </div>

        {/* Essential Flow - Sumi Simplicity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Primary Focus: Net Flow */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 sm:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="space-y-2">
                <div className="text-xs text-primary font-medium tracking-wide uppercase">Flow State</div>
                <div className={`text-3xl font-bold ${netFlow >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ${Math.abs(netFlow)?.toFixed(0) || '0'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {netFlow >= 0 ? 'Positive Flow' : 'Outflow Exceeds'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supporting Elements: Income & Expenses */}
          <div className="sm:col-span-2 grid grid-cols-2 gap-4">
            <Card className="border-green-200/50 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800/30">
              <CardContent className="p-4 text-center">
                <div className="space-y-1">
                  <div className="text-xs text-green-700 dark:text-green-400 font-medium">Inflow</div>
                  <div className="text-xl font-semibold text-green-800 dark:text-green-300">${income?.toFixed(0) || '0'}</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-200/50 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800/30">
              <CardContent className="p-4 text-center">
                <div className="space-y-1">
                  <div className="text-xs text-blue-700 dark:text-blue-400 font-medium">Outflow</div>
                  <div className="text-xl font-semibold text-blue-800 dark:text-blue-300">${expenses?.toFixed(0) || '0'}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mindful Insights - What Matters Most */}
        <Card className="bg-gradient-to-r from-muted/50 to-muted/20 border-muted/50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Financial Harmony</h3>
                <div className="flex items-center justify-center space-x-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      financialStatus.status_color === 'green' ? 'text-green-600 dark:text-green-400' :
                      financialStatus.status_color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      financialStatus.status_color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                      financialStatus.status_color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                      financialStatus.status_color === 'red' ? 'text-red-600 dark:text-red-400' :
                      'text-muted-foreground'
                    }`}>
                      {financialStatus.status}
                    </div>
                    <div className="text-xs text-muted-foreground">Balance State</div>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{budgetUtilization.toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">Budget Flow</div>
                  </div>
                </div>
              </div>
              
              {financialStatus.details && financialStatus.details.length > 0 && (
                <div className="text-sm text-muted-foreground italic border-t border-muted pt-3">
                  "{financialStatus.details[0]}"
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Intentional Insights - Focused Information */}
        <div className="space-y-8">
          {/* Primary Focus: Financial Distribution */}
          <div className="text-center space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Your Financial Flow</h2>
            <div className="max-w-2xl mx-auto">
              {hasNoData ? (
                <EmptyChartState 
                  title="Begin Your Journey" 
                  emoji="🎋" 
                  description="Like the first brushstroke on rice paper, add your first transaction to create your financial story"
                />
              ) : (
                <FinancialDistributionChart income={income} expenses={expenses} savings={savings} />
              )}
            </div>
          </div>

          {/* Secondary Insights: Category & Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-center font-medium text-foreground">Spending Patterns</h3>
              {hasNoData ? (
                <EmptyChartState 
                  title="Mindful Categories" 
                  emoji="🌸" 
                  description="Categorize spending to understand your financial habits"
                />
              ) : (
                <ExpensesByCategoryChart expensesByCategory={expensesByCategory} />
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-center font-medium text-foreground">Flow Over Time</h3>
              <SpendingTrendsChart spendingTrends={spendingTrends} />
            </div>
          </div>

          {/* Budget & Goals: Intentional Planning */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-center font-medium text-foreground">Budget Mindfulness</h3>
              <BudgetWidgets budgetData={budgetCategories} selectedDate={selectedDate} />
            </div>

            <div className="space-y-4">
              <h3 className="text-center font-medium text-foreground">Intentional Goals</h3>
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <GoalsStats />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Sumi Wisdom Footer */}
        <div className="text-center py-8 border-t border-muted/30">
          <p className="text-sm text-muted-foreground italic">
            "The master's canvas reveals not just what is painted, but the wisdom of what is left untouched."
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;