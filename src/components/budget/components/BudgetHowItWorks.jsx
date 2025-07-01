import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Calendar, PiggyBank, BarChart3, Settings, TrendingUp, Copy } from 'lucide-react';

const BudgetHowItWorks = () => {
  const steps = [
    {
      icon: Calendar,
      title: "Select Your Budget Month",
      description: "Choose the month you want to budget for using the month selector. You can create budgets for current, past, or future months.",
      details: [
        "Use the month/year selector to pick your target period",
        "Create budgets up to 12 months in advance for planning",
        "Review past months to analyze spending patterns",
        "Each month maintains its own independent budget"
      ]
    },
    {
      icon: PiggyBank,
      title: "Create Your Budget",
      description: "Set up budget limits for each spending category based on your income and financial goals.",
      details: [
        "Click 'Create Budget' to start with a fresh budget",
        "Add categories with specific spending limits",
        "Set realistic amounts based on your income and expenses",
        "Include both fixed expenses (rent, utilities) and variable expenses (groceries, entertainment)"
      ]
    },
    {
      icon: Copy,
      title: "Copy From Previous Months",
      description: "Save time by copying budget structures from previous months and adjusting as needed.",
      details: [
        "Click 'Copy from Previous Month' to duplicate an existing budget",
        "Select which month to copy from the dropdown",
        "All categories and amounts will be copied over",
        "Edit individual amounts to reflect changes in your financial situation"
      ]
    },
    {
      icon: BarChart3,
      title: "Track Spending vs Budget",
      description: "Monitor your actual spending against budget limits with real-time progress tracking.",
      details: [
        "Progress bars show spending percentage for each category",
        "Green: Under 70% (good), Yellow: 70-90% (warning), Red: Over 90% (danger)",
        "View actual spent amount vs budgeted amount",
        "Remaining budget amount displayed for each category"
      ]
    },
    {
      icon: Settings,
      title: "Manage Budget Categories",
      description: "Edit, delete, or adjust budget amounts throughout the month as your needs change.",
      details: [
        "Click edit button on any budget item to modify the amount",
        "Delete categories you no longer need",
        "Add new categories if spending patterns change",
        "Budgets automatically sync with your categorized transactions"
      ]
    },
    {
      icon: TrendingUp,
      title: "Analyze Budget Performance",
      description: "Use budget data to understand spending patterns and improve financial planning.",
      details: [
        "Compare multiple months to identify trends",
        "See which categories consistently go over budget",
        "Use insights to adjust future budget allocations",
        "Track overall budget adherence over time"
      ]
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5 text-green-600" />
          How Budget Management Works
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="flex gap-4 p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex-shrink-0">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm lg:text-base mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
        
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-green-800 dark:text-green-200">
              💡 Budget Success Tips
            </h4>
            <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
              <li>• Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
              <li>• Start with realistic amounts - you can always adjust</li>
              <li>• Review and update budgets monthly based on actual spending</li>
              <li>• Leave 5-10% buffer for unexpected expenses</li>
              <li>• Track spending patterns to improve future budget accuracy</li>
            </ul>
          </div>
          
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-amber-800 dark:text-amber-200">
              ⚠️ Common Budget Mistakes to Avoid
            </h4>
            <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
              <li>• Setting unrealistic limits that are impossible to maintain</li>
              <li>• Forgetting to include irregular expenses (car maintenance, gifts)</li>
              <li>• Not reviewing and adjusting budgets based on actual spending</li>
              <li>• Being too strict - allow some flexibility for enjoyment</li>
              <li>• Not categorizing transactions properly (affects budget tracking)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetHowItWorks;