import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Calendar, DollarSign, Edit, Trash2, TrendingUp, Clock } from 'lucide-react';
import { budgetAPI } from '../../../api/budgets';
import { useToast } from '../../../hooks/use-toast';

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
          className: 'text-green-700 bg-green-50 border-green-200'
        };
      case 'warning':
        return {
          color: 'bg-yellow-500',
          variant: 'secondary',
          text: 'Warning',
          className: 'text-yellow-700 bg-yellow-50 border-yellow-200'
        };
      case 'over':
        return {
          color: 'bg-red-500',
          variant: 'destructive',
          text: 'Over Budget',
          className: 'text-red-700 bg-red-50 border-red-200'
        };
      default:
        return {
          color: 'bg-gray-500',
          variant: 'outline',
          text: 'Unknown',
          className: 'text-gray-700 bg-gray-50 border-gray-200'
        };
    }
  };

  const status = getProgressStatus();
  const statusConfig = getStatusConfig(status);


  return (
    <Card className={`transition-all hover:shadow-md ${statusConfig.className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium">{projectBudget.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {progress ? getDurationText() : `${formatDate(projectBudget.start_date)} - ${formatDate(projectBudget.end_date)}`}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant={statusConfig.variant} className="text-xs px-1 py-0">
              {statusConfig.text}
            </Badge>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(projectBudget)}
                className="h-6 w-6 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {progress ? (
          <>
            {/* Compact Progress */}
            <div className="space-y-1">
              <Progress 
                value={Math.min(progress.progress_percentage || 0, 100)} 
                className="h-1.5"
                indicatorClassName={statusConfig.color}
              />
            </div>

            {/* Compact Budget Summary */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">
                ${(progress.total_spent || 0).toFixed(0)} / ${(progress.total_amount || 0).toFixed(0)}
              </span>
              <span className={`font-medium ${
                (progress.remaining_amount || 0) < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                ${(progress.remaining_amount || 0).toFixed(0)} left
              </span>
            </div>

            {/* Progress percentage */}
            <div className="text-center">
              <span className="text-xs font-medium text-gray-700">
                {(progress.progress_percentage || 0).toFixed(1)}% complete
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-2">
            <Button variant="outline" size="sm" onClick={fetchProgress} className="text-xs h-6">
              Load Progress
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}