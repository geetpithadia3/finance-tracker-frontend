import React, { useState } from 'react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Split, RefreshCw, Repeat, Calendar, DollarSign, Tag, CalendarDays } from 'lucide-react';
import { transactionsApi } from '../../../../api/transactions';
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
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
          description: "Transaction marked as refunded and recurring schedule removed.",
        });
      } else {
        toast({
          description: updatedTransaction.refunded 
            ? "Transaction marked as refunded." 
            : "Refund status removed.",
        });
      }
    } catch (error) {
      setLocalTransaction(localTransaction);
      toast({
        variant: "destructive",
        description: "Unable to update refund status. Please try again.",
      });
    }
  };

  const ActionButton = ({ onClick, icon: Icon, title, description, variant = "outline", disabled = false }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            className="h-auto min-h-[120px] flex-col gap-3 p-4 text-sm transition-all duration-200 hover:shadow-md"
            onClick={onClick}
            disabled={disabled}
          >
            <Icon className="h-8 w-8 flex-shrink-0" />
            <div className="w-full text-center space-y-2">
              <div className="font-semibold text-sm leading-tight">{title}</div>
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
      className="justify-start text-left text-sm py-3 px-4 hover:bg-gray-50 transition-colors" 
      onClick={onClick} 
      disabled={disabled}
    >
      <Icon className="h-5 w-5 mr-3" /> {title}
    </Button>
  );

  const RecurrenceInfo = ({ recurrence }) => (
    <div className="text-sm text-blue-600 mt-3 flex flex-col space-y-2">
      <div className="flex items-center">
        <Repeat className="h-4 w-4 mr-2" />
        <span className="font-medium">{getFrequencyLabel(recurrence.frequency)} recurring</span>
      </div>
      <div className="flex items-center">
        <Calendar className="h-4 w-4 mr-2" />
        <span>{getDateFlexibilityLabel(recurrence.dateFlexibility, recurrence)}</span>
        
        {recurrence.dateFlexibility === 'CUSTOM_RANGE' && 
          recurrence.rangeStart && 
          recurrence.rangeEnd && (
            <span className="ml-2 text-gray-500">
              (Days {recurrence.rangeStart}-{recurrence.rangeEnd})
            </span>
        )}
        
        {recurrence.dateFlexibility === 'MONTH_RANGE' && 
          recurrence.rangeStart && 
          recurrence.rangeEnd && (
            <span className="ml-2 text-gray-500">
              (Months {getMonthName(recurrence.rangeStart)}-
              {getMonthName(recurrence.rangeEnd)})
            </span>
        )}
      </div>
    </div>
  );

  const TransactionSummary = () => (
    <Card className={`${localTransaction.refunded ? "bg-yellow-50 border-yellow-200" : "bg-white border-gray-200"} shadow-sm`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 mr-6">
            <div className="text-xl font-semibold text-gray-900 mb-2">{localTransaction.description}</div>
            
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <CalendarDays className="h-4 w-4 mr-2" />
              {format(new Date(localTransaction.occurredOn), "MMMM d, yyyy")}
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {localTransaction.category && (
                <Badge variant="outline" className="text-sm px-3 py-1 bg-gray-50">
                  <Tag className="h-3 w-3 mr-1" />
                  {localTransaction.category.name}
                </Badge>
              )}
              <Badge 
                variant="outline" 
                className={`text-sm px-3 py-1 ${getTransactionTypeColor(localTransaction.type)}`}
              >
                {localTransaction.type.charAt(0).toUpperCase() + localTransaction.type.slice(1).toLowerCase()}
              </Badge>
              {localTransaction.refunded && (
                <Badge variant="outline" className="text-sm px-3 py-1 bg-yellow-100 text-yellow-700 border-yellow-200">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refunded
                </Badge>
              )}
              {localTransaction.recurrence && (
                <Badge variant="outline" className="text-sm px-3 py-1 bg-blue-100 text-blue-700 border-blue-200">
                  <Repeat className="h-3 w-3 mr-1" />
                  {getFrequencyLabel(localTransaction.recurrence.frequency)} Recurring
                </Badge>
              )}
            </div>
            
            {localTransaction.recurrence && (
              <RecurrenceInfo recurrence={localTransaction.recurrence} />
            )}
          </div>
          
          <div className="text-2xl font-bold text-gray-900 whitespace-nowrap">
            <DollarSign className="h-6 w-6 inline mr-1" />
            {Math.abs(localTransaction.amount).toFixed(2)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const RefundButton = () => (
    <div className="flex justify-end">
      {localTransaction.refunded ? (
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-sm h-10 px-4"
          onClick={handleRefund}
        >
          <RefreshCw className="h-4 w-4" />
          Remove Refund
        </Button>
      ) : (
        <AlertDialog open={refundAlertOpen} onOpenChange={setRefundAlertOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 text-sm h-10 px-4">
              <RefreshCw className="h-4 w-4" />
              Mark as Refunded
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md">
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
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 flex-shrink-0 border-b border-gray-200">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Transaction Details
            </DialogTitle>
            <RefundButton />
          </div>
        </DialogHeader>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-6 max-w-4xl">
          {/* Transaction Summary */}
          <TransactionSummary />

          {/* Mobile Action Buttons */}
          <div className="flex flex-col gap-1 sm:hidden">
            <div className="text-sm font-semibold text-gray-700 mb-2">Actions</div>
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
          
          {/* Desktop Action Grid */}
          <div className="hidden sm:block">
            <div className="text-lg font-semibold text-gray-900 mb-4">Actions</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      {/* Footer */}
      <div className="p-6 flex-shrink-0 border-t border-gray-200">
        <Button
          variant="outline"
          className="w-full h-12 text-base font-medium"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default TransactionDetailsView;