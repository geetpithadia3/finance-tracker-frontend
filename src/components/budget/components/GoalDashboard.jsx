import React from 'react';
import GoalList from './GoalList';
import HelpButton from '../../ui/HelpButton';
import GoalsHowItWorks from './GoalsHowItWorks';

const GoalDashboard = () => {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-1">Savings Goals</h1>
              <p className="text-muted-foreground">Set, track, and achieve your financial targets</p>
            </div>
            <div className="flex items-center gap-3">
              <HelpButton title="How Savings Goals Work" buttonText="How It Works">
                <GoalsHowItWorks />
              </HelpButton>
            </div>
          </div>
        </div>

        <GoalList />
      </div>
    </div>
  );
};

export default GoalDashboard; 