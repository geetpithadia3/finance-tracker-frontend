import React, { useState } from 'react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Split, RefreshCw, Repeat, Calendar } from 'lucide-react';
import { transactionsApi } from '../../../../api/transactions';
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
import { 
  getFrequencyLabel, 
  getDateFlexibilityLabel, 
  getMonthName,
  getTransactionTypeColor 
} from '../../utils/transactionHelpers';

const TransactionDetailsView = ({ 
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
      const willBeRefunded = !localTransaction.refunded;
      const hasRecurrence = localTransaction.recurrence !== null && localTransaction.recurrence !== undefined;
      
      const updatedTransaction = {
        ...localTransaction,
        refunded: willBeRefunded,
        personalShare: localTransaction.personalShare,
        owedShare: localTransaction.owedShare,
        shareMetadata: localTransaction.shareMetadata,
        recurrence: willBeRefunded ? null : localTransaction.recurrence,
      };
      
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

  const ActionButton = ({ onClick, icon: Icon, title, description, variant = "outline", disabled = false }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            className="h-auto min-h-[100px] flex-col gap-2 p-3 text-sm"
            onClick={onClick}
            disabled={disabled}
          >
            <Icon className="h-6 w-6 flex-shrink-0" />
            <div className="w-full text-center space-y-1">
              <div className="font-medium text-sm leading-tight">{title}</div>
              <div className="text-xs text-gray-500 leading-tight">{description}</div>
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const MobileActionButton = ({ onClick, icon: Icon, title, disabled = false }) => (
    <Button 
      variant="ghost" 
      className="justify-start text-left text-xs py-2 px-2" 
      onClick={onClick} 
      disabled={disabled}
    >
      <Icon className="h-4 w-4 mr-2" /> {title}
    </Button>
  );

  const RecurrenceInfo = ({ recurrence }) => (
    <div className="text-sm text-blue-600 mt-2 flex flex-col">
      <div className="flex items-center">
        <Repeat className="h-3 w-3 mr-1" />
        {getFrequencyLabel(recurrence.frequency)} recurring
      </div>
      <div className="flex items-center mt-1">
        <Calendar className="h-3 w-3 mr-1" />
        {getDateFlexibilityLabel(recurrence.dateFlexibility, recurrence)}
        
        {recurrence.dateFlexibility === 'CUSTOM_RANGE' && 
          recurrence.rangeStart && 
          recurrence.rangeEnd && (
            <span className="ml-1">
              (Days {recurrence.rangeStart}-{recurrence.rangeEnd})
            </span>
        )}
        
        {recurrence.dateFlexibility === 'MONTH_RANGE' && 
          recurrence.rangeStart && 
          recurrence.rangeEnd && (
            <span className="ml-1">
              (Months {getMonthName(recurrence.rangeStart)}-
              {getMonthName(recurrence.rangeEnd)})
            </span>
        )}
      </div>
    </div>
  );

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
                <AlertDialogContent className="max-w-md p-4 sm:p-6">
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
                    {localTransaction.category && (
                      <Badge variant="outline" className="mt-1 text-xs sm:text-sm px-2 py-0.5">
                        {localTransaction.category.name}
                      </Badge>
                    )}
                    <Badge 
                      variant="outline" 
                      className={`mt-1 text-xs sm:text-sm px-2 py-0.5 ${getTransactionTypeColor(localTransaction.type)}`}
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
                    <RecurrenceInfo recurrence={localTransaction.recurrence} />
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
            <MobileActionButton 
              onClick={onSplitStart} 
              icon={Split} 
              title="Split Transaction" 
              disabled={localTransaction.refunded}
            />
            <MobileActionButton 
              onClick={onShareStart} 
              icon={Share2} 
              title="Share Transaction" 
              disabled={localTransaction.refunded}
            />
            <MobileActionButton 
              onClick={onRecurrenceStart} 
              icon={Repeat} 
              title={localTransaction.recurrence ? "Edit Recurring" : "Make Recurring"} 
              disabled={localTransaction.refunded}
            />
          </div>
          
          {/* Desktop: responsive grid */}
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <ActionButton
              onClick={onSplitStart}
              icon={Split}
              title="Split Transaction"
              description="Divide into multiple categories"
              disabled={localTransaction.refunded}
            />
            <ActionButton
              onClick={onShareStart}
              icon={Share2}
              title="Share Transaction"
              description="Split with someone else"
              disabled={localTransaction.refunded}
            />
            <ActionButton
              onClick={onRecurrenceStart}
              icon={Repeat}
              title={localTransaction.recurrence ? "Edit Recurring" : "Make Recurring"}
              description={localTransaction.recurrence ? "Update schedule" : "Set up recurring payments"}
              variant={localTransaction.recurrence ? "secondary" : "outline"}
              disabled={localTransaction.refunded}
            />
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

export default TransactionDetailsView;