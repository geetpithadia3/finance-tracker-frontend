import React, { useState } from 'react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Split, RefreshCw } from 'lucide-react';
import { transactionsApi } from '../../../api/transactions';
import { useToast } from "@/components/ui/use-toast";

const TransactionView = ({ transaction, onClose, onSplitStart, onShareStart, onRefresh }) => {
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
      setLocalTransaction(localTransaction); // Revert local state
      toast({
        variant: "destructive",
        description: "Couldn't update the refund status - try again? 🤔",
      });
    }
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
              <div>
                <div className="text-lg font-semibold">{localTransaction.description}</div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="mt-1">
                    {localTransaction.category.name}
                  </Badge>
                  {localTransaction.refunded && (
                    <Badge variant="outline" className="mt-1 bg-yellow-100 text-yellow-700 border-yellow-200">
                      Refunded
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-xl font-bold text-gray-700">
                ${Math.abs(localTransaction.amount).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={onSplitStart}
              disabled={localTransaction.refunded}
            >
              <Split className="h-6 w-6" />
              <div>
                <div className="font-medium">Split Transaction</div>
                <div className="text-xs text-gray-500">Divide into multiple categories</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={onShareStart}
              disabled={localTransaction.refunded}
            >
              <Share2 className="h-6 w-6" />
              <div>
                <div className="font-medium">Share Transaction</div>
                <div className="text-xs text-gray-500">Split with someone else</div>
              </div>
            </Button>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Transaction Details</h3>
            <dl className="divide-y divide-gray-100">
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {localTransaction.occurredOn}
                </dd>
              </div>
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {localTransaction.type}
                </dd>
              </div>
              <div className="px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium text-gray-500">Account</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {localTransaction.account}
                </dd>
              </div>
            </dl>
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