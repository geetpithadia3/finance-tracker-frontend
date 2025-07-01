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
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-card text-card-foreground rounded-lg border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Financial Dashboard</h1>
              <p className="text-muted-foreground">Track your money, achieve your goals</p>
            </div>
            <div className="flex items-center gap-3">
              <HelpButton title="How the Dashboard Works" buttonText="How It Works">
                <DashboardHowItWorks />
              </HelpButton>
              <MonthSelector
                value={selectedDate.format('YYYY-MM')}
                onChange={(yearMonth) => {
                  const [year, month] = yearMonth.split('-');
                  const newDate = selectedDate.clone().year(parseInt(year)).month(parseInt(month) - 1);
                  handleMonthChange(newDate.diff(selectedDate, 'months'));
                }}
                size="default"
              />
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-card text-card-foreground border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">${income?.toFixed(0) || '0'}</div>
              <div className="text-sm text-muted-foreground">Income</div>
            </CardContent>
          </Card>
          <Card className="bg-card text-card-foreground border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">${expenses?.toFixed(0) || '0'}</div>
              <div className="text-sm text-muted-foreground">Expenses</div>
            </CardContent>
          </Card>
          <Card className="bg-card text-card-foreground border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">${savings?.toFixed(0) || '0'}</div>
              <div className="text-sm text-muted-foreground">Savings</div>
            </CardContent>
          </Card>
          <Card className="bg-card text-card-foreground border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">${netFlow?.toFixed(0) || '0'}</div>
              <div className="text-sm text-muted-foreground">Net Flow</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-card text-card-foreground border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  financialStatus.status_color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                  financialStatus.status_color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                  financialStatus.status_color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                  financialStatus.status_color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' :
                  financialStatus.status_color === 'red' ? 'bg-red-100 dark:bg-red-900/20' :
                  'bg-muted'
                }`}>
                  <TrendingUp className={`h-5 w-5 ${
                    financialStatus.status_color === 'green' ? 'text-green-600 dark:text-green-400' :
                    financialStatus.status_color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    financialStatus.status_color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                    financialStatus.status_color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                    financialStatus.status_color === 'red' ? 'text-red-600 dark:text-red-400' :
                    'text-muted-foreground'
                  }`} />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                    Financial Health
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" /></svg>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs p-3">
                        <div className="text-xs text-foreground dark:text-gray-100">
                          <strong>How was your score calculated?</strong><br/>
                          <span>
                            Your score (<b>{financialStatus.score}/100</b>: <b>{financialStatus.status}</b>) is based on:
                            <ul className="list-disc pl-4 mt-1">
                              <li><b>Budget Utilization (30%)</b>: Lower spending vs. budget = higher score.</li>
                              <li><b>Spending Velocity (25%)</b>: Are you spending too fast for the month?</li>
                              <li><b>Category Health (35%)</b>: Each category is scored by % used (over = 0, under 70% = 100).</li>
                              <li><b>Emergency Fund (10%)</b>: Placeholder for savings rate.</li>
                            </ul>
                            <span className="block mt-1">Higher is better. See color legend for status.</span>
                          </span>
                          <ul className="list-disc pl-4 mt-1">
                            <li><span className="text-green-600 font-semibold">80-100:</span> Excellent</li>
                            <li><span className="text-blue-600 font-semibold">60-79:</span> Good</li>
                            <li><span className="text-yellow-600 font-semibold">40-59:</span> Caution</li>
                            <li><span className="text-orange-600 font-semibold">20-39:</span> Warning</li>
                            <li><span className="text-red-600 font-semibold">0-19:</span> Critical</li>
                          </ul>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-lg font-semibold text-foreground">{financialStatus.status}</div>
                  <div className="text-xs text-muted-foreground">Score: {financialStatus.score}/100</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Target className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground font-medium">Budget Used</div>
                  <div className="text-lg font-semibold text-foreground">{budgetUtilization.toFixed(1)}%</div>
                  {financialStatus.details && financialStatus.details.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">{financialStatus.details[0]}</div>
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
            {/* Budget Widgets */}
            <div className="w-full">
              <BudgetWidgets budgetData={budgetCategories} selectedDate={selectedDate} />
            </div>

            {/* Savings Goals Section */}
            <div className="w-full">
              <Card className="bg-card text-card-foreground border">
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Savings Goals</h2>
                  {/* Goals Summary Stats (copied from GoalList) */}
                  {/* We'll need to fetch goals here, so add a useEffect and useState for goals */}
                  <GoalsStats />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;