import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calculator, Repeat, DollarSign, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';

const SmartAllocationHowItWorks = () => {
  const steps = [
    {
      icon: Repeat,
      title: "Set Up Recurring Income",
      description: "Create recurring transactions for all your regular income sources to enable smart allocation planning.",
      details: [
        "Add your salary/paycheck as a recurring CREDIT transaction",
        "Use categories like 'Income', 'Salary', or include keywords like 'payroll'",
        "Set the correct frequency (bi-weekly, monthly, etc.)",
        "Include all income sources: main job, side jobs, benefits",
        "Enable variable amounts if your income fluctuates"
      ]
    },
    {
      icon: DollarSign,
      title: "Configure Recurring Expenses",
      description: "Add all your regular bills and expenses as recurring DEBIT transactions for complete financial planning.",
      details: [
        "Add rent, mortgage, utilities as recurring DEBIT transactions",
        "Include subscriptions, insurance, loan payments",
        "Set accurate due dates and frequencies",
        "Use date flexibility (±1-3 days) for bills with variable timing",
        "Categorize expenses properly for better tracking"
      ]
    },
    {
      icon: Calendar,
      title: "Select Planning Month",
      description: "Choose any month (current or future) to see your projected income and expense allocation.",
      details: [
        "Use the month selector to pick your planning period",
        "View current month for immediate planning needs",
        "Plan 3-6 months ahead for major expenses",
        "See which paycheck covers which bills",
        "Identify potential cash flow issues early"
      ]
    },
    {
      icon: Calculator,
      title: "View Paycheck Allocation",
      description: "See exactly how each paycheck should be allocated to cover upcoming bills and expenses.",
      details: [
        "Each paycheck shows bills due before the next paycheck",
        "Color-coded allocation: bills, discretionary, savings",
        "Calculate remaining amount after all bills",
        "See total monthly income vs expenses",
        "Identify surplus or deficit situations"
      ]
    },
    {
      icon: TrendingUp,
      title: "Optimize Your Cash Flow",
      description: "Use allocation insights to improve your financial planning and avoid cash flow problems.",
      details: [
        "Move bill due dates to better align with paychecks",
        "Identify paychecks with too many bills assigned",
        "Plan for large expenses by saving across multiple paychecks",
        "Set up automatic transfers for better cash management",
        "Build buffer amounts for unexpected expenses"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Handle Allocation Warnings",
      description: "Address potential cash flow issues identified by the smart allocation system.",
      details: [
        "Red warnings indicate bills exceed paycheck amount",
        "Yellow warnings suggest tight cash flow situations",
        "Review and adjust bill due dates if possible",
        "Consider payment plans for large expenses",
        "Build emergency fund for cash flow gaps"
      ]
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-orange-600" />
          How Smart Allocation Works
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="flex gap-4 p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex-shrink-0">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm lg:text-base mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-600 mt-1">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
        
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-orange-800 dark:text-orange-200">
              💡 Smart Allocation Success Tips
            </h4>
            <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
              <li>• Set up ALL recurring income and expenses for accurate allocation</li>
              <li>• Use consistent naming for income categories (Salary, Payroll, Income)</li>
              <li>• Include date flexibility for bills that don't always fall on the same day</li>
              <li>• Plan 2-3 months ahead to identify potential cash flow issues</li>
              <li>• Leave 10-15% buffer in each paycheck for unexpected expenses</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-blue-800 dark:text-blue-200">
              🎯 Allocation Color Guide
            </h4>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span><strong>Red:</strong> Bills exceed paycheck amount - action needed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span><strong>Yellow:</strong> Tight budget - little room for extras</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span><strong>Green:</strong> Good allocation - surplus available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span><strong>Blue:</strong> Discretionary spending money</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-red-800 dark:text-red-200">
              ⚠️ Common Setup Issues
            </h4>
            <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
              <li>• Missing recurring income - allocation won't work without paycheck data</li>
              <li>• Incorrect income categories - use 'Salary', 'Income', or 'Payroll'</li>
              <li>• Wrong transaction types - income should be CREDIT, expenses DEBIT</li>
              <li>• Missing recurring bills - allocation will show incorrect surplus</li>
              <li>• Incorrect frequencies - bi-weekly vs monthly makes a big difference</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartAllocationHowItWorks;