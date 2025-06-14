import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { transactionsApi } from '../../../api/transactions';
import { TransactionDetailsView } from './views';
import SplitView from './SplitView';
import ShareView from './ShareView';
import { RecurrenceView } from './RecurrenceView';

export const TransactionDialog = ({ open, transaction, categories, onClose, onRefresh }) => {
  const { toast } = useToast();
  const [view, setView] = useState('details');

  const handleBack = () => {
    setView('details');
  };

  const handleClose = (isOpen) => {
    setView('details');
    onClose();
  };

  const handleSplitStart = () => {
    setView('split');
  };

  const handleShareStart = () => {
    setView('share');
  };

  const handleRecurrenceStart = () => {
    setView('recurrence');
  };

  const handleSplitSave = async (remainingTransaction, splits) => {
    try {
      const parentUpdate = {
        ...transaction,
        ...remainingTransaction,
        amount: remainingTransaction.amount,
        category: remainingTransaction.category || transaction.category,
        categoryId: remainingTransaction.categoryId || transaction.category.id
      };

      await transactionsApi.updateParentAndCreateSplits(
        transaction,
        parentUpdate,
        splits
      );
      await onRefresh();
      onClose();
      toast({
        description: "Split saved! Your transaction is now in pieces 🧩",
      });
    } catch (error) {
      console.error('Error saving split:', error);
      toast({
        variant: "destructive",
        description: "Oops! Couldn't split that transaction 😅",
      });
    }
  };

  const handleShareSave = async (shareData) => {
    try {
      const updatedTransaction = {
        ...transaction,
        personalShare: shareData.personalShare,
        owedShare: shareData.owedShare,
        shareMetadata: shareData.metadata
      };
      
      await transactionsApi.update([updatedTransaction]);
      await onRefresh();
      onClose();
      toast({
        description: "Share saved! Time to collect from your friends 💰",
      });
    } catch (error) {
      console.error('Error saving share:', error);
      toast({
        variant: "destructive",
        description: "Sharing failed - maybe keep this one to yourself 😅",
      });
    }
  };

  const handleRecurrenceSave = async (updatedTransaction) => {
    try {
      // If recurrence exists in the updated transaction
      if (updatedTransaction.recurrence) {
        // Create a properly formatted recurrence object with generic fields
        const recurrenceData = {
          id: updatedTransaction.recurrence.id, // Include the ID if it exists
          frequency: updatedTransaction.recurrence.frequency,
          startDate: transaction.occurredOn, // Use the original transaction date as start date
          dateFlexibility: updatedTransaction.recurrence.dateFlexibility || 'EXACT',
          
          // Use generic fields for all types of ranges and preferences
          rangeStart: updatedTransaction.recurrence.rangeStart || null,
          rangeEnd: updatedTransaction.recurrence.rangeEnd || null,
          preference: updatedTransaction.recurrence.preference || null
        };
        
        // Update the transaction with the recurrence data
        await transactionsApi.update([{
          ...updatedTransaction,
          recurrence: recurrenceData
        }]);
      } else {
        // If recurrence is being removed
        await transactionsApi.update([updatedTransaction]);
      }
      
      await onRefresh();
      onClose();
      toast({
        description: updatedTransaction.recurrence 
          ? (transaction.recurrence 
              ? "Recurrence updated! Your schedule has been adjusted 🔄" 
              : "Recurrence set! This transaction will keep coming back 🔄")
          : "Recurrence removed! This is now a one-time transaction ✓",
      });
    } catch (error) {
      console.error('Error saving recurrence:', error);
      toast({
        variant: "destructive",
        description: "Couldn't set up the recurrence - try again? 🤔",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 sm:p-6">
        {view === 'details' && (
          <TransactionDetailsView
            transaction={transaction}
            onSplitStart={handleSplitStart}
            onShareStart={handleShareStart}
            onRecurrenceStart={handleRecurrenceStart}
            onRefresh={onRefresh}
            onClose={handleClose}
          />
        )}

        {view === 'split' && transaction && (
          <SplitView
            transaction={transaction}
            categories={categories}
            onSave={handleSplitSave}
            onCancel={handleBack}
          />
        )}

        {view === 'share' && transaction && (
          <ShareView
            transaction={transaction}
            onSave={handleShareSave}
            onCancel={handleBack}
          />
        )}

        {view === 'recurrence' && transaction && (
          <RecurrenceView
            transaction={transaction}
            onSave={handleRecurrenceSave}
            onCancel={handleBack}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDialog; 