import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Calendar, DollarSign, Edit, Trash2, TrendingUp, Clock, Target, AlertTriangle, CheckCircle, Zap, Rocket, Flag } from 'lucide-react';
import { budgetAPI } from '../../../api/budgets';
import { useToast } from '../../../hooks/use-toast';
import { cn } from '@/lib/utils';

export function ProjectBudgetCard({ projectBudget, onEdit, onDelete, onRefresh }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProgress();
  }, [projectBudget.id]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const progressData = await budgetAPI.getProjectBudgetProgress(projectBudget.id);
      setProgress(progressData);
    } catch (err) {
      console.error('Failed to fetch project budget progress:', err);
      toast({
        title: "Error",
        description: "Failed to fetch project progress",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the project budget "${projectBudget.name}"?`)) {
      try {
        await budgetAPI.deleteProjectBudget(projectBudget.id);
        toast({
          title: "Success",
          description: "Project budget deleted successfully",
        });
        onDelete(projectBudget.id);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete project budget",
          variant: "destructive",
        });
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDurationText = () => {
    if (!progress) return '';
    
    const totalDays = Math.ceil((new Date(progress.end_date) - new Date(progress.start_date)) / (1000 * 60 * 60 * 24));
    const daysRemaining = progress.days_remaining;
    const daysElapsed = totalDays - daysRemaining;
    
    if (daysRemaining <= 0) {
      return 'Project completed';
    } else if (daysRemaining === 1) {
      return '1 day remaining';
    } else if (daysRemaining <= 7) {
      return `${daysRemaining} days remaining`;
    } else {
      return `${Math.ceil(daysRemaining / 7)} weeks remaining`;
    }
  };

  const getProgressStatus = () => {
    if (!progress) return 'unknown';
    
    if (progress.progress_percentage >= 100) {
      return 'over';
    } else if (progress.progress_percentage >= 75) {
      return 'warning';
    } else {
      return 'good';
    }
  };

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
          bgGradient: 'from-green-50 to-emerald-50'
        };
      case 'warning':
        return {
          color: 'bg-yellow-500',
          variant: 'secondary',
          text: 'Warning',
          className: 'border-border bg-card',
          icon: AlertTriangle,
          iconColor: 'text-yellow-500',
          bgGradient: 'from-yellow-50 to-amber-50'
        };
      case 'over':
        return {
          color: 'bg-red-500',
          variant: 'destructive',
          text: 'Over Budget',
          className: 'border-border bg-card',
          icon: TrendingUp,
          iconColor: 'text-red-500',
          bgGradient: 'from-red-50 to-rose-50'
        };
      default:
        return {
          color: 'bg-gray-500',
          variant: 'outline',
          text: 'Unknown',
          className: 'border-border bg-card',
          icon: Target,
          iconColor: 'text-muted-foreground',
          bgGradient: 'from-gray-50 to-slate-50'
        };
    }
  };

  const status = getProgressStatus();
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  // Calculate urgency indicators
  const isUrgent = progress && progress.days_remaining <= 7;
  const isOverBudget = progress && progress.remaining_amount < 0;
  const isNearDeadline = progress && progress.days_remaining <= 30 && progress.days_remaining > 7;
  const isExcellent = progress && progress.progress_percentage < 50;

  // Get urgency icon
  const getUrgencyIcon = () => {
    if (isUrgent) return <Zap className="h-4 w-4 text-destructive" />;
    if (isNearDeadline) return <Flag className="h-4 w-4 text-yellow-500" />;
    if (isExcellent) return <Rocket className="h-4 w-4 text-green-500" />;
    return <Target className="h-4 w-4 text-primary" />;
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group",
      statusConfig.className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(
                "p-2 rounded-lg",
                status === 'good' ? 'bg-green-100/50' :
              status === 'warning' ? 'bg-yellow-100/50' :
              status === 'over' ? 'bg-red-100/50' : 'bg-muted'
              )}>
                <StatusIcon className={cn("h-4 w-4", statusConfig.iconColor)} />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm font-semibold text-foreground truncate">
                  {projectBudget.name}
                </CardTitle>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(projectBudget.start_date)} - {formatDate(projectBudget.end_date)}</span>
              </div>
              {getUrgencyIcon()}
            </div>

            {progress && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{getDurationText()}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
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
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(projectBudget)}
                className="h-6 w-6 p-0 hover:bg-gray-200"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-2">
            <div className="h-2 bg-muted rounded animate-pulse"></div>
            <div className="h-2 bg-muted rounded w-3/4 animate-pulse"></div>
          </div>
        ) : progress ? (
          <>
            {/* Enhanced Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">Budget Progress</span>
                <span className="text-xs font-bold text-foreground">
                  {Math.min(progress.progress_percentage || 0, 100).toFixed(0)}%
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={Math.min(progress.progress_percentage || 0, 100)} 
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
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spent</span>
                  <span className="font-medium text-foreground">
                    ${(progress.total_spent || 0).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-medium text-foreground">
                    ${(progress.total_amount || 0).toFixed(0)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className={cn(
                    "font-bold",
                    isOverBudget ? 'text-destructive' : 'text-green-500'
                  )}>
                    ${(progress.remaining_amount || 0).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days Left</span>
                  <span className={cn(
                    "font-medium",
                    isUrgent ? 'text-destructive' : 
                    isNearDeadline ? 'text-yellow-500' : 'text-foreground'
                  )}>
                    {progress.days_remaining || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Indicators */}
            {isOverBudget && (
              <div className="p-2 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-destructive" />
                  <span className="text-xs font-medium text-destructive">Budget exceeded - review needed</span>
                </div>
              </div>
            )}
            
            {isUrgent && !isOverBudget && (
              <div className="p-2 bg-yellow-100/50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <Flag className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs font-medium text-yellow-700">Deadline approaching</span>
                </div>
              </div>
            )}
            
            {isExcellent && (
              <div className="p-2 bg-green-100/50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Rocket className="h-3 w-3 text-green-500" />
                  <span className="text-xs font-medium text-green-700">Excellent progress</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-xs text-gray-500">Loading progress...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}