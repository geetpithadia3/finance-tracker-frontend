import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Repeat, ArrowLeft, Calendar, DollarSign, ToggleLeft, ToggleRight } from "lucide-react";
import { transactionsApi } from '@/api/transactions';
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { formatCurrency, getFrequencyLabel, getDateFlexibilityLabel } from '../utils/transactionHelpers';

const RecurringTransactionsList = ({ onBack }) => {
  const { toast } = useToast();
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);
  const [transactionToToggle, setTransactionToToggle] = useState(null);

  useEffect(() => {
    fetchRecurringTransactions();
  }, []);

  const fetchRecurringTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await transactionsApi.getRecurringExpenses();
      setRecurringTransactions(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to load recurring transactions",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get a readable frequency label


  const getPriorityLabel = (priority) => {
    const options = {
      'LOW': 'Low',
      'MEDIUM': 'Medium',
      'HIGH': 'High'
    };
    return options[priority] || priority;
  };

  const handleToggleClick = (transaction) => {
    setTransactionToToggle(transaction);
    setConfirmToggleOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!transactionToToggle) return;
    
    try {
      const updatedTransaction = {
        ...transactionToToggle,
        isActive: !transactionToToggle.isActive
      };
      
      await transactionsApi.updateRecurringStatus(transactionToToggle.id, updatedTransaction.isActive);
      
      setRecurringTransactions(prev => 
        prev.map(t => t.id === transactionToToggle.id ? updatedTransaction : t)
      );
      
      toast({
        description: updatedTransaction.isActive 
          ? "Recurring transaction activated" 
          : "Recurring transaction paused",
      });
    } catch (error) {
      console.error('Error toggling recurrence status:', error);
      toast({
        variant: "destructive",
        description: "Failed to update recurring transaction status",
      });
    } finally {
      setConfirmToggleOpen(false);
      setTransactionToToggle(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Transactions
        </Button>
        <h2 className="text-2xl font-bold">Recurring Transactions</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : recurringTransactions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Repeat className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No recurring transactions</h3>
          <p className="mt-2 text-sm text-gray-500">
            You don't have any recurring transactions set up yet.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[180px]">Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Flexibility</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurringTransactions.map((transaction) => (
                <TableRow key={transaction.id} className={transaction.isActive ? '' : 'bg-gray-100 text-gray-500'}>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {transaction.category?.name || 'Uncategorized'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {Math.abs(transaction.amount).toFixed(2)}
                    </div>
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
                      <span>{getDateFlexibilityLabel(transaction.dateFlexibility, transaction)}</span>
                      
                      {transaction.dateFlexibility === 'CUSTOM_RANGE' && 
                        transaction.rangeStart && 
                        transaction.rangeEnd && (
                          <span className="ml-1 text-xs text-gray-500">
                            (Days {transaction.rangeStart}-{transaction.rangeEnd})
                          </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {transaction.startDate ? 
                      format(new Date(transaction.startDate), "MMM d, yyyy") :
                      "Not scheduled"}
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
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleClick(transaction)}
                      className={transaction.isActive 
                        ? "text-green-600 hover:text-green-800 hover:bg-green-50" 
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}
                    >
                      {transaction.isActive 
                        ? <ToggleRight className="h-4 w-4" /> 
                        : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmToggleOpen} onOpenChange={setConfirmToggleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {transactionToToggle?.isActive 
                ? "Pause Recurring Transaction" 
                : "Activate Recurring Transaction"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              {transactionToToggle?.isActive 
                ? "Are you sure you want to pause this recurring transaction?" 
                : "Are you sure you want to activate this recurring transaction?"}
            </p>
            {transactionToToggle && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{transactionToToggle.description}</p>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span className="mr-2">{formatCurrency(Math.abs(transactionToToggle.amount))}</span>
                  <span>•</span>
                  <span className="mx-2">{transactionToToggle.category?.name || 'Uncategorized'}</span>
                  <span>•</span>
                  <span className="ml-2">{getFrequencyLabel(transactionToToggle.frequency)}</span>
                </div>
              </div>
            )}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-700">
                {transactionToToggle?.isActive 
                  ? "Transaction will no longer recur automatically" 
                  : "Transaction will start recurring automatically"}
              </span>
              <Switch 
                checked={transactionToToggle?.isActive ? false : true}
                onCheckedChange={() => {}}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmToggleOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={transactionToToggle?.isActive ? "secondary" : "default"}
              onClick={handleConfirmToggle}
            >
              {transactionToToggle?.isActive ? "Pause Recurrence" : "Activate Recurrence"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecurringTransactionsList; 