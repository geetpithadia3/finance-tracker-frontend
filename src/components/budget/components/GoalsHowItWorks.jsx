import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Target, TrendingUp, CheckCircle, BarChart3, Calendar, Settings } from 'lucide-react';

const GoalsHowItWorks = () => {
  const steps = [
    {
      icon: Target,
      title: "Create Your Savings Goal",
      description: "Click '+ Add Goal' to create a new savings target. Set a name, description, target amount, and optional deadline.",
      details: [
        "Enter a descriptive name for your goal (e.g., 'Emergency Fund', 'Vacation to Europe')",
        "Set a realistic target amount based on your financial capacity",
        "Choose a deadline to stay motivated and track progress",
        "Optionally create a temporary category to automatically track related transactions"
      ]
    },
    {
      icon: Settings,
      title: "Link to Categories (Optional)",
      description: "Connect your goal to a spending category to automatically track progress from your transactions.",
      details: [
        "Check 'Create temporary category' when creating a goal",
        "Name your category (defaults to '[Goal Name] Savings')",
        "Any transactions categorized under this category will count toward your goal",
        "Perfect for tracking savings transfers or specific goal-related income"
      ]
    },
    {
      icon: TrendingUp,
      title: "Monitor Progress",
      description: "Track your savings progress with visual indicators and detailed statistics.",
      details: [
        "Progress bar shows percentage completed and amount remaining",
        "Color-coded status: Blue (on track), Yellow (almost there), Green (complete)",
        "View saved amount vs target with clear breakdown",
        "Time remaining displayed for goals with deadlines"
      ]
    },
    {
      icon: CheckCircle,
      title: "Manage Goal Status",
      description: "Use the action menu to update your goal's status as your financial situation changes.",
      details: [
        "Mark Complete: When you've reached your target amount",
        "Archive: For goals you want to keep but aren't actively pursuing",
        "Abandon: For goals you've decided not to continue",
        "Revive: Reactivate abandoned goals if circumstances change"
      ]
    },
    {
      icon: BarChart3,
      title: "View Goal Analytics",
      description: "Get insights into your savings progress with comprehensive statistics and summaries.",
      details: [
        "Dashboard shows total active vs completed goals",
        "Track total target amount across all goals",
        "Monitor total savings progress",
        "Identify which goals need attention"
      ]
    },
    {
      icon: Calendar,
      title: "Time-Based Tracking",
      description: "Keep motivation high with deadline tracking and time-sensitive alerts.",
      details: [
        "Set realistic deadlines to create urgency",
        "View time remaining in an easy-to-understand format",
        "Get visual cues for approaching deadlines",
        "Plan your savings rate based on time available"
      ]
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          How Savings Goals Work
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="flex gap-4 p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex-shrink-0">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm lg:text-base mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold text-sm mb-2 text-blue-800 dark:text-blue-200">
            💡 Pro Tips for Effective Goal Setting
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Start with smaller, achievable goals to build momentum</li>
            <li>• Use the SMART criteria: Specific, Measurable, Achievable, Relevant, Time-bound</li>
            <li>• Create temporary categories for automated progress tracking</li>
            <li>• Review and adjust your goals monthly based on your financial situation</li>
            <li>• Celebrate milestones (25%, 50%, 75% progress) to stay motivated</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalsHowItWorks;