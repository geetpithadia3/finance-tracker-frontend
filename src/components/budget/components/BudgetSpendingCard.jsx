import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import { ArrowUpDown, TrendingUp, TrendingDown, Minus, Zap, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
          className: 'border-border bg-card',
          icon: CheckCircle,
          iconColor: 'text-green-500',
          bgGradient: 'from-green-50 to-emerald-50',
          borderColor: 'border-green-200'
        };
      case 'warning':
        return {
          color: 'bg-yellow-500',
          variant: 'secondary',
          text: 'Warning',
          className: 'border-border bg-card',
          icon: AlertTriangle,
          iconColor: 'text-yellow-500',
          bgGradient: 'from-yellow-50 to-amber-50',
          borderColor: 'border-yellow-200'
        };
      case 'over':
        return {
          color: 'bg-red-500',
          variant: 'destructive',
          text: 'Over Budget',
          className: 'border-border bg-card',
          icon: TrendingUp,
          iconColor: 'text-red-500',
          bgGradient: 'from-red-50 to-rose-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          color: 'bg-gray-500',
          variant: 'outline',
          text: 'Unknown',
          className: 'border-border bg-card',
          icon: Minus,
          iconColor: 'text-muted-foreground',
          bgGradient: 'from-gray-50 to-slate-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  // Calculate visual indicators
  const isOverBudget = remaining_amount < 0;
  const isNearLimit = percentage_used >= 80 && percentage_used < 100;
  const isExcellent = percentage_used < 50;
  const hasRollover = rollover_amount !== 0;

  // Get spending trend indicator
  const getTrendIcon = () => {
    if (isOverBudget) return <TrendingUp className="h-3 w-3 text-destructive" />;
    if (isNearLimit) return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
    if (isExcellent) return <CheckCircle className="h-3 w-3 text-green-500" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md hover:scale-[1.02] group",
      statusConfig.className
    )}>
      <CardContent className="p-4">
        {/* Header with Category and Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={cn(
              "p-1.5 rounded-lg",
              status === 'good' ? 'bg-green-100/50' :
              status === 'warning' ? 'bg-yellow-100/50' :
              status === 'over' ? 'bg-red-100/50' : 'bg-muted'
            )}>
              <StatusIcon className={cn("h-4 w-4", statusConfig.iconColor)} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm text-foreground truncate">{category_name}</h4>
              <div className="flex items-center gap-1 mt-0.5">
                {getTrendIcon()}
                {hasRollover && (
                  <ArrowUpDown className="h-3 w-3 text-primary" title={`${rollover_amount > 0 ? 'Added' : 'Deducted'} ${Math.abs(rollover_amount).toFixed(0)} from last month`} />
                )}
              </div>
            </div>
          </div>
          <Badge 
            variant={statusConfig.variant} 
            className={cn(
              "text-xs px-2 py-1 font-medium",
              status === 'good' ? 'bg-green-100/50 text-green-700 border-green-200' :
              status === 'warning' ? 'bg-yellow-100/50 text-yellow-700 border-yellow-200' :
              status === 'over' ? 'bg-red-100/50 text-red-700 border-red-200' :
              'bg-muted text-muted-foreground border-border'
            )}
          >
            {statusConfig.text}
          </Badge>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-muted-foreground">Progress</span>
            <span className="text-xs font-bold text-foreground">
              {Math.min(percentage_used || 0, 100).toFixed(0)}%
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={Math.min(percentage_used || 0, 100)} 
              className="h-2 bg-muted"
              indicatorClassName={cn(
                "transition-all duration-300",
                status === 'good' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                status === 'warning' ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                status === 'over' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                'bg-gradient-to-r from-muted-foreground to-foreground'
              )}
            />
            {/* Progress markers */}
            <div className="absolute top-0 left-0 right-0 h-2 flex justify-between pointer-events-none">
              <div className="w-0.5 h-2 bg-border"></div>
              <div className="w-0.5 h-2 bg-border"></div>
              <div className="w-0.5 h-2 bg-border"></div>
            </div>
          </div>
        </div>

        {/* Budget Summary */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Spent / Budget</span>
            <span className="text-xs font-medium text-foreground">
              ${(spent_amount || 0).toFixed(0)} / ${(effective_budget || 0).toFixed(0)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Remaining</span>
            <span className={cn(
              "text-sm font-bold",
              isOverBudget ? 'text-destructive' : 'text-green-500'
            )}>
              ${(remaining_amount || 0).toFixed(0)}
            </span>
          </div>
          
          {/* Rollover Breakdown */}
          {hasRollover && (
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Base Budget</span>
                <span className="text-foreground">${(budget_amount || 0).toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Rollover</span>
                <span className={cn(
                  "font-medium",
                  rollover_amount > 0 ? 'text-green-500' : 'text-destructive'
                )}>
                  {rollover_amount > 0 ? '+' : ''}${(rollover_amount || 0).toFixed(0)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Indicator */}
        {isOverBudget && (
          <div className="mt-3 p-2 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-destructive" />
              <span className="text-xs font-medium text-destructive">Action needed</span>
            </div>
          </div>
        )}
        
        {isNearLimit && !isOverBudget && (
          <div className="mt-3 p-2 bg-yellow-100/50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <Target className="h-3 w-3 text-yellow-500" />
              <span className="text-xs text-yellow-700">Monitor spending</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}