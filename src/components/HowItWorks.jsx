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
} from 'lucide-react';

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const navigate = useNavigate();

  const steps = {
    transactions: [
      {
        icon: Upload,
        title: "Upload CSV Statement",
        description: "Start by uploading your bank or credit card statements in CSV format in the Transactions tab.",
        image: "/images/upload-csv.png" // Replace with actual screenshot
      },
      {
        icon: Tag,
        title: "Categorize Transactions",
        description: "Review your transactions and assign appropriate categories to track your spending patterns.",
        image: "/images/categorize.png" // Replace with actual screenshot
      },
      {
        icon: CreditCard,
        title: "Set Recurring Transactions",
        description: "Mark income or expenses as recurring to better track regular financial commitments.",
        image: "/images/recurring.png" // Replace with actual screenshot
      },
      {
        icon: Search,
        title: "Advanced Transaction Management",
        description: "Split transactions between categories, process refunds, and share transactions with others.",
        image: "/images/advanced.png" // Replace with actual screenshot
      }
    ],
    dashboard: [
      {
        icon: BarChart3,
        title: "View Spending Breakdown",
        description: "See visual charts that break down your spending by category and track month-over-month trends.",
        image: "/images/spending-breakdown.png" // Replace with actual screenshot
      },
      {
        icon: CreditCard,
        title: "Monthly Spending Overview",
        description: "Get a comprehensive view of your monthly expenditures and identify spending patterns.",
        image: "/images/monthly-overview.png" // Replace with actual screenshot
      }
    ],
    budget: [
      {
        icon: PiggyBank,
        title: "Set Budget Limits",
        description: "Create monthly budget limits for each spending category based on your financial goals.",
        image: "/images/budget-limits.png" // Replace with actual screenshot
      },
      {
        icon: BarChart3,
        title: "Track Progress",
        description: "Monitor how well you're sticking to your budget with visual progress indicators for each category.",
        image: "/images/budget-progress.png" // Replace with actual screenshot
      }
    ],
    allocation: [
      {
        icon: Calculator,
        title: "Smart Fund Allocation",
        description: "Using your recurring transactions, the app analyzes spending patterns and recommends optimal allocation of your income.",
        image: "/images/smart-allocation.png" // Replace with actual screenshot
      },
      {
        icon: PiggyBank,
        title: "Savings Recommendations",
        description: "Get personalized suggestions on how to increase your savings based on your recurring income and expenses.",
        image: "/images/savings-tips.png" // Replace with actual screenshot
      }
    ]
  };

  // Map tabs to their corresponding routes
  const tabRoutes = {
    transactions: '/transactions',
    dashboard: '/',
    budget: '/budget',
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
            className="grid grid-cols-4 mb-3 sm:mb-4 lg:mb-6 h-8 sm:h-10 gap-0 px-0"
          >
            <TabsTrigger value="transactions" className="flex items-center gap-1 text-[11px] px-0.5 sm:px-3 sm:text-sm min-w-0 justify-center">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Transactions</span>
              <span className="sm:hidden">Trans</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-1 text-[11px] px-0.5 sm:px-3 sm:text-sm min-w-0 justify-center">
              <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Dash</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-1 text-[11px] px-0.5 sm:px-3 sm:text-sm min-w-0 justify-center">
              <PiggyBank className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Budget</span>
              <span className="sm:hidden">Budget</span>
            </TabsTrigger>
            <TabsTrigger value="allocation" className="flex items-center gap-1 text-[11px] px-0.5 sm:px-3 sm:text-sm min-w-0 justify-center">
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