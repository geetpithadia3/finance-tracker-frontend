import React, { useEffect, useState } from 'react';
import { goalsApi } from '@/api/goals';

const GoalsStats = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      try {
        const data = await goalsApi.getAll();
        setGoals(data);
      } catch (e) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const activeGoals = goals.filter(g => g.status !== 'complete').length;
  const completedGoals = goals.filter(g => g.status === 'complete').length;
  const totalTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  const totalSaved = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);

  if (loading) {
    return <div className="text-muted-foreground">Loading goal stats...</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
      <div className="flex flex-col items-center">
        <span className="text-lg font-bold text-foreground">{activeGoals}</span>
        <span className="text-xs text-muted-foreground">Active</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-lg font-bold text-green-600">{completedGoals}</span>
        <span className="text-xs text-muted-foreground">Completed</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-lg font-mono font-bold text-foreground">${totalTarget.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground">Total Target</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-lg font-mono font-bold text-blue-600">${totalSaved.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground">Total Saved</span>
      </div>
    </div>
  );
};

export default GoalsStats; 