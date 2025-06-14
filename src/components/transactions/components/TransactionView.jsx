import React, { useState } from 'react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Split, RefreshCw, Repeat, Calendar } from 'lucide-react';
import { transactionsApi } from '../../../api/transactions';
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const TransactionView = ({ 
  transaction, 
  onClose, 
  onSplitStart, 
  onShareStart, 
  onRecurrenceStart,
  onRefresh
}) => {
  const { toast } = useToast();
  const [localTransaction, setLocalTransaction] = useState(transaction);
  const [refundAlertOpen, setRefundAlertOpen] = useState(false);

  if (!localTransaction) return null;

  const handleRefund = async () => {
    try {
      // Create updated transaction with refund toggled
      const willBeRefunded = !localTransaction.refunded;
      const hasRecurrence = localTransaction.recurrence !== null && localTransaction.recurrence !== undefined;
      
      const updatedTransaction = {
        ...localTransaction,
        refunded: willBeRefunded,
      };
      
      // Show special toast message if refunding a recurring transaction
      setLocalTransaction(updatedTransaction);
      await transactionsApi.update([updatedTransaction]);
      await onRefresh();
      
      if (willBeRefunded && hasRecurrence) {
        toast({
          description: "Transaction marked as refunded and recurring schedule removed! 💸",
        });
      } else {
        toast({
          description: updatedTransaction.refunded 
            ? "Transaction marked as refunded! 💸" 
            : "Refund removed - back to normal! 🔄",
        });
      }
    } catch (error) {
      setLocalTransaction(localTransaction);
      toast({
        variant: "destructive",
        description: "Couldn't update the refund status - try again? 🤔",
      });
    }
  };

  // Helper function to get a readable frequency label
  const getFrequencyLabel = (frequency) => {
    const options = {
      'DAILY': 'Daily',
      'WEEKLY': 'Weekly',
      'BIWEEKLY': 'Bi-weekly',
      'FOUR_WEEKLY': 'Every 4 weeks',
      'MONTHLY': 'Monthly',
      'YEARLY': 'Yearly'
    };
    return options[frequency] || frequency;
  };

  // Helper function to get a readable date flexibility label
  const getDateFlexibilityLabel = (flexibility, recurrence) => {
    if (!flexibility) return 'Exact date';
    
    switch (flexibility) {
      case 'EXACT':
        if (recurrence.frequency === 'WEEKLY' && recurrence.preference) {
          const days = {
            'MONDAY': 'Monday',
            'TUESDAY': 'Tuesday',
            'WEDNESDAY': 'Wednesday',
            'THURSDAY': 'Thursday',
            'FRIDAY': 'Friday',
            'SATURDAY': 'Saturday',
            'SUNDAY': 'Sunday'
          };
          return `Every ${days[recurrence.preference]}`;
        }
        return 'Exact date';
      case 'EARLY_MONTH': return 'Early month (1st-10th)';
      case 'MID_MONTH': return 'Mid month (11th-20th)';
      case 'LATE_MONTH': return 'Late month (21st-31st)';
      case 'CUSTOM_RANGE': return 'Custom day range';
      case 'WEEKDAY': return 'Weekdays only (Mon-Fri)';
      case 'WEEKEND': return 'Weekends only (Sat-Sun)';
      case 'MONTH_RANGE': return 'Month range';
      case 'SEASON': 
        const seasons = {
          'SPRING': 'Spring (Mar-May)',
          'SUMMER': 'Summer (Jun-Aug)',
          'FALL': 'Fall (Sep-Nov)',
          'WINTER': 'Winter (Dec-Feb)'
        };
        return seasons[recurrence.preference] || 'Seasonal';
      default: return flexibility;
    }
  };

  // Helper function to get month name
  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(monthNumber) - 1];
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 sm:p-6 flex-shrink-0 w-full max-w-full">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
            <DialogTitle className="text-lg sm:text-xl font-semibold">
              Transaction Details
            </DialogTitle>
            {localTransaction.refunded ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10"
                onClick={handleRefund}
              >
                <RefreshCw className="h-4 w-4" />
                Remove Refund
              </Button>
            ) : (
              <AlertDialog open={refundAlertOpen} onOpenChange={setRefundAlertOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-10">
                    <RefreshCw className="h-4 w-4" />
                    Mark as Refunded
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[98vw] sm:max-w-md p-2 sm:p-6">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Mark as Refunded?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {localTransaction.recurrence 
                        ? "This will mark the transaction as refunded and remove any recurring schedule."
                        : "This will mark the transaction as refunded."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                      handleRefund();
                      setRefundAlertOpen(false);
                    }}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </DialogHeader>
      </div>

      <div className="p-2 sm:p-6 pt-2 flex-1 w-full max-w-full overflow-x-hidden">
        <div className="space-y-3 sm:space-y-6 w-full max-w-full">
          {/* Transaction Summary Card */}
          <Card className={localTransaction.refunded ? "bg-yellow-50 w-full max-w-full" : "w-full max-w-full"}>
            <CardContent className="p-2 sm:p-4 w-full max-w-full">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="text-base sm:text-lg font-semibold truncate">{localTransaction.description}</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1">
                    {format(new Date(localTransaction.occurredOn), "MMMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <Badge variant="outline" className="mt-1 text-xs sm:text-sm px-2 py-0.5">
                      {localTransaction.category.name}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`mt-1 text-xs sm:text-sm px-2 py-0.5 ${
                        localTransaction.type.toLowerCase() === 'credit'
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}
                    >
                      {localTransaction.type.charAt(0).toUpperCase() + localTransaction.type.slice(1).toLowerCase()}
                    </Badge>
                    {localTransaction.refunded && (
                      <Badge variant="outline" className="mt-1 text-xs sm:text-sm px-2 py-0.5 bg-yellow-100 text-yellow-700 border-yellow-200">
                        Refunded
                      </Badge>
                    )}
                    {localTransaction.recurrence && (
                      <Badge variant="outline" className="mt-1 text-xs sm:text-sm px-2 py-0.5 bg-blue-100 text-blue-700 border-blue-200">
                        {getFrequencyLabel(localTransaction.recurrence.frequency)} Recurring
                      </Badge>
                    )}
                  </div>
                  {localTransaction.recurrence && (
                    <div className="text-sm text-blue-600 mt-2 flex flex-col">
                      <div className="flex items-center">
                        <Repeat className="h-3 w-3 mr-1" />
                        {getFrequencyLabel(localTransaction.recurrence.frequency)} recurring
                      </div>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {getDateFlexibilityLabel(localTransaction.recurrence.dateFlexibility, localTransaction.recurrence)}
                        
                        {/* Show appropriate range details based on flexibility type */}
                        {localTransaction.recurrence.dateFlexibility === 'CUSTOM_RANGE' && 
                          localTransaction.recurrence.rangeStart && 
                          localTransaction.recurrence.rangeEnd && (
                            <span className="ml-1">
                              (Days {localTransaction.recurrence.rangeStart}-{localTransaction.recurrence.rangeEnd})
                            </span>
                        )}
                        
                        {localTransaction.recurrence.dateFlexibility === 'MONTH_RANGE' && 
                          localTransaction.recurrence.rangeStart && 
                          localTransaction.recurrence.rangeEnd && (
                            <span className="ml-1">
                              (Months {getMonthName(localTransaction.recurrence.rangeStart)}-
                              {getMonthName(localTransaction.recurrence.rangeEnd)})
                            </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-base sm:text-xl font-bold text-gray-700 whitespace-nowrap">
                  ${Math.abs(localTransaction.amount).toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile: compact vertical action list */}
          <div className="flex flex-col gap-1 sm:hidden mt-2">
            <Button variant="ghost" className="justify-start text-left text-xs py-2 px-2" onClick={onSplitStart} disabled={localTransaction.refunded}>
              <Split className="h-4 w-4 mr-2" /> Split Transaction
            </Button>
            <Button variant="ghost" className="justify-start text-left text-xs py-2 px-2" onClick={onShareStart} disabled={localTransaction.refunded}>
              <Share2 className="h-4 w-4 mr-2" /> Share Transaction
            </Button>
            <Button variant="ghost" className="justify-start text-left text-xs py-2 px-2" onClick={onRecurrenceStart} disabled={localTransaction.refunded}>
              <Repeat className="h-4 w-4 mr-2" /> {localTransaction.recurrence ? "Edit Recurring" : "Make Recurring"}
            </Button>
          </div>
          {/* Desktop: keep grid */}
          <div className="hidden sm:grid grid-cols-3 gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2 p-2 text-sm"
                    onClick={onSplitStart}
                    disabled={localTransaction.refunded}
                  >
                    <Split className="h-6 w-6 flex-shrink-0" />
                    <div className="w-full text-center">
                      <div className="font-medium whitespace-normal text-sm">Split Transaction</div>
                      <div className="text-xs text-gray-500 whitespace-normal">Divide into multiple categories</div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Divide this transaction into multiple categories</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2 p-2 text-sm"
                    onClick={onShareStart}
                    disabled={localTransaction.refunded}
                  >
                    <Share2 className="h-6 w-6 flex-shrink-0" />
                    <div className="w-full text-center">
                      <div className="font-medium whitespace-normal text-sm">Share Transaction</div>
                      <div className="text-xs text-gray-500 whitespace-normal">Split with someone else</div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share this transaction with others</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={localTransaction.recurrence ? "secondary" : "outline"}
                    className="h-24 flex-col gap-2 p-2 text-sm"
                    onClick={onRecurrenceStart}
                    disabled={localTransaction.refunded}
                  >
                    <Repeat className="h-6 w-6 flex-shrink-0" />
                    <div className="w-full text-center">
                      <div className="font-medium whitespace-normal text-sm">
                        {localTransaction.recurrence ? "Edit Recurring" : "Make Recurring"}
                      </div>
                      <div className="text-xs text-gray-500 whitespace-normal">
                        {localTransaction.recurrence ? "Update schedule" : "Schedule future transactions"}
                      </div>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{localTransaction.recurrence ? "Edit recurring schedule" : "Set up recurring schedule"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <Separator className="mt-4" />
      <div className="p-2 sm:p-6 flex-shrink-0 w-full max-w-full">
        <Button
          variant="outline"
          className="w-full h-9 sm:h-10 text-xs sm:text-base max-w-full"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default TransactionView; 