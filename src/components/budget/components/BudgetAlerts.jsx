import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { AlertTriangle, AlertCircle, TrendingUp, Bell, Calendar, DollarSign } from 'lucide-react';
import { budgetAlertsAPI } from '../../../api/budgetAlerts';
import { useToast } from '../../../hooks/use-toast';

export function BudgetAlerts({ yearMonth = null, compact = false }) {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
    if (!compact) {
      fetchSummary();
    }
  }, [yearMonth, compact]);

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
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    } else if (alert.type === 'approaching_limit') {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
    return <Bell className="h-4 w-4 text-blue-600" />;
  };

  const getAlertVariant = (alert) => {
    if (alert.severity === 'high') return 'destructive';
    if (alert.severity === 'medium') return 'secondary';
    return 'outline';
  };

  const getAlertBorderColor = (alert) => {
    if (alert.severity === 'high') return 'border-red-200';
    if (alert.severity === 'medium') return 'border-yellow-200';
    return 'border-blue-200';
  };

  const getBudgetTypeIcon = (budgetType) => {
    return budgetType === 'monthly' ? <Calendar className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />;
  };

  if (loading && !alerts.length) {
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

  if (compact) {
    const highPriorityAlerts = alerts.filter(a => a.severity === 'high');
    const mediumPriorityAlerts = alerts.filter(a => a.severity === 'medium');

    if (alerts.length === 0) {
      return (
        <Card className="border-green-200 bg-green-50">
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
      <Card className={`${highPriorityAlerts.length > 0 ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {highPriorityAlerts.length > 0 ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
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
    <Card>
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
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-gray-600">All budgets are on track!</p>
            <p className="text-sm text-gray-500 mt-1">No alerts at this time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <Card key={index} className={`${getAlertBorderColor(alert)} transition-all hover:shadow-sm`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getAlertIcon(alert)}
                        <span className="font-medium text-sm">{alert.message}</span>
                        <Badge variant={getAlertVariant(alert)} className="text-xs">
                          {alert.severity === 'high' ? 'Critical' : 'Warning'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
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
                          <span className="text-gray-600">Budget: </span>
                          <span className="font-medium">
                            ${alert.details.budget_amount?.toFixed(2) || alert.details.allocated_amount?.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Spent: </span>
                          <span className={`font-medium ${alert.type === 'over_budget' ? 'text-red-600' : 'text-gray-900'}`}>
                            ${alert.details.spent_amount.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Usage: </span>
                          <span className={`font-medium ${alert.type === 'over_budget' ? 'text-red-600' : 'text-yellow-600'}`}>
                            {alert.details.percentage_used.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            {alert.type === 'over_budget' ? 'Over by: ' : 'Remaining: '}
                          </span>
                          <span className={`font-medium ${
                            alert.type === 'over_budget' ? 'text-red-600' : 'text-green-600'
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
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Recommendations</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {summary.recommendations.filter(Boolean).map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
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