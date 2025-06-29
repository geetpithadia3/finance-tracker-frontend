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

  if (loading && !progress) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`transition-all hover:shadow-md ${statusConfig.className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{projectBudget.name}</CardTitle>
            {projectBudget.description && (
              <p className="text-sm text-gray-600 mt-1">{projectBudget.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(projectBudget.start_date)} - {formatDate(projectBudget.end_date)}
              </div>
              {progress && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getDurationText()}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusConfig.variant} className="text-xs">
              {statusConfig.text}
            </Badge>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(projectBudget)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {progress && (
          <>
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span className="font-medium">{progress.progress_percentage.toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.min(progress.progress_percentage, 100)} 
                className="h-3"
                indicatorClassName={statusConfig.color}
              />
            </div>

            {/* Budget Summary */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="space-y-1">
                <div className="text-xs text-gray-600">Total Budget</div>
                <div className="font-bold text-blue-600">${progress.total_amount.toFixed(2)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-600">Spent</div>
                <div className={`font-bold ${status === 'over' ? 'text-red-600' : 'text-gray-900'}`}>
                  ${progress.total_spent.toFixed(2)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-600">Remaining</div>
                <div className={`font-bold ${progress.remaining_amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${progress.remaining_amount.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Category Progress */}
            {progress.category_progress && progress.category_progress.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Category Breakdown</div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {progress.category_progress.map((categoryData, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="truncate flex-1">{categoryData.category_name}</span>
                      <div className="flex items-center gap-2 ml-2">
                        <div className="w-16 text-right">
                          ${categoryData.spent_amount.toFixed(0)}/${categoryData.allocated_amount.toFixed(0)}
                        </div>
                        <div className="w-8 text-right">
                          {categoryData.percentage_used.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Over Budget Warning */}
            {status === 'over' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2">
                <p className="text-xs text-red-800">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  Over budget by ${Math.abs(progress.remaining_amount).toFixed(2)}
                </p>
              </div>
            )}
          </>
        )}

        {!progress && !loading && (
          <div className="text-center py-4 text-gray-500">
            <Button variant="outline" size="sm" onClick={fetchProgress}>
              Load Progress
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}