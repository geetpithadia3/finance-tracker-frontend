import React, { useEffect, useState } from 'react';
import GoalCard from './GoalCard';
import { goalsApi } from '@/api/goals';
import { Button } from '../../ui/button';
import { useToast } from '../../ui/use-toast';
import GoalDialog from './GoalDialog';
import { Card, CardContent } from '../../ui/card';

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
    <div className="space-y-6">
      {/* Goals Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card text-card-foreground border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{activeGoals}</div>
            <div className="text-sm text-muted-foreground">Active Goals</div>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-mono font-bold text-foreground">${totalTarget.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Target</div>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-mono font-bold text-blue-600">${totalSaved.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Saved</div>
          </CardContent>
        </Card>
      </div>
      {/* Goals List Section */}
      <Card className="bg-card text-card-foreground border">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Your Goals</h2>
            <Button onClick={handleAdd}>
              + Add Goal
            </Button>
          </div>
          
          <GoalDialog open={dialogOpen} onClose={handleDialogClose} initialGoal={editGoal} onSaved={handleDialogSaved} />
          
          {loading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading goals...</div>
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">No goals found. Start by adding a new goal.</div>
              <Button onClick={handleAdd} variant="outline">
                Create Your First Goal
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map(goal => (
                <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalList; 