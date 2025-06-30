import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import { ArrowUpDown } from 'lucide-react';

export function BudgetSpendingCard({ categoryData }) {
  const {
    category_name,
    budget_amount,
    spent_amount,
    remaining_amount,
    percentage_used,
    status,
    // REQ-004: Rollover information
    rollover_amount = 0,
    effective_budget = budget_amount,
    rollover_enabled = false,
  } = categoryData;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'good':
        return {
          color: 'bg-green-500',
          variant: 'default',
          text: 'On Track',
          className: 'border-green-200'
        };
      case 'warning':
        return {
          color: 'bg-yellow-500',
          variant: 'secondary',
          text: 'Warning',
          className: 'border-yellow-200'
        };
      case 'over':
        return {
          color: 'bg-red-500',
          variant: 'destructive',
          text: 'Over Budget',
          className: 'border-red-200'
        };
      default:
        return {
          color: 'bg-gray-500',
          variant: 'outline',
          text: 'Unknown',
          className: 'border-gray-200'
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <Card className={`transition-all hover:shadow-sm ${statusConfig.className}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{category_name}</h4>
            {rollover_amount !== 0 && (
              <ArrowUpDown className="h-3 w-3 text-gray-400" title={`${rollover_amount > 0 ? 'Added' : 'Deducted'} $${Math.abs(rollover_amount).toFixed(0)} from last month`} />
            )}
          </div>
          <Badge variant={statusConfig.variant} className="text-xs px-2 py-0">
            {statusConfig.text}
          </Badge>
        </div>

        {/* Compact Progress Bar */}
        <div className="mb-2">
          <Progress 
            value={Math.min(percentage_used || 0, 100)} 
            className="h-1.5"
            indicatorClassName={statusConfig.color}
          />
        </div>

        {/* Budget Summary with Rollover Info */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">
              ${(spent_amount || 0).toFixed(0)} / ${(effective_budget || 0).toFixed(0)}
            </span>
            <span className={`font-medium ${
              (remaining_amount || 0) < 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              ${(remaining_amount || 0).toFixed(0)} left
            </span>
          </div>
          
          {/* Rollover Breakdown */}
          {rollover_amount !== 0 && (
            <div className="text-xs text-gray-500 flex justify-between items-center">
              <span>Base: ${(budget_amount || 0).toFixed(0)}</span>
              <span className={rollover_amount > 0 ? 'text-green-600' : 'text-red-600'}>
                {rollover_amount > 0 ? '+' : ''}${(rollover_amount || 0).toFixed(0)} rollover
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}