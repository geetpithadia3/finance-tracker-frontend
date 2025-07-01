import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Button } from '../../ui/button';
import { AlertTriangle, AlertCircle, TrendingUp, Bell, Calendar, DollarSign, Target, PiggyBank } from 'lucide-react';
import { budgetAPI } from '../../../api/budgets';
import { budgetAlertsAPI } from '../../../api/budgetAlerts';
import { useToast } from '../../../hooks/use-toast';

// Budget Overview Widget
const BudgetOverviewWidget = ({ budgetData }) => {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!budgetData || budgetData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <PiggyBank className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No budgets set for this month</p>
            <p className="text-sm text-gray-500 mt-1">Set up budgets to track your spending</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBudget = budgetData.reduce((sum, cat) => sum + (cat.effective_budget || 0), 0);
  const totalSpent = budgetData.reduce((sum, cat) => sum + (cat.spent_amount || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const getOverallStatus = () => {
    if (overallPercentage >= 100) return { status: 'over', color: 'bg-red-500', text: 'Over Budget' };
    if (overallPercentage >= 80) return { status: 'warning', color: 'bg-yellow-500', text: 'Warning' };
    return { status: 'good', color: 'bg-green-500', text: 'On Track' };
  };

  const overallStatus = getOverallStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Budget Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <Badge variant={overallStatus.status === 'good' ? 'default' : overallStatus.status === 'warning' ? 'secondary' : 'destructive'}>
                {overallStatus.text}
              </Badge>
            </div>
            <Progress 
              value={Math.min(overallPercentage, 100)} 
              className="h-2"
              indicatorClassName={overallStatus.color}
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>${totalSpent.toFixed(0)} / ${totalBudget.toFixed(0)}</span>
              <span className={totalRemaining < 0 ? 'text-red-600' : 'text-green-600'}>
                ${totalRemaining.toFixed(0)} left
              </span>
            </div>
          </div>

          {/* Top Categories */}
          <div>
            <h4 className="text-sm font-medium mb-2">Top Categories</h4>
            <div className="space-y-2">
              {budgetData
                .sort((a, b) => (b.spent_amount || 0) - (a.spent_amount || 0))
                .slice(0, 3)
                .map((category, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="truncate flex-1">{category.category_name}</span>
                    <span className="font-medium">${(category.spent_amount || 0).toFixed(0)}</span>
                    <Badge 
                      variant={category.status === 'good' ? 'default' : category.status === 'warning' ? 'secondary' : 'destructive'}
                      className="ml-2 text-xs"
                    >
                      {category.status === 'good' ? 'OK' : category.status === 'warning' ? 'Warn' : 'Over'}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Compact Budget Alerts Widget
const BudgetAlertsWidget = ({ yearMonth = null }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
  }, [yearMonth]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await budgetAlertsAPI.getBudgetAlerts(yearMonth);
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error('Failed to fetch budget alerts:', err);
      toast({
        title: "Error",
        description: "Failed to fetch budget alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const highPriorityAlerts = alerts.filter(a => a.severity === 'high');
  const mediumPriorityAlerts = alerts.filter(a => a.severity === 'medium');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Budget Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-6">
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">All budgets on track!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border ${
                alert.severity === 'high' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
              }`}>
                <div className="flex items-start gap-2">
                  {alert.severity === 'high' ? (
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {alert.category_name} • ${alert.details.spent_amount.toFixed(0)} / ${alert.details.budget_amount?.toFixed(0) || alert.details.allocated_amount?.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {alerts.length > 3 && (
              <div className="text-center">
                <Button variant="outline" size="sm" className="text-xs">
                  View {alerts.length - 3} more alerts
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Detailed Budget Categories Widget
const BudgetCategoriesWidget = ({ budgetData }) => {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!budgetData || budgetData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Budget Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <PiggyBank className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No budget categories found</p>
            <p className="text-sm text-gray-500 mt-1">Set up budgets to see detailed breakdown</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Budget Categories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgetData.map((category, index) => {
            const percentage = category.effective_budget > 0 ? (category.spent_amount / category.effective_budget) * 100 : 0;
            const getStatusColor = () => {
              if (percentage >= 100) return 'bg-red-500';
              if (percentage >= 80) return 'bg-yellow-500';
              return 'bg-green-500';
            };

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.category_name}</span>
                  <Badge 
                    variant={percentage >= 100 ? 'destructive' : percentage >= 80 ? 'secondary' : 'default'}
                    className="text-xs"
                  >
                    {percentage >= 100 ? 'Over' : percentage >= 80 ? 'Warning' : 'Good'}
                  </Badge>
                </div>
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className="h-2"
                  indicatorClassName={getStatusColor()}
                />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>${category.spent_amount.toFixed(0)} / ${category.effective_budget.toFixed(0)}</span>
                  <span className={category.remaining_amount < 0 ? 'text-red-600' : 'text-green-600'}>
                    ${category.remaining_amount.toFixed(0)} left
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Budget Widgets Component
const BudgetWidgets = ({ budgetData, selectedDate, detailed = false }) => {
  const yearMonth = selectedDate ? selectedDate.format('YYYY-MM') : null;
  
  if (detailed) {
    return (
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <BudgetOverviewWidget budgetData={budgetData} />
        <BudgetCategoriesWidget budgetData={budgetData} />
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <BudgetOverviewWidget budgetData={budgetData} />
      <BudgetAlertsWidget yearMonth={yearMonth} />
    </div>
  );
};

export default BudgetWidgets; 