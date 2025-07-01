import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const BudgetProgressChart = ({ budgetCategories }) => {
  const filteredBudgets = budgetCategories
    ?.filter(cat => (cat.effective_budget ?? cat.budget_amount) > 0)
    .sort((a, b) => {
      const aEff = a.effective_budget ?? a.budget_amount;
      const bEff = b.effective_budget ?? b.budget_amount;
      const aProgress = (a.spent_amount / aEff) * 100;
      const bProgress = (b.spent_amount / bEff) * 100;
      return bProgress - aProgress;
    })
    .slice(0, 6) || [];

  const getProgressColor = (progress) => {
    if (progress >= 90) return 'bg-red-500';
    if (progress >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressBgColor = (progress) => {
    if (progress >= 90) return 'bg-red-100';
    if (progress >= 75) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  return (
    <Card className="w-full max-w-full h-full bg-white border border-gray-200">
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-lg font-semibold text-gray-800">Budget Progress</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {filteredBudgets.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-sm">No budget data available</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBudgets.map((budget, index) => {
              const eff = budget.effective_budget ?? budget.budget_amount;
              const progress = (budget.spent_amount / eff) * 100;
              const remaining = eff - budget.spent_amount;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 text-sm">
                        {budget.category_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        ${budget.spent_amount.toFixed(2)} / ${eff.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        progress >= 90 ? 'text-red-600' : 
                        progress >= 75 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {progress.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        ${remaining.toFixed(2)} left
                      </div>
                    </div>
                  </div>
                  <div className={`w-full h-2 rounded-full ${getProgressBgColor(progress)}`}>
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetProgressChart; 