import React from 'react';
import GoalList from './GoalList';
import HelpButton from '../../ui/HelpButton';
import GoalsHowItWorks from './GoalsHowItWorks';

const GoalDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 text-foreground p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Sumi Header - Philosophy-Inspired */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">墨</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Intentional Aspirations</h1>
              <p className="text-sm text-muted-foreground">
                Where dreams take shape through mindful commitment
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <HelpButton title="The Art of Purposeful Saving" buttonText="Philosophy" size="sm">
              <GoalsHowItWorks />
            </HelpButton>
          </div>
        </div>

        <GoalList />

        {/* Sumi Wisdom Footer */}
        <div className="text-center py-8 border-t border-muted/30 mt-16">
          <p className="text-sm text-muted-foreground italic">
            "A goal without intention is merely a wish. With mindful action, wishes become reality."
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoalDashboard; 