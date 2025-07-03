import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Calendar, 
  Wallet, 
  InfoIcon, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Target,
  Clock,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import moment from 'moment';
import { transactionsApi } from '@/api/transactions';
import { MonthSelector } from '@/components/ui/MonthSelector';
import SectionHeader from "@/components/ui/SectionHeader";
import HelpButton from "@/components/ui/HelpButton";
import SmartAllocationHowItWorks from './SmartAllocationHowItWorks';

const SmartAllocation = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(moment());
  const [allocationData, setAllocationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllocationData();
  }, [selectedDate]);

  const fetchAllocationData = async () => {
    console.log('Fetching allocation data for:', selectedDate.format('YYYY-MM'));
    setLoading(true);
    try {
      const data = await transactionsApi.getSmartAllocation(selectedDate.format('YYYY-MM'));
      setAllocationData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load smart allocation data",
        variant: "destructive",
      });
      console.error("Error fetching allocation data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (direction) => {
    setSelectedDate(prev => prev.clone().add(direction, 'months'));
  };

  const getFrequencyLabel = (frequency) => {
    switch (frequency) {
      case 'DAILY': return 'Daily';
      case 'WEEKLY': return 'Weekly';
      case 'BIWEEKLY': return 'Bi-weekly';
      case 'FOUR_WEEKLY': return 'Every 4 weeks';
      case 'MONTHLY': return 'Monthly';
      case 'YEARLY': return 'Yearly';
      default: return frequency;
    }
  };

  const getDaysUntil = (dateString) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = Math.abs(targetDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getFinancialStatus = (paychecks) => {
    if (!paychecks || paychecks.length === 0) return { status: 'no-data', score: 0, details: ['No paycheck data available'] };
    
    const totalIncome = paychecks.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const totalBills = paychecks.reduce((sum, p) => sum + parseFloat(p.totalAllocationAmount), 0);
    const totalRemaining = paychecks.reduce((sum, p) => sum + parseFloat(p.remainingAmount), 0);
    
    // Calculate financial health score
    const billRatio = totalBills / totalIncome;
    const remainingRatio = totalRemaining / totalIncome;
    
    let status, score, details;
    
    if (totalRemaining < 0) {
      status = 'critical';
      score = Math.max(0, Math.round((1 - Math.abs(totalRemaining) / totalIncome) * 100));
      details = [`Bills exceed income by $${Math.abs(totalRemaining).toFixed(2)}`];
    } else if (billRatio > 0.8) {
      status = 'warning';
      score = Math.round((1 - billRatio) * 100);
      details = [`${(billRatio * 100).toFixed(0)}% of income allocated to bills`];
    } else if (remainingRatio > 0.3) {
      status = 'excellent';
      score = Math.round(remainingRatio * 100);
      details = [`${(remainingRatio * 100).toFixed(0)}% available for discretionary spending`];
    } else {
      status = 'on-track';
      score = Math.round((1 - billRatio) * 100);
      details = [`${(remainingRatio * 100).toFixed(0)}% available for discretionary spending`];
    }
    
    return { status, score, details };
  };

  const getStatusConfig = (status) => {
    const configs = {
      excellent: { 
        color: 'green', 
        bg: 'bg-green-100', 
        text: 'text-green-600',
        icon: CheckCircle,
        border: 'border-green-200'
      },
      'on-track': { 
        color: 'blue', 
        bg: 'bg-blue-100', 
        text: 'text-blue-600',
        icon: Target,
        border: 'border-blue-200'
      },
      warning: { 
        color: 'orange', 
        bg: 'bg-orange-100', 
        text: 'text-orange-600',
        icon: AlertCircle,
        border: 'border-orange-200'
      },
      critical: { 
        color: 'red', 
        bg: 'bg-red-100', 
        text: 'text-red-600',
        icon: AlertCircle,
        border: 'border-red-200'
      },
      'no-data': { 
        color: 'gray', 
        bg: 'bg-gray-100', 
        text: 'text-gray-600',
        icon: InfoIcon,
        border: 'border-gray-200'
      }
    };
    return configs[status] || configs['no-data'];
  };

  const financialStatus = getFinancialStatus(allocationData?.paychecks);
  const statusConfig = getStatusConfig(financialStatus.status);
  const StatusIcon = statusConfig.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 text-foreground p-4 sm:p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Sumi Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">墨</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Money Planning</h1>
                <p className="text-sm text-muted-foreground">
                  {selectedDate.format('MMMM YYYY')} • Balance your resources with wisdom
                </p>
              </div>
            </div>
          </div>
          
          <Card className="bg-gradient-to-br from-muted/30 to-muted/10 border-muted/50">
            <CardContent className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground italic">Gathering your resources...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 text-foreground p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <>
          {/* Sumi Header - Philosophy-Inspired */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">墨</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Money Planning</h1>
                <p className="text-sm text-muted-foreground">
                  {selectedDate.format('MMMM YYYY')} • Balance your resources with wisdom
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <MonthSelector
                value={selectedDate.format('YYYY-MM')}
                onChange={(yearMonth) => {
                  const [year, month] = yearMonth.split('-');
                  const newDate = selectedDate.clone().year(parseInt(year)).month(parseInt(month) - 1);
                  handleMonthChange(newDate.diff(selectedDate, 'months'));
                }}
                size="default"
              />
              <HelpButton title="Money Planning Guide" buttonText="Guide" size="sm">
                <SmartAllocationHowItWorks />
              </HelpButton>
            </div>
          </div>

          {/* Financial Harmony - Simplified Insight */}
          <Card className="bg-gradient-to-r from-muted/50 to-muted/20 border-muted/50">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className={`p-3 rounded-lg ${statusConfig.bg}`}>
                    <StatusIcon className={`h-6 w-6 ${statusConfig.text}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Financial Health</h2>
                    <p className="text-sm text-muted-foreground">Your money balance for {selectedDate.format('MMMM YYYY')}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${statusConfig.text}`}>
                      {financialStatus.status.replace('-', ' ').split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </div>
                    <div className="text-xs text-muted-foreground">Status</div>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">{financialStatus.score}%</div>
                    <div className="text-xs text-muted-foreground">Health Score</div>
                  </div>
                </div>
                
                {financialStatus.details && financialStatus.details.length > 0 && (
                  <div className="text-sm text-muted-foreground italic border-t border-muted pt-3">
                    "{financialStatus.details[0]}"
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mindful Guidance - Action Indicators */}
          {financialStatus.status === 'critical' && (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/30 dark:border-red-700">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Over Budget</AlertTitle>
              <AlertDescription className="text-red-700">
                Your bills exceed your income. Consider reducing expenses or increasing income.
              </AlertDescription>
            </Alert>
          )}
          
          {financialStatus.status === 'warning' && (
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/30 dark:border-orange-700">
              <Target className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">Tight Budget</AlertTitle>
              <AlertDescription className="text-orange-700">
                Most of your income goes to bills. Consider ways to increase your financial cushion.
              </AlertDescription>
            </Alert>
          )}
          
          {financialStatus.status === 'excellent' && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/30 dark:border-green-700">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Healthy Budget</AlertTitle>
              <AlertDescription className="text-green-700">
                Your income comfortably covers expenses with room for savings. Great financial position!
              </AlertDescription>
            </Alert>
          )}

          {/* Essential Flow - Monthly Overview */}
          {allocationData && allocationData.paychecks && allocationData.paychecks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="border-green-200/50 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800/30">
                <CardContent className="p-6 text-center">
                  <div className="space-y-2">
                    <div className="text-xs text-green-700 dark:text-green-400 font-medium tracking-wide uppercase">Inflow</div>
                    <div className="text-3xl font-bold text-green-800 dark:text-green-300">
                      ${allocationData.paychecks.reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Resources Received</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200/50 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800/30">
                <CardContent className="p-6 text-center">
                  <div className="space-y-2">
                    <div className="text-xs text-blue-700 dark:text-blue-400 font-medium tracking-wide uppercase">Obligations</div>
                    <div className="text-3xl font-bold text-blue-800 dark:text-blue-300">
                      ${allocationData.paychecks.reduce((sum, p) => sum + parseFloat(p.totalAllocationAmount), 0).toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Committed Flow</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className="space-y-2">
                    <div className="text-xs text-primary font-medium tracking-wide uppercase">Freedom</div>
                    <div className="text-3xl font-bold text-foreground">
                      ${allocationData.paychecks.reduce((sum, p) => sum + parseFloat(p.remainingAmount), 0).toFixed(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Intentional Choice</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Resource Streams - Your Income Sources */}
          {allocationData && allocationData.paychecks && allocationData.paychecks.length > 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-foreground mb-2">Your Resource Streams</h2>
                <p className="text-sm text-muted-foreground">
                  Each stream flows with purpose, supporting your intentions
                </p>
              </div>
              <div className="space-y-4">
                {allocationData.paychecks.map((paycheckAllocation, _index) => (
                  <Card key={paycheckAllocation.id} className="bg-card/50 backdrop-blur-sm border-muted/30 hover:shadow-md transition-all duration-200">
                    {/* Stream Header - Simplified */}
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20 py-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="space-y-2">
                          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <span>{paycheckAllocation.source}</span>
                            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                              {getFrequencyLabel(paycheckAllocation.frequency)}
                            </Badge>
                          </CardTitle>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(paycheckAllocation.date), "MMMM d, yyyy")}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          ${parseFloat(paycheckAllocation.amount).toFixed(0)}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-6 p-6">
                      {/* Flow Balance */}
                      <div className="mb-6 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-foreground">Resource Allocation</span>
                          <span className="text-sm text-muted-foreground">
                            ${paycheckAllocation.totalAllocationAmount.toFixed(0)} of ${paycheckAllocation.amount.toFixed(0)}
                          </span>
                        </div>
                        <Progress 
                          value={(paycheckAllocation.totalAllocationAmount / paycheckAllocation.amount) * 100} 
                          className={cn(
                            "h-2 rounded-full",
                            paycheckAllocation.remainingAmount < 0 && "bg-red-100 [&>div]:bg-red-500",
                            paycheckAllocation.remainingAmount >= 0 && paycheckAllocation.remainingAmount < paycheckAllocation.amount * 0.2 && "bg-yellow-100 [&>div]:bg-yellow-500",
                            paycheckAllocation.remainingAmount >= paycheckAllocation.amount * 0.2 && "bg-green-100 [&>div]:bg-green-500"
                          )}
                        />
                      </div>

                      {/* Freedom Flow Status */}
                      <div className={`p-4 rounded-xl mb-6 ${
                        paycheckAllocation.remainingAmount < 0 
                          ? 'bg-red-50/50 border border-red-200/50' 
                          : paycheckAllocation.remainingAmount < paycheckAllocation.amount * 0.2
                          ? 'bg-yellow-50/50 border border-yellow-200/50'
                          : 'bg-green-50/50 border border-green-200/50'
                      }`}>
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center gap-3">
                            {paycheckAllocation.remainingAmount < 0 ? (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            ) : paycheckAllocation.remainingAmount < paycheckAllocation.amount * 0.2 ? (
                              <Target className="h-5 w-5 text-yellow-600" />
                            ) : (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                            <span className="font-medium text-foreground">
                              Available for mindful choices:
                            </span>
                          </div>
                          <span className={cn("font-bold text-xl", 
                            paycheckAllocation.remainingAmount < 0 ? "text-red-600" : 
                            paycheckAllocation.remainingAmount < paycheckAllocation.amount * 0.2 ? "text-yellow-600" : 
                            "text-green-600"
                          )}>
                            ${paycheckAllocation.remainingAmount.toFixed(0)}
                          </span>
                        </div>
                        
                        {paycheckAllocation.remainingAmount < 0 && (
                          <div className="mt-3 text-sm text-red-700 italic">
                            <p>
                              Your obligations exceed this stream by ${Math.abs(paycheckAllocation.remainingAmount).toFixed(0)}. 
                              Consider rebalancing your flow or drawing from reserves.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Obligations Section */}
                      {paycheckAllocation.expenses.length === 0 ? (
                        <Alert className="border-green-200 bg-green-50/50 dark:bg-green-900/30 dark:border-green-700">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertTitle className="text-green-800">Complete Freedom</AlertTitle>
                          <AlertDescription className="text-green-700">
                            No obligations before your next resource stream. Pure intentional choice awaits.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div>
                          <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Upcoming Obligations
                          </h4>
                          
                          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                            {paycheckAllocation.expenses.map((expense) => (
                              <Card key={expense.id} className="bg-muted/30 border-muted/50 hover:bg-muted/50 transition-colors">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="font-medium text-foreground">{expense.description}</div>
                                      <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                          {expense.category}
                                        </Badge>
                                        <Badge variant={expense.isRecurring ? "secondary" : "outline"} className="text-xs">
                                          {expense.isRecurring ? "Recurring" : "One-time"}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground flex items-center">
                                          <Calendar className="h-3 w-3 mr-1" />
                                          {format(new Date(expense.dueDate), "MMM d")} 
                                          <span className="ml-1">({getDaysUntil(expense.dueDate)} days)</span>
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-lg font-semibold text-foreground ml-4">
                                      ${Math.abs(parseFloat(expense.amount)).toFixed(0)}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Next Stream Info */}
                      {paycheckAllocation.nextPaycheckDate && (
                        <>
                          <Separator className="my-6" />
                          <div className="flex items-center gap-2 mb-2">
                            <Wallet className="h-5 w-5 text-primary" />
                            <h4 className="font-medium text-foreground">Next Paycheck</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(paycheckAllocation.nextPaycheckDate), "MMMM d, yyyy")} 
                            <span className="ml-1 text-xs">
                              ({getDaysUntil(paycheckAllocation.nextPaycheckDate)} days ahead)
                            </span>
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State - Begin Your Practice */}
          {!loading && (!allocationData || !allocationData.paychecks || allocationData.paychecks.length === 0) && (
            <Card className="bg-gradient-to-br from-muted/30 to-muted/10 border-muted/50">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-primary">墨</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">No Income Data</h3>
                <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
                  Set up your paychecks and bills to see how your money flows throughout the month.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" className="rounded-full">Add Recurring Bills</Button>
                  <Button className="rounded-full">Add Paychecks</Button>
                </div>
                <p className="text-xs text-muted-foreground italic mt-6 border-t border-muted pt-4">
                  "The wise painter knows their materials before touching brush to paper"
                </p>
              </CardContent>
            </Card>
          )}

          {/* Sumi Wisdom Footer */}
          <div className="text-center py-8 border-t border-muted/30 mt-16">
            <p className="text-sm text-muted-foreground italic">
              "Like water finding its path, let your resources flow with intention and wisdom."
            </p>
          </div>
        </>
      </div>
    </div>
  );
};

export default SmartAllocation; 