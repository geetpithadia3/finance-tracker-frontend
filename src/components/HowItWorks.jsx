import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowRight,
  FileText,
  LayoutDashboard,
  PiggyBank,
  Calculator,
  BarChart3,
  Tag,
  Upload,
  Search,
  CreditCard,
  ExternalLink,
  Repeat,
  DollarSign,
  Target,
  CheckCircle,
  Calendar,
  TrendingUp,
  Settings,
} from 'lucide-react';

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const navigate = useNavigate();

  const steps = {
    transactions: [
      {
        icon: Upload,
        title: "Upload CSV Statement",
        description: "Start by uploading your bank or credit card statements in CSV format. Supports most bank formats with automatic column mapping.",
        image: "/images/upload-csv.png"
      },
      {
        icon: Tag,
        title: "Categorize Transactions",
        description: "Review your transactions and assign appropriate categories. The system learns your preferences and suggests categories for future transactions.",
        image: "/images/categorize.png"
      },
      {
        icon: CreditCard,
        title: "Set Up Recurring Transactions",
        description: "Click 'Make Recurring' on any transaction to set up recurring income (paychecks) and expenses (bills). Configure frequency, date flexibility, and variable amounts.",
        image: "/images/recurring.png"
      },
      {
        icon: Search,
        title: "Advanced Transaction Management",
        description: "Split transactions between categories, process refunds, share transactions, and use bulk actions for efficient management.",
        image: "/images/advanced.png"
      }
    ],
    dashboard: [
      {
        icon: BarChart3,
        title: "Financial Health Score",
        description: "Monitor your financial health with a comprehensive score (0-100) based on budget utilization, spending velocity, category health, and emergency fund status.",
        image: "/images/financial-health.png"
      },
      {
        icon: TrendingUp,
        title: "Spending Trends & Analytics",
        description: "View interactive charts showing spending trends, category breakdowns, and month-over-month comparisons to identify patterns.",
        image: "/images/spending-trends.png"
      },
      {
        icon: Target,
        title: "Budget vs Actual Overview",
        description: "See at-a-glance how your actual spending compares to your budget with visual progress indicators and alerts.",
        image: "/images/budget-overview.png"
      },
      {
        icon: PiggyBank,
        title: "Goals Summary",
        description: "Track your savings goals progress with summary stats showing active goals, completion rate, and total targets vs savings.",
        image: "/images/goals-summary.png"
      }
    ],
    budget: [
      {
        icon: Calendar,
        title: "Create Monthly Budgets",
        description: "Create detailed monthly budgets by selecting a month and setting limits for each category. Copy budgets from previous months to save time.",
        image: "/images/create-budget.png"
      },
      {
        icon: BarChart3,
        title: "Track Category Progress",
        description: "Monitor spending vs budget for each category with color-coded progress bars. Green = on track, Yellow = warning, Red = over budget.",
        image: "/images/budget-progress.png"
      },
      {
        icon: Settings,
        title: "Manage Budget Categories",
        description: "Edit, delete, or modify budget amounts throughout the month. Budgets automatically track your actual spending from categorized transactions.",
        image: "/images/budget-management.png"
      },
      {
        icon: TrendingUp,
        title: "Budget Analytics",
        description: "View budget performance over time with charts showing spending patterns and budget adherence across multiple months.",
        image: "/images/budget-analytics.png"
      }
    ],
    goals: [
      {
        icon: Target,
        title: "Create Savings Goals",
        description: "Set specific savings targets with deadlines. Optionally create temporary categories to automatically track progress from transactions.",
        image: "/images/create-goals.png"
      },
      {
        icon: TrendingUp,
        title: "Track Goal Progress",
        description: "Monitor your progress with visual indicators showing saved amount vs target. Goals display progress percentage and remaining amount.",
        image: "/images/goal-progress.png"
      },
      {
        icon: CheckCircle,
        title: "Manage Goal Status",
        description: "Mark goals as complete, archive them, or abandon if plans change. Use the status dropdown to take actions on each goal.",
        image: "/images/goal-status.png"
      },
      {
        icon: BarChart3,
        title: "Goal Analytics & Summary",
        description: "View goal statistics including active vs completed goals, total targets, and savings progress across all goals.",
        image: "/images/goal-analytics.png"
      }
    ],
    allocation: [
      {
        icon: Repeat,
        title: "Set Up Recurring Income & Expenses",
        description: "First, create recurring transactions for your regular income (salary, paychecks) and expenses (rent, utilities, subscriptions). Use CREDIT type for income and DEBIT for expenses.",
        image: "/images/setup-recurring.png" // Replace with actual screenshot
      },
      {
        icon: DollarSign,
        title: "Configure Income Categories",
        description: "Ensure your recurring income is categorized as 'Income', 'Salary', or contains keywords like 'payroll', 'salary'. This helps the system identify your paychecks correctly.",
        image: "/images/income-categories.png" // Replace with actual screenshot
      },
      {
        icon: Calculator,
        title: "View Paycheck Allocation",
        description: "Smart Allocation will show you when each paycheck arrives and which bills are due before your next paycheck, helping you allocate funds properly.",
        image: "/images/paycheck-allocation.png" // Replace with actual screenshot
      },
      {
        icon: BarChart3,
        title: "Future Planning",
        description: "Use any future month to see your predicted paycheck allocation. Perfect for planning ahead and ensuring you have enough for all bills.",
        image: "/images/future-planning.png" // Replace with actual screenshot
      }
    ]
  };

  // Map tabs to their corresponding routes
  const tabRoutes = {
    transactions: '/transactions',
    dashboard: '/',
    budget: '/budget',
    goals: '/budget', // Goals are part of the budget section
    allocation: '/allocation'
  };

  const handleGoToSection = () => {
    navigate(tabRoutes[activeTab]);
  };

  const navigateToNextTab = () => {
    const tabList = Object.keys(steps);
    const currentIndex = tabList.indexOf(activeTab);
    if (currentIndex < tabList.length - 1) {
      setActiveTab(tabList[currentIndex + 1]);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-base sm:text-xl lg:text-2xl">How It Works</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Follow these steps to make the most of your financial tracking journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className="grid grid-cols-5 mb-3 sm:mb-4 lg:mb-6 h-8 sm:h-10 gap-0 px-0"
          >
            <TabsTrigger value="transactions" className="flex items-center gap-1 text-[10px] px-0.5 sm:px-2 sm:text-xs min-w-0 justify-center">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Transactions</span>
              <span className="sm:hidden">Trans</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-1 text-[10px] px-0.5 sm:px-2 sm:text-xs min-w-0 justify-center">
              <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Dash</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-1 text-[10px] px-0.5 sm:px-2 sm:text-xs min-w-0 justify-center">
              <PiggyBank className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Budget</span>
              <span className="sm:hidden">Budget</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1 text-[10px] px-0.5 sm:px-2 sm:text-xs min-w-0 justify-center">
              <Target className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Goals</span>
              <span className="sm:hidden">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="allocation" className="flex items-center gap-1 text-[10px] px-0.5 sm:px-2 sm:text-xs min-w-0 justify-center">
              <Calculator className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Smart Allocation</span>
              <span className="sm:hidden">Alloc</span>
            </TabsTrigger>
          </TabsList>
          
          {Object.keys(steps).map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-2 sm:space-y-3 lg:space-y-4">
              {steps[tab].map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex gap-2 sm:gap-3 lg:gap-4 p-2 sm:p-3 lg:p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                      <div className="p-1 sm:p-1.5 lg:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-xs sm:text-sm lg:text-base">{step.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">{step.description}</p>
                    </div>
                    {/* If you have actual screenshots:
                    <div className="flex-shrink-0 hidden sm:block w-32 h-24 bg-gray-100 rounded">
                      <img src={step.image} alt={step.title} className="w-full h-full object-cover rounded" />
                    </div>
                    */}
                  </div>
                );
              })}
              
              <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 mt-2 sm:mt-4 lg:mt-6">
                <Button 
                  variant="outline" 
                  className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 lg:px-4 h-7 sm:h-8 lg:h-9"
                  onClick={handleGoToSection}
                >
                  <span className="hidden sm:inline">Go to {tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  <span className="sm:hidden">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                
                {tab !== Object.keys(steps)[Object.keys(steps).length - 1] && (
                  <Button 
                    variant="default" 
                    onClick={navigateToNextTab}
                    className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 lg:px-4 h-7 sm:h-8 lg:h-9"
                  >
                    <span className="hidden sm:inline">Next Step</span>
                    <span className="sm:hidden">Next</span>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between border-t pt-2 sm:pt-3 lg:pt-4 gap-2 sm:gap-0">
        <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          {activeTab === 'transactions' ? 'Start your journey with the Transactions tab' : 
           `After ${activeTab}, move on to ${activeTab === 'allocation' ? 'implementing your financial plan' : 'the next step'}`}
        </p>
        {activeTab === Object.keys(steps)[Object.keys(steps).length - 1] && (
          <Button variant="default" onClick={handleGoToSection} className="text-xs sm:text-sm px-2 sm:px-3 lg:px-4 h-7 sm:h-8 lg:h-9">Start Using Now</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default HowItWorks; 