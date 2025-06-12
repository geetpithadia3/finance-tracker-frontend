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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">How It Works</CardTitle>
        <CardDescription>
          Follow these steps to make the most of your financial tracking journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              <span className="hidden sm:inline">Budget</span>
            </TabsTrigger>
            <TabsTrigger value="allocation" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Smart Allocation</span>
            </TabsTrigger>
          </TabsList>
          
          {Object.keys(steps).map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-6">
              {steps[tab].map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex gap-4 p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    </div>
                    {/* If you have actual screenshots:
                    <div className="flex-shrink-0 hidden sm:block w-32 h-24 bg-gray-100 rounded">
                      <img src={step.image} alt={step.title} className="w-full h-full object-cover rounded" />
                    </div>
                    */}
                  </div>
                );
              })}
              
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleGoToSection}
                >
                  Go to {tab.charAt(0).toUpperCase() + tab.slice(1)} <ExternalLink className="h-4 w-4 ml-1" />
                </Button>
                
                {tab !== Object.keys(steps)[Object.keys(steps).length - 1] && (
                  <Button 
                    variant="default" 
                    onClick={navigateToNextTab}
                    className="gap-2"
                  >
                    Next Step <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-sm text-muted-foreground">
          {activeTab === 'transactions' ? 'Start your journey with the Transactions tab' : 
           `After ${activeTab}, move on to ${activeTab === 'allocation' ? 'implementing your financial plan' : 'the next step'}`}
        </p>
        {activeTab === Object.keys(steps)[Object.keys(steps).length - 1] && (
          <Button variant="default" onClick={handleGoToSection}>Start Using Now</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default HowItWorks; 