import React, { useState } from 'react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Split, RefreshCw, Repeat, Calendar } from 'lucide-react';
import { transactionsApi } from '../../../api/transactions';
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

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

  if (!localTransaction) return null;

  const handleRefund = async () => {
    try {
      const updatedTransaction = {
        ...localTransaction,
        refunded: !localTransaction.refunded,
      };
      
      setLocalTransaction(updatedTransaction);
      await transactionsApi.update([updatedTransaction]);
      await onRefresh();
      toast({
        description: updatedTransaction.refunded 
          ? "Transaction marked as refunded! 💸" 
          : "Refund removed - back to normal! 🔄",
      });
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
      <div className="p-6 flex-shrink-0">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">
              Transaction Details
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleRefund}
            >
              <RefreshCw className="h-4 w-4" />
              {localTransaction.refunded ? 'Remove Refund' : 'Mark as Refunded'}
            </Button>
          </div>
        </DialogHeader>
      </div>

      <div className="p-6 pt-2 flex-1">
        <div className="space-y-6">
          {/* Transaction Summary Card */}
          <div className={`bg-gray-50 p-4 rounded-lg border border-gray-100 
            ${localTransaction.refunded ? 'bg-yellow-50' : ''}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0 mr-4">
                <div className="text-lg font-semibold truncate">{localTransaction.description}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {format(new Date(localTransaction.occurredOn), "MMMM d, yyyy")}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="mt-1">
                    {localTransaction.category.name}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`mt-1 ${
                      localTransaction.type.toLowerCase() === 'credit'
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-red-100 text-red-700 border-red-200'
                    }`}
                  >
                    {localTransaction.type.charAt(0).toUpperCase() + localTransaction.type.slice(1).toLowerCase()}
                  </Badge>
                  {localTransaction.refunded && (
                    <Badge variant="outline" className="mt-1 bg-yellow-100 text-yellow-700 border-yellow-200">
                      Refunded
                    </Badge>
                  )}
                  {localTransaction.recurrence && (
                    <Badge variant="outline" className="mt-1 bg-blue-100 text-blue-700 border-blue-200">
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
              <div className="text-xl font-bold text-gray-700 whitespace-nowrap">
                ${Math.abs(localTransaction.amount).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 p-2"
              onClick={onSplitStart}
              disabled={localTransaction.refunded}
            >
              <Split className="h-6 w-6 flex-shrink-0" />
              <div className="w-full text-center">
                <div className="font-medium whitespace-normal text-sm">Split Transaction</div>
                <div className="text-xs text-gray-500 whitespace-normal">Divide into multiple categories</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2 p-2"
              onClick={onShareStart}
              disabled={localTransaction.refunded}
            >
              <Share2 className="h-6 w-6 flex-shrink-0" />
              <div className="w-full text-center">
                <div className="font-medium whitespace-normal text-sm">Share Transaction</div>
                <div className="text-xs text-gray-500 whitespace-normal">Split with someone else</div>
              </div>
            </Button>
            <Button
              variant={localTransaction.recurrence ? "secondary" : "outline"}
              className="h-24 flex-col gap-2 p-2"
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
          </div>
        </div>
      </div>

      <div className="p-6 border-t flex-shrink-0">
        <Button
          variant="outline"
          className="w-full h-10"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default TransactionView; 