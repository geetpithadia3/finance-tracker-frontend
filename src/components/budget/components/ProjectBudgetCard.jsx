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
    if (window.confirm(`Are you sure you want to release the extended vision "${projectBudget.name}"?`)) {
      try {
        await budgetAPI.deleteProjectBudget(projectBudget.id);
        toast({
          title: "Vision Released",
          description: `"${projectBudget.name}" has been mindfully released`,
        });
        onDelete(projectBudget.id);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to release extended vision",
          variant: "destructive",
        });
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  // Check if project is still active (end date hasn't passed)
  const isProjectActive = () => {
    const endDate = new Date(projectBudget.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    return endDate >= today;
  };

  // Don't render if project has ended
  if (!isProjectActive()) {
    return null;
  }

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
    <Card className="bg-card/50 backdrop-blur-sm border-muted/30 hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-6 space-y-4">
        {/* Vision Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate mb-1">{projectBudget.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(projectBudget.start_date)} - {formatDate(projectBudget.end_date)}</span>
            </div>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(projectBudget)}
              className="h-8 w-8 p-0 rounded-full hover:bg-muted"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Essential Progress */}
        {loading ? (
          <div className="space-y-2">
            <div className="h-2 bg-muted rounded-full animate-pulse"></div>
            <div className="text-center text-xs text-muted-foreground italic">Gathering insights...</div>
          </div>
        ) : progress ? (
          <div className="space-y-3">
            {/* Simplified Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Flow</span>
                <span className="text-sm font-semibold text-foreground">
                  {Math.min(progress.progress_percentage || 0, 100).toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={Math.min(progress.progress_percentage || 0, 100)} 
                className="h-2 bg-muted rounded-full"
                indicatorClassName={cn(
                  "transition-all duration-300 rounded-full",
                  isOverBudget ? 'bg-red-500' :
                  status === 'warning' ? 'bg-yellow-500' :
                  'bg-primary'
                )}
              />
            </div>

            {/* Essential Info */}
            <div className="flex justify-between items-center text-sm">
              <div className="text-center">
                <div className="font-semibold text-foreground">${(progress.remaining_amount || 0).toFixed(0)}</div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">{progress.days_remaining || 0}</div>
                <div className="text-xs text-muted-foreground">Days Left</div>
              </div>
            </div>

            {/* Mindful Guidance */}
            {isOverBudget && (
              <div className="text-center text-xs text-red-600 italic bg-red-50/50 rounded-full py-2 px-3">
                "When boundaries are crossed, wisdom guides the return"
              </div>
            )}
            
            {isUrgent && !isOverBudget && (
              <div className="text-center text-xs text-amber-600 italic bg-amber-50/50 rounded-full py-2 px-3">
                "The completion draws near, maintain mindful pace"
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-xs text-muted-foreground italic">Gathering insights...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}