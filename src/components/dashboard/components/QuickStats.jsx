import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle } from 'lucide-react';

const QuickStats = ({ income, expenses, savings, budgetCategories }) => {
  const totalBudget = budgetCategories?.reduce((sum, cat) => sum + (cat.effective_budget || 0), 0) || 0;
  const totalSpent = budgetCategories?.reduce((sum, cat) => sum + (cat.spent_amount || 0), 0) || 0;
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  const stats = [
    {
      label: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: savingsRate > 20 ? 'up' : savingsRate > 10 ? 'neutral' : 'down'
    },
    {
      label: 'Budget Used',
      value: `${budgetUtilization.toFixed(1)}%`,
      icon: Target,
      color: budgetUtilization > 90 ? 'text-red-600' : budgetUtilization > 75 ? 'text-yellow-600' : 'text-green-600',
      bgColor: budgetUtilization > 90 ? 'bg-red-50' : budgetUtilization > 75 ? 'bg-yellow-50' : 'bg-green-50',
      trend: budgetUtilization > 90 ? 'down' : budgetUtilization > 75 ? 'neutral' : 'up'
    },
    {
      label: 'Net Cash Flow',
      value: `$${(income - expenses).toFixed(2)}`,
      icon: DollarSign,
      color: (income - expenses) > 0 ? 'text-green-600' : 'text-red-600',
      bgColor: (income - expenses) > 0 ? 'bg-green-50' : 'bg-red-50',
      trend: (income - expenses) > 0 ? 'up' : 'down'
    }
  ];

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  {stat.label}
                </div>
                <div className={`text-xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon(stat.trend)}
              <span className="text-xs text-gray-500">
                {stat.trend === 'up' ? 'Good' : stat.trend === 'down' ? 'Needs attention' : 'Monitor'}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickStats; 