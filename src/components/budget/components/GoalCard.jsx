import React, { useState } from 'react';
import { SumiCard, SumiCardContent } from '../../ui/sumi-card';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import { CheckCircle, Target, AlertTriangle, TrendingUp, Edit, Trash2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SumiButton } from '../../ui/sumi-button';
import { goalsApi } from '@/api/goals';
import { useToast } from '../../ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '../../ui/dropdown-menu';
import { Tooltip } from '../../ui/tooltip';

/**
 * GoalCard - Displays a single goal's progress and status
 * @param {object} goal - The goal object
 * @param {function} onEdit - Edit handler
 * @param {function} onDelete - Delete handler
 * @param {function} onStatusChange - Status change handler
 */
const GoalCard = ({ goal, onEdit, onDelete, onStatusChange }) => {
  const { name, description, targetAmount, currentAmount, deadline, status: goalStatus, id } = goal;
  const progress = Math.min((currentAmount / targetAmount) * 100, 100);
  const remaining = targetAmount - currentAmount;
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  // Status logic
  let status = 'good';
  if (goalStatus === 'complete') status = 'complete';
  else if (goalStatus === 'abandon') status = 'abandon';
  else if (goalStatus === 'archive') status = 'archive';
  else if (progress >= 100) status = 'complete';
  else if (progress >= 80) status = 'warning';
  else status = 'good';

  const getStatusConfig = (status) => {
    switch (status) {
      case 'complete':
        return {
          color: 'bg-green-500',
          variant: 'default',
          text: 'Complete',
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
          text: 'Almost There',
          className: 'border-border bg-card',
          icon: AlertTriangle,
          iconColor: 'text-yellow-500',
          bgGradient: 'from-yellow-50 to-amber-50',
          borderColor: 'border-yellow-200'
        };
      case 'abandon':
        return {
          color: 'bg-gray-500',
          variant: 'outline',
          text: 'Abandoned',
          className: 'border-border bg-card',
          icon: TrendingUp,
          iconColor: 'text-gray-500',
          bgGradient: 'from-gray-50 to-slate-50',
          borderColor: 'border-gray-200'
        };
      case 'archive':
        return {
          color: 'bg-blue-300',
          variant: 'outline',
          text: 'Archived',
          className: 'border-border bg-card',
          icon: Target,
          iconColor: 'text-blue-300',
          bgGradient: 'from-blue-50 to-sky-50',
          borderColor: 'border-blue-200'
        };
      case 'good':
      default:
        return {
          color: 'bg-blue-500',
          variant: 'outline',
          text: 'On Track',
          className: 'border-border bg-card',
          icon: Target,
          iconColor: 'text-blue-500',
          bgGradient: 'from-blue-50 to-sky-50',
          borderColor: 'border-blue-200'
        };
    }
  };
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  // Handler for status change
  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await goalsApi.updateStatus(id, newStatus);
      toast({ title: 'Goal status updated', description: `Goal marked as ${newStatus}` });
      // Refresh the goal list
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update goal status', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  const timeLeft = deadline ? (() => {
    const end = new Date(deadline);
    const now = new Date();
    const diff = end - now;
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 30) return `${Math.floor(days / 30)} mo left`;
    if (days > 0) return `${days} days left`;
    return 'Ends soon';
  })() : null;

  return (
    <SumiCard className={cn(
      'transition-all duration-200 hover:shadow-md hover:scale-[1.02] group',
      statusConfig.className
    )}>
      <SumiCardContent className="p-4">
        {/* Header with Goal and Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={cn(
              'p-1.5 rounded-lg',
              status === 'good' ? 'bg-blue-100/50' :
              status === 'warning' ? 'bg-yellow-100/50' :
              status === 'complete' ? 'bg-green-100/50' : 'bg-muted'
            )} aria-label={`Status: ${statusConfig.text}`}>
              <StatusIcon className={cn('h-4 w-4', statusConfig.iconColor)} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm text-foreground truncate">{name}</h4>
              <div className="text-xs text-muted-foreground truncate">{description}</div>
            </div>
          </div>
          <Badge
            variant={statusConfig.variant}
            className={cn(
              'text-xs px-2 py-1 font-medium',
              status === 'good' ? 'bg-blue-100/50 text-blue-700 border-blue-200' :
              status === 'warning' ? 'bg-yellow-100/50 text-yellow-700 border-yellow-200' :
              status === 'complete' ? 'bg-green-100/50 text-green-700 border-green-200' :
              'bg-muted text-muted-foreground border-border'
            )}
            aria-label={`Goal status: ${statusConfig.text}`}
          >
            {statusConfig.text}
          </Badge>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <SumiButton
              variant="ghost"
              size="sm"
              onClick={() => onEdit(goal)}
              className="h-6 w-6 p-0 hover:bg-gray-200"
              disabled={status === 'complete' || status === 'archive'}
              aria-label="Edit goal"
            >
              <Edit className="h-3 w-3" />
            </SumiButton>
            <SumiButton
              variant="ghost"
              size="sm"
              onClick={() => onDelete(goal)}
              className="h-6 w-6 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
              disabled={status === 'complete' || status === 'archive'}
              aria-label="Delete goal"
            >
              <Trash2 className="h-3 w-3" />
            </SumiButton>
            {/* Status Actions Dropdown */}
            {(status !== 'complete' && status !== 'archive') && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SumiButton variant="ghost" size="icon" className="h-6 w-6 p-0" aria-label="More actions"><MoreVertical className="h-4 w-4" /></SumiButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {status === 'abandon' ? (
                    <DropdownMenuItem disabled={updating} onClick={() => handleStatusChange('active')}>Revive</DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem disabled={updating} onClick={() => handleStatusChange('complete')}>Mark Complete</DropdownMenuItem>
                      <DropdownMenuItem disabled={updating} onClick={() => handleStatusChange('abandon')}>Abandon</DropdownMenuItem>
                      <DropdownMenuItem disabled={updating} onClick={() => handleStatusChange('archive')}>Archive</DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-muted-foreground">Progress</span>
            <span className="text-xs font-bold text-foreground">{progress.toFixed(0)}%</span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-2" indicatorClassName={statusConfig.color} />
            
          </div>
        </div>
        {/* Time left */}
        {timeLeft && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <AlertTriangle className="h-3 w-3 text-yellow-500" aria-label="Time left" />
            <span>{timeLeft}</span>
          </div>
        )}
        {/* Goal Summary */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Saved / Target</span>
            <span className="text-xs font-medium text-foreground">
              ${currentAmount.toFixed(2)} / ${targetAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Remaining</span>
            <span className={cn(
              'text-sm font-bold',
              remaining <= 0 ? 'text-green-600' : 'text-blue-600'
            )}>
              {remaining <= 0 ? 'Goal Met!' : `$${remaining.toFixed(2)}`}
            </span>
          </div>
        </div>
        {/* Deadline */}
        {deadline && (
          <div className="mt-2 text-xs text-muted-foreground">Deadline: {new Date(deadline).toLocaleDateString()}</div>
        )}
      </SumiCardContent>
    </SumiCard>
  );
};

export default GoalCard; 