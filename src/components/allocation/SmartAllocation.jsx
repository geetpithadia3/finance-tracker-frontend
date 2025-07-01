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
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <SectionHeader
            title="Smart Allocation"
            subtitle="Plan your spending and see which bills are due before your next paycheck."
          >
            <MonthSelector
              value={selectedDate.format('YYYY-MM')}
              onChange={(yearMonth) => {
                const [year, month] = yearMonth.split('-');
                const newDate = selectedDate.clone().year(parseInt(year)).month(parseInt(month) - 1);
                handleMonthChange(newDate.diff(selectedDate, 'months'));
              }}
              size="default"
            />
          </SectionHeader>
          <Card className="bg-card text-card-foreground border shadow-md">
            <CardContent className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading allocation data...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <SectionHeader
          title="Smart Allocation"
          subtitle="Plan your spending and see which bills are due before your next paycheck."
        >
          <div className="flex items-center gap-3">
            <HelpButton title="How Smart Allocation Works" buttonText="How It Works">
              <SmartAllocationHowItWorks />
            </HelpButton>
            <MonthSelector
              value={selectedDate.format('YYYY-MM')}
              onChange={(yearMonth) => {
                const [year, month] = yearMonth.split('-');
                const newDate = selectedDate.clone().year(parseInt(year)).month(parseInt(month) - 1);
                handleMonthChange(newDate.diff(selectedDate, 'months'));
              }}
              size="default"
            />
          </div>
        </SectionHeader>

        {/* Financial Health Status Card */}
        <Card className="bg-card text-card-foreground border shadow-md">
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-lg ${statusConfig.bg}`}>
                <StatusIcon className={`h-6 w-6 ${statusConfig.text}`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Financial Health</h2>
                <p className="text-sm text-muted-foreground">Your spending allocation status for {selectedDate.format('MMMM YYYY')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">
                  {financialStatus.score}/100
                </div>
                <div className="text-sm text-muted-foreground">Health Score</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground capitalize">
                  {financialStatus.status.replace('-', ' ')}
                </div>
                <div className="text-sm text-muted-foreground">Status</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">
                  {financialStatus.details[0]}
                </div>
              </div>
            </div>

            {/* Action Indicators */}
            {financialStatus.status === 'critical' && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/30 dark:border-red-700">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Immediate Action Required</AlertTitle>
                <AlertDescription className="text-red-700">
                  Your bills exceed your income. Consider reducing expenses or using savings to cover the shortfall.
                </AlertDescription>
              </Alert>
            )}
            
            {financialStatus.status === 'warning' && (
              <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/30 dark:border-orange-700">
                <Target className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-800">Monitor Your Spending</AlertTitle>
                <AlertDescription className="text-orange-700">
                  You're allocating a high percentage of your income to bills. Consider reviewing your budget.
                </AlertDescription>
              </Alert>
            )}
            
            {financialStatus.status === 'excellent' && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-900/30 dark:border-green-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Excellent Financial Health</AlertTitle>
                <AlertDescription className="text-green-700">
                  You have a healthy balance between bills and discretionary spending. Keep up the great work!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Monthly Overview Section */}
        {allocationData && allocationData.paychecks && allocationData.paychecks.length > 0 && (
          <Card className="bg-card text-card-foreground border shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Monthly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-blue-50 dark:bg-muted border-blue-100 dark:border-border">
                  <CardContent className="pt-4 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-medium text-sm text-blue-700 dark:text-blue-400">Total Income</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                      ${allocationData.paychecks.reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-red-50 dark:bg-muted border-red-100 dark:border-border">
                  <CardContent className="pt-4 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <h3 className="font-medium text-sm text-red-700 dark:text-red-400">Total Bills</h3>
                    </div>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-300">
                      ${allocationData.paychecks.reduce((sum, p) => sum + parseFloat(p.totalAllocationAmount), 0).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-muted border-green-100 dark:border-border">
                  <CardContent className="pt-4 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <h3 className="font-medium text-sm text-green-700 dark:text-green-400">Available</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                      ${allocationData.paychecks.reduce((sum, p) => sum + parseFloat(p.remainingAmount), 0).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paychecks Section */}
        {allocationData && allocationData.paychecks && allocationData.paychecks.length > 0 && (
          <Card className="bg-card text-card-foreground border shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Your Paychecks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allocationData.paychecks.map((paycheckAllocation, _index) => (
                  <Card key={paycheckAllocation.id} className="border-gray-200 hover:shadow-md transition-all duration-200">
                    {/* Paycheck Header */}
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:bg-muted dark:from-none dark:to-none border-b py-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                        <div>
                          <CardTitle className="text-lg flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span>{paycheckAllocation.source}</span>
                            <Badge variant="secondary" className="text-xs font-normal text-blue-700 w-fit">
                              {getFrequencyLabel(paycheckAllocation.frequency)}
                            </Badge>
                          </CardTitle>
                          <div className="flex items-center gap-1 text-sm text-blue-600">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(paycheckAllocation.date), "MMMM d, yyyy")}
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-blue-700">
                          ${parseFloat(paycheckAllocation.amount).toFixed(2)}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-6 p-6">
                      {/* Allocation Progress */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Allocation Progress</span>
                          <span className="text-sm font-medium text-gray-700">
                            ${paycheckAllocation.totalAllocationAmount.toFixed(2)} of ${paycheckAllocation.amount.toFixed(2)}
                          </span>
                        </div>
                        <Progress 
                          value={(paycheckAllocation.totalAllocationAmount / paycheckAllocation.amount) * 100} 
                          className={cn(
                            "h-3",
                            paycheckAllocation.remainingAmount < 0 && "bg-red-100 [&>div]:bg-red-500",
                            paycheckAllocation.remainingAmount >= 0 && paycheckAllocation.remainingAmount < paycheckAllocation.amount * 0.2 && "bg-yellow-100 [&>div]:bg-yellow-500",
                            paycheckAllocation.remainingAmount >= paycheckAllocation.amount * 0.2 && "bg-green-100 [&>div]:bg-green-500"
                          )}
                        />
                      </div>

                      {/* Remaining Amount Status */}
                      <div className={`p-4 rounded-lg mb-6 ${
                        paycheckAllocation.remainingAmount < 0 
                          ? 'bg-red-50 border border-red-200' 
                          : paycheckAllocation.remainingAmount < paycheckAllocation.amount * 0.2
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-green-50 border border-green-200'
                      }`}>
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center gap-2">
                            {paycheckAllocation.remainingAmount < 0 ? (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            ) : paycheckAllocation.remainingAmount < paycheckAllocation.amount * 0.2 ? (
                              <Target className="h-5 w-5 text-yellow-600" />
                            ) : (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                            <span className="font-semibold text-gray-900">
                              Available for discretionary spending:
                            </span>
                          </div>
                          <span className={cn("font-bold text-xl", 
                            paycheckAllocation.remainingAmount < 0 ? "text-red-600" : 
                            paycheckAllocation.remainingAmount < paycheckAllocation.amount * 0.2 ? "text-yellow-600" : 
                            "text-green-600"
                          )}>
                            ${paycheckAllocation.remainingAmount.toFixed(2)}
                          </span>
                        </div>
                        
                        {paycheckAllocation.remainingAmount < 0 && (
                          <div className="mt-3 text-sm text-red-700">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                              <p>
                                Your upcoming bills exceed your paycheck by ${Math.abs(paycheckAllocation.remainingAmount).toFixed(2)}. 
                                Consider adjusting your budget or using savings.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bills Section */}
                      {paycheckAllocation.expenses.length === 0 ? (
                        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/30 dark:border-green-700">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertTitle className="text-green-800">No bills due before your next paycheck!</AlertTitle>
                          <AlertDescription className="text-green-700">
                            Your entire paycheck is available for discretionary spending.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div>
                          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-amber-500" />
                            Bills Due Before Next Paycheck
                          </h4>
                          
                          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                            {paycheckAllocation.expenses.map((expense) => (
                              <Card key={expense.id} className="border-gray-200 hover:bg-gray-50 transition-colors">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">{expense.description}</div>
                                      <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <Badge variant="outline" className="text-xs">
                                          {expense.category}
                                        </Badge>
                                        <Badge variant={expense.isRecurring ? "secondary" : "outline"} className="text-xs">
                                          {expense.isRecurring ? "Recurring" : "One-time"}
                                        </Badge>
                                        <span className="text-xs text-gray-500 flex items-center">
                                          <Calendar className="h-3 w-3 mr-1" />
                                          Due: {format(new Date(expense.dueDate), "MMM d")} 
                                          <span className="ml-1">({getDaysUntil(expense.dueDate)} days)</span>
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-lg font-semibold text-red-600 ml-4">
                                      ${Math.abs(parseFloat(expense.amount)).toFixed(2)}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Next Paycheck Info */}
                      {paycheckAllocation.nextPaycheckDate && (
                        <>
                          <Separator className="my-6" />
                          <div className="flex items-center gap-2 mb-2">
                            <Wallet className="h-5 w-5 text-blue-600" />
                            <h4 className="font-semibold text-gray-900">Next Paycheck</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            {format(new Date(paycheckAllocation.nextPaycheckDate), "MMMM d, yyyy")} 
                            <span className="ml-1 text-xs">
                              ({getDaysUntil(paycheckAllocation.nextPaycheckDate)} days from now)
                            </span>
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && (!allocationData || !allocationData.paychecks || allocationData.paychecks.length === 0) && (
          <Card className="bg-card text-card-foreground border shadow-md">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <Wallet className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No allocation data available</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                We couldn&apos;t find any allocation data for this period. This could be because you don&apos;t have any recurring expenses or paycheck information set up.
              </p>
              <div className="flex gap-2">
                <Button variant="outline">Set Up Recurring Transactions</Button>
                <Button>Add Paycheck Information</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SmartAllocation; 