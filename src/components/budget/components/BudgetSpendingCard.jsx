import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

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
    rollover_unused = false,
    rollover_overspend = false
  } = categoryData;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'good':
        return {
          color: 'bg-green-500',
          icon: CheckCircle,
          variant: 'default',
          text: 'On Track',
          className: 'text-green-700 bg-green-50'
        };
      case 'warning':
        return {
          color: 'bg-yellow-500',
          icon: AlertTriangle,
          variant: 'secondary',
          text: 'Warning',
          className: 'text-yellow-700 bg-yellow-50'
        };
      case 'over':
        return {
          color: 'bg-red-500',
          icon: AlertCircle,
          variant: 'destructive',
          text: 'Over Budget',
          className: 'text-red-700 bg-red-50'
        };
      default:
        return {
          color: 'bg-gray-500',
          icon: CheckCircle,
          variant: 'outline',
          text: 'Unknown',
          className: 'text-gray-700 bg-gray-50'
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className={`transition-all hover:shadow-md ${statusConfig.className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium truncate">
            {category_name}
          </CardTitle>
          <Badge variant={statusConfig.variant} className="text-xs">
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Progress</span>
            <span>{percentage_used.toFixed(1)}%</span>
          </div>
          <Progress 
            value={Math.min(percentage_used, 100)} 
            className="h-2"
            indicatorClassName={
              status === 'over' ? 'bg-red-500' :
              status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
            }
          />
        </div>

        {/* Budget Details */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Base Budget:</span>
            <span className="text-sm font-medium">${budget_amount.toFixed(2)}</span>
          </div>
          
          {/* REQ-004: Show rollover information */}
          {Math.abs(rollover_amount) > 0.01 && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">
                {rollover_amount > 0 ? 'Rollover Added:' : 'Overspend Deducted:'}
              </span>
              <span className={`text-sm font-medium ${
                rollover_amount > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {rollover_amount > 0 ? '+' : ''}${rollover_amount.toFixed(2)}
              </span>
            </div>
          )}
          
          {Math.abs(rollover_amount) > 0.01 && (
            <div className="flex justify-between items-center font-medium bg-gray-50 px-2 py-1 rounded">
              <span className="text-xs text-gray-700">Effective Budget:</span>
              <span className="text-sm">${effective_budget.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Spent:</span>
            <span className={`text-sm font-medium ${
              status === 'over' ? 'text-red-600' :
              status === 'warning' ? 'text-yellow-600' : 'text-gray-900'
            }`}>
              ${spent_amount.toFixed(2)}
            </span>
          </div>
          
          <div className="flex justify-between items-center pt-1 border-t">
            <span className="text-xs text-gray-600">Remaining:</span>
            <span className={`text-sm font-bold ${
              remaining_amount < 0 ? 'text-red-600' :
              remaining_amount < effective_budget * 0.25 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              ${remaining_amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Overspend Warning */}
        {status === 'over' && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2">
            <p className="text-xs text-red-800">
              Over budget by ${Math.abs(remaining_amount).toFixed(2)}
            </p>
          </div>
        )}

        {/* Low Budget Warning */}
        {status === 'warning' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
            <p className="text-xs text-yellow-800">
              {percentage_used >= 90 ? 'Almost at limit' : 'Approaching limit'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}