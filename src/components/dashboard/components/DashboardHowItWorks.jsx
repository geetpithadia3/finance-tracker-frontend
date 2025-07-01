import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { BarChart3, TrendingUp, Target, PiggyBank, Calendar, Activity } from 'lucide-react';

const DashboardHowItWorks = () => {
  const steps = [
    {
      icon: Activity,
      title: "Financial Health Score",
      description: "Get an instant overview of your financial wellbeing with a comprehensive score from 0-100.",
      details: [
        "Budget Utilization (30%): How well you stay within budget limits",
        "Spending Velocity (25%): Whether you're spending too fast for the month",
        "Category Health (35%): Individual category performance scores",
        "Emergency Fund (10%): Savings rate and financial cushion",
        "Color-coded status: Green (Excellent), Blue (Good), Yellow (Caution), Red (Critical)"
      ]
    },
    {
      icon: Calendar,
      title: "Month Selection & Time Navigation",
      description: "Choose any month to view historical data or plan for future periods.",
      details: [
        "Use the month selector to navigate between different periods",
        "View historical spending patterns and trends",
        "Plan for future months with projected data",
        "Compare year-over-year performance",
        "Access up to 12 months of historical data"
      ]
    },
    {
      icon: BarChart3,
      title: "Spending Breakdown Charts",
      description: "Visualize your spending patterns with interactive charts and category breakdowns.",
      details: [
        "Pie chart shows spending distribution by category",
        "Bar charts display month-over-month comparisons",
        "Identify your largest expense categories",
        "Spot unusual spending patterns quickly",
        "Interactive charts with hover details"
      ]
    },
    {
      icon: TrendingUp,
      title: "Spending Trends Analysis",
      description: "Track your financial progress over time with trend analysis and pattern recognition.",
      details: [
        "Line charts show spending trends over multiple months",
        "Identify seasonal spending patterns",
        "Track progress toward financial goals",
        "Spot increasing or decreasing expense trends",
        "Compare current month to historical averages"
      ]
    },
    {
      icon: Target,
      title: "Budget Performance Overview",
      description: "Monitor how well you're sticking to your budgets with real-time progress tracking.",
      details: [
        "Progress bars for each budget category",
        "Red/yellow/green indicators for budget health",
        "Total budget vs actual spending summary",
        "Remaining budget amounts for the month",
        "Quick access to budget management tools"
      ]
    },
    {
      icon: PiggyBank,
      title: "Savings Goals Summary",
      description: "Track your savings progress with goal statistics and achievement metrics.",
      details: [
        "Total active vs completed goals",
        "Overall savings progress percentage",
        "Target amounts vs actual savings",
        "Goal completion timeline tracking",
        "Quick links to goal management"
      ]
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          How the Dashboard Works
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="flex gap-4 p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex-shrink-0">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm lg:text-base mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
        
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-blue-800 dark:text-blue-200">
              📊 Financial Health Score Breakdown
            </h4>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <div className="grid grid-cols-2 gap-2">
                <div><strong>80-100:</strong> <span className="text-green-600">Excellent</span></div>
                <div><strong>60-79:</strong> <span className="text-blue-600">Good</span></div>
                <div><strong>40-59:</strong> <span className="text-yellow-600">Caution</span></div>
                <div><strong>20-39:</strong> <span className="text-orange-600">Warning</span></div>
                <div><strong>0-19:</strong> <span className="text-red-600">Critical</span></div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-green-800 dark:text-green-200">
              💡 Dashboard Tips for Better Financial Management
            </h4>
            <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
              <li>• Check your dashboard weekly to stay on top of spending</li>
              <li>• Use the health score to identify areas needing attention</li>
              <li>• Compare current month to previous months for context</li>
              <li>• Set up budgets and goals to unlock full dashboard potential</li>
              <li>• Review spending trends to make informed financial decisions</li>
            </ul>
          </div>
          
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-amber-800 dark:text-amber-200">
              🎯 Dashboard Prerequisites
            </h4>
            <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
              <li>• Upload and categorize transactions for accurate data</li>
              <li>• Create budgets to enable budget tracking features</li>
              <li>• Set up savings goals to see goal progress</li>
              <li>• Use consistent categories for better trend analysis</li>
              <li>• Keep data current with regular transaction uploads</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardHowItWorks;