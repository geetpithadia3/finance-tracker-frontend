import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, Wallet, Repeat } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import moment from 'moment';
import { transactionsApi } from '@/api/transactions';

const SmartAllocation = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(moment());
  const [allocationData, setAllocationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [recurringLoading, setRecurringLoading] = useState(true);

  useEffect(() => {
    fetchAllocationData();
    fetchRecurringTransactions();
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

  const fetchRecurringTransactions = async () => {
    setRecurringLoading(true);
    try {
      const data = await transactionsApi.getRecurringExpenses();
      setRecurringTransactions(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load recurring transactions",
        variant: "destructive",
      });
      console.error("Error fetching recurring transactions:", error);
    } finally {
      setRecurringLoading(false);
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

  const getDateFlexibilityLabel = (flexibility) => {
    if (!flexibility) return 'Exact date';
    
    switch (flexibility) {
      case 'EXACT': return 'Exact date';
      case 'EARLY_MONTH': return 'Early month (1st-10th)';
      case 'MID_MONTH': return 'Mid month (11th-20th)';
      case 'LATE_MONTH': return 'Late month (21st-31st)';
      case 'CUSTOM_RANGE': return 'Custom day range';
      case 'WEEKDAY': return 'Weekdays only (Mon-Fri)';
      case 'WEEKEND': return 'Weekends only (Sat-Sun)';
      case 'MONTH_RANGE': return 'Month range';
      case 'SEASON': return 'Seasonal';
      default: return flexibility;
    }
  };

  const getPriorityLabel = (priority) => {
    const options = {
      'LOW': 'Low',
      'MEDIUM': 'Medium',
      'HIGH': 'High'
    };
    return options[priority] || priority;
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Header with Date Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-2">
        <h1 className="text-2xl font-bold">Smart Allocation</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => handleMonthChange(-1)}
          >
            <span className="sr-only">Previous month</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
          <div className="text-lg font-medium min-w-[160px] text-center">
            {selectedDate.format('MMMM YYYY')}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => handleMonthChange(1)}
          >
            <span className="sr-only">Next month</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m9 18 6-6-6-6"/></svg>
          </Button>
        </div>
      </div>

      {/* Introduction Card */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="bg-blue-100 p-3 rounded-full">
              <Wallet className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1">What is Smart Allocation?</h2>
              <p className="text-sm text-muted-foreground">
                Smart Allocation helps you plan your spending by showing which bills are due before your next paycheck.
                This helps ensure you have enough money set aside for upcoming expenses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Allocation and Recurring Transactions */}
      <Tabs defaultValue="allocation" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="allocation">Paycheck Allocation</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="allocation">
          {loading ? (
            <Card>
              <CardContent className="flex justify-center items-center h-64">
                <p>Loading allocation data...</p>
              </CardContent>
            </Card>
          ) : !allocationData || !allocationData.paychecks || allocationData.paychecks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No allocation data available</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find any allocation data for this period. This could be because you don't have any recurring expenses.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h3 className="font-medium text-sm text-blue-700 mb-1">Total Income</h3>
                      <p className="text-2xl font-bold">
                        ${allocationData.paychecks.reduce((sum, p) => sum + parseFloat(p.amount), 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <h3 className="font-medium text-sm text-red-700 mb-1">Total Bills</h3>
                      <p className="text-2xl font-bold">
                        ${allocationData.paychecks.reduce((sum, p) => sum + parseFloat(p.totalAllocationAmount), 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <h3 className="font-medium text-sm text-green-700 mb-1">Remaining</h3>
                      <p className="text-2xl font-bold">
                        ${allocationData.paychecks.reduce((sum, p) => sum + parseFloat(p.remainingAmount), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Paychecks Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold px-1">Your Paychecks</h2>
                
                {allocationData.paychecks.map((paycheckAllocation, index) => (
                  <Card key={paycheckAllocation.id} className="overflow-hidden">
                    {/* Paycheck Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {paycheckAllocation.source} 
                            <span className="ml-2 text-sm font-normal text-blue-700">
                              ({getFrequencyLabel(paycheckAllocation.frequency)})
                            </span>
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(paycheckAllocation.date), "MMMM d, yyyy")}
                          </p>
                        </div>
                        <div className="mt-2 md:mt-0">
                          <div className="text-2xl font-bold text-blue-700">
                            ${parseFloat(paycheckAllocation.amount).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardContent className="pt-6">
                      {/* Allocation Progress */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Allocation Progress</span>
                          <span className="text-sm font-medium">
                            ${paycheckAllocation.totalAllocationAmount.toFixed(2)} of ${paycheckAllocation.amount.toFixed(2)}
                          </span>
                        </div>
                        <Progress 
                          value={(paycheckAllocation.totalAllocationAmount / paycheckAllocation.amount) * 100} 
                          className={`h-2 ${paycheckAllocation.remainingAmount < 0 ? 'bg-red-100 [&>div]:bg-red-500' : ''}`}
                        />
                      </div>

                      {/* Remaining Amount */}
                      <div className={`p-4 rounded-lg mb-6 ${
                        paycheckAllocation.remainingAmount >= 0 
                          ? 'bg-green-50 border border-green-100' 
                          : 'bg-red-50 border border-red-100'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Remaining for discretionary spending:</span>
                          <span className={`font-bold text-lg ${
                            paycheckAllocation.remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${paycheckAllocation.remainingAmount.toFixed(2)}
                          </span>
                        </div>
                        
                        {paycheckAllocation.remainingAmount < 0 && (
                          <div className="flex items-start gap-2 mt-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600">
                              Your upcoming bills exceed your paycheck by ${Math.abs(paycheckAllocation.remainingAmount).toFixed(2)}. 
                              Consider adjusting your budget or using savings.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Bills Section */}
                      {paycheckAllocation.expenses.length === 0 ? (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
                          <p className="text-green-700 font-medium">No bills due before your next paycheck!</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Your entire paycheck is available for discretionary spending.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-semibold text-md mb-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            Bills Due Before Next Paycheck
                          </h4>
                          
                          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                            {paycheckAllocation.expenses.map((expense) => (
                              <div key={expense.id} className="flex justify-between items-start p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex-1">
                                  <div className="font-medium">{expense.description}</div>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {expense.category}
                                    </Badge>
                                    <Badge variant={expense.isRecurring ? "secondary" : "outline"} className="text-xs">
                                      {expense.isRecurring ? "Recurring" : "One-time"}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center">
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
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Next Paycheck Info */}
                      {paycheckAllocation.nextPaycheckDate && (
                        <div className="mt-6 pt-4 border-t">
                          <div className="flex items-center gap-2 mb-2">
                            <Wallet className="h-5 w-5 text-blue-600" />
                            <h4 className="font-semibold">Next Paycheck</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(paycheckAllocation.nextPaycheckDate), "MMMM d, yyyy")} 
                            <span className="ml-1 text-xs">
                              ({getDaysUntil(paycheckAllocation.nextPaycheckDate)} days from now)
                            </span>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recurring">
          {recurringLoading ? (
            <Card>
              <CardContent className="flex justify-center items-center h-64">
                <p>Loading recurring transactions...</p>
              </CardContent>
            </Card>
          ) : recurringTransactions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <Repeat className="h-12 w-12 text-amber-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No recurring transactions</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any recurring transactions set up yet. You can create recurring transactions from your transaction list.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Recurring Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[180px]">Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Flexibility</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recurringTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className={transaction.isActive ? '' : 'bg-gray-100 text-gray-500'}>
                          <TableCell className="font-medium">{transaction.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {transaction.category.name}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${Math.abs(transaction.amount).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-blue-600">
                              <Repeat className="h-3 w-3 mr-1" />
                              <span>{getFrequencyLabel(transaction.frequency)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{getDateFlexibilityLabel(transaction.dateFlexibility)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                transaction.priority === 'HIGH' 
                                  ? 'bg-red-50 text-red-700 border-red-200' 
                                  : transaction.priority === 'MEDIUM'
                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {getPriorityLabel(transaction.priority)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={transaction.isActive ? "default" : "outline"}
                              className={`text-xs ${
                                transaction.isActive 
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {transaction.isActive ? 'Active' : 'Paused'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartAllocation; 