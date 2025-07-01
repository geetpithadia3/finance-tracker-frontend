import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { AlertTriangle, AlertCircle, TrendingUp, Bell, Calendar, DollarSign } from 'lucide-react';
import { budgetAlertsAPI } from '../../../api/budgetAlerts';
import { useToast } from '../../../hooks/use-toast';

export function BudgetAlerts({ yearMonth = null, compact = false, badge = false }) {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
    if (!compact && !badge) {
      fetchSummary();
    }
  }, [yearMonth, compact, badge]);

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

  const fetchSummary = async () => {
    try {
      const data = await budgetAlertsAPI.getBudgetAlertSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to fetch budget alert summary:', err);
    }
  };

  const getAlertIcon = (alert) => {
    if (alert.type === 'over_budget') {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    } else if (alert.type === 'approaching_limit') {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <Bell className="h-4 w-4 text-primary" />;
  };

  const getAlertVariant = (alert) => {
    if (alert.severity === 'high') return 'destructive';
    if (alert.severity === 'medium') return 'secondary';
    return 'outline';
  };

  const getAlertBorderColor = (alert) => {
    if (alert.severity === 'high') return 'border-destructive';
    if (alert.severity === 'medium') return 'border-yellow-500';
    return 'border-primary';
  };

  const getBudgetTypeIcon = (budgetType) => {
    return budgetType === 'monthly' ? <Calendar className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />;
  };

  if (loading && !alerts.length) {
    return (
      <Card className="animate-pulse bg-card">
        <CardHeader>
          <div className="h-4 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (badge) {
    const highPriorityAlerts = alerts.filter(a => a.severity === 'high');
    const totalAlerts = alerts.length;

    if (totalAlerts === 0) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <div className="h-2 w-2 bg-green-500 rounded-full mr-1"></div>
          On Track
        </Badge>
      );
    }

    return (
      <Badge 
        variant={highPriorityAlerts.length > 0 ? "destructive" : "secondary"}
        className="cursor-pointer"
      >
        {highPriorityAlerts.length > 0 ? (
          <>
            <AlertCircle className="h-3 w-3 mr-1" />
            {totalAlerts} Alert{totalAlerts > 1 ? 's' : ''}
          </>
        ) : (
          <>
            <AlertTriangle className="h-3 w-3 mr-1" />
            {totalAlerts} Warning{totalAlerts > 1 ? 's' : ''}
          </>
        )}
      </Badge>
    );
  }

  if (compact) {
    const highPriorityAlerts = alerts.filter(a => a.severity === 'high');
    const mediumPriorityAlerts = alerts.filter(a => a.severity === 'medium');

    if (alerts.length === 0) {
      return (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700">All budgets on track</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={`${highPriorityAlerts.length > 0 ? 'border-destructive bg-destructive/10' : 'border-yellow-500 bg-yellow-100/50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {highPriorityAlerts.length > 0 ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm font-medium">
                {highPriorityAlerts.length > 0 ? (
                  `${highPriorityAlerts.length} over budget`
                ) : (
                  `${mediumPriorityAlerts.length} approaching limit`
                )}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {alerts.length} alert{alerts.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Budget Alerts
          </CardTitle>
          {summary && (
            <Badge 
              variant={summary.summary.overall_health === 'good' ? 'default' : 
                      summary.summary.overall_health === 'warning' ? 'secondary' : 'destructive'}
            >
              {summary.summary.overall_health === 'good' ? 'Healthy' :
               summary.summary.overall_health === 'warning' ? 'Needs Attention' : 'Critical'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <div className="h-12 w-12 bg-green-100/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-muted-foreground">All budgets are on track!</p>
            <p className="text-sm text-muted-foreground mt-1">No alerts at this time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <Card key={index} className={`${getAlertBorderColor(alert)} bg-card transition-all hover:shadow-sm`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getAlertIcon(alert)}
                        <span className="font-medium text-sm text-foreground">{alert.message}</span>
                        <Badge variant={getAlertVariant(alert)} className="text-xs">
                          {alert.severity === 'high' ? 'Critical' : 'Warning'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          {getBudgetTypeIcon(alert.budget_type)}
                          <span>{alert.budget_type === 'monthly' ? 'Monthly Budget' : 'Project Budget'}</span>
                        </div>
                        <span>{alert.period}</span>
                        {alert.project_name && (
                          <span className="font-medium">{alert.project_name}</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Budget: </span>
                          <span className="font-medium text-foreground">
                            ${alert.details.budget_amount?.toFixed(2) || alert.details.allocated_amount?.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Spent: </span>
                          <span className={`font-medium ${alert.type === 'over_budget' ? 'text-destructive' : 'text-foreground'}`}>
                            ${alert.details.spent_amount.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Usage: </span>
                          <span className={`font-medium ${alert.type === 'over_budget' ? 'text-destructive' : 'text-yellow-500'}`}>
                            {alert.details.percentage_used.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            {alert.type === 'over_budget' ? 'Over by: ' : 'Remaining: '}
                          </span>
                          <span className={`font-medium ${
                            alert.type === 'over_budget' ? 'text-destructive' : 'text-green-500'
                          }`}>
                            ${Math.abs(alert.details.overspend_amount || alert.details.remaining_amount || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {summary && summary.recommendations && (
          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h4 className="font-medium text-primary mb-2">Recommendations</h4>
            <ul className="text-sm text-primary space-y-1">
              {summary.recommendations.filter(Boolean).map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}