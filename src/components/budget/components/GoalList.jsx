import React, { useEffect, useState } from 'react';
import GoalCard from './GoalCard';
import { goalsApi } from '@/api/goals';
import { SumiButton } from '../../ui/sumi-button';
import { useToast } from '../../ui/use-toast';
import GoalDialog from './GoalDialog';
import { SumiCard, SumiCardContent } from '../../ui/sumi-card';

const GoalList = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const data = await goalsApi.getAll();
      setGoals(data);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load goals', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleEdit = (goal) => {
    setEditGoal(goal);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditGoal(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditGoal(null);
  };

  const handleDialogSaved = () => {
    fetchGoals();
    handleDialogClose();
  };

  const handleDelete = async (goal) => {
    if (!window.confirm(`Delete goal "${goal.name}"?`)) return;
    try {
      await goalsApi.delete(goal.id);
      toast({ title: 'Goal deleted', description: goal.name });
      fetchGoals();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete goal', variant: 'destructive' });
    }
  };

  const handleStatusChange = () => {
    fetchGoals();
  };

  const activeGoals = goals.filter(g => g.status !== 'complete').length;
  const completedGoals = goals.filter(g => g.status === 'complete').length;
  const totalTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  const totalSaved = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Essential Harmony - Simplified Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <SumiCard className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <SumiCardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">{activeGoals}</div>
            <div className="text-xs text-muted-foreground">Active Intentions</div>
          </SumiCardContent>
        </SumiCard>
        <SumiCard className="border-green-200/50 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800/30">
          <SumiCardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{completedGoals}</div>
            <div className="text-xs text-muted-foreground">Realized Dreams</div>
          </SumiCardContent>
        </SumiCard>
        <SumiCard className="border-muted/50 bg-muted/20">
          <SumiCardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-foreground">${totalTarget.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">Total Vision</div>
          </SumiCardContent>
        </SumiCard>
        <SumiCard className="border-blue-200/50 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800/30">
          <SumiCardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">${totalSaved.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">Current Progress</div>
          </SumiCardContent>
        </SumiCard>
      </div>
      {/* Aspiration Canvas */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">Your Aspiration Canvas</h2>
          <p className="text-sm text-muted-foreground">
            Each intention painted with purpose, progress with mindfulness
          </p>
        </div>
        
        <GoalDialog open={dialogOpen} onClose={handleDialogClose} initialGoal={editGoal} onSaved={handleDialogSaved} />
        
        {loading ? (
          <SumiCard className="bg-gradient-to-br from-muted/30 to-muted/10 border-muted/50">
            <SumiCardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <div className="text-muted-foreground italic">Gathering your aspirations...</div>
            </SumiCardContent>
          </SumiCard>
        ) : goals.length === 0 ? (
          <SumiCard className="bg-gradient-to-br from-muted/30 to-muted/10 border-muted/50">
            <SumiCardContent className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary">墨</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Begin Your Intentional Journey</h3>
              <div className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                Like preparing your canvas before the first brushstroke, set your first aspiration 
                and watch it take shape through mindful action.
              </div>
              <SumiButton onClick={handleAdd} className="rounded-full">
                Paint Your First Intention
              </SumiButton>
              <p className="text-xs text-muted-foreground italic mt-6 border-t border-muted pt-4">
                "Every master began with a single, purposeful stroke"
              </p>
            </SumiCardContent>
          </SumiCard>
        ) : (
          <>
            <div className="flex justify-center">
              <SumiButton onClick={handleAdd} className="rounded-full shadow-lg">
                + Paint New Intention
              </SumiButton>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map(goal => (
                <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GoalList; 