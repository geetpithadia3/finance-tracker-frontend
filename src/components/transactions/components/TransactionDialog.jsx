import React, { useState, useReducer, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { transactionsApi } from '../../../api/transactions';
import TransactionView from './TransactionView';
import SplitView from './SplitView';
import ShareView from './ShareView';
import { SplitContext } from '../../../context/SplitContext';
import { splitReducer } from '../../../reducers/splitReducer';
import { useSplitCalculations } from '../hooks/useSplitCalculations';
import { useToast } from "@/components/ui/use-toast";

export const TransactionDialog = ({ open, transaction, categories, onClose, onRefresh }) => {
  const { toast } = useToast();
  const [view, setView] = useState('details');
  const [state, dispatch] = useReducer(splitReducer, {
    splits: [],
    openSplitIndex: 0,
    step: 1
  });

  useEffect(() => {
    setView('details');
    dispatch({ type: 'RESET' });
  }, [open, transaction]);

  const calculations = useSplitCalculations(transaction, state.splits);

  const handleSplitStart = () => {
    dispatch({
      type: 'ADD_SPLIT',
      category: transaction?.category
    });
    setView('split');
  };
  const handleShareStart = () => setView('share');
  const handleBack = () => setView('details');

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <SplitContext.Provider value={{ state, dispatch, calculations }}>
          {view === 'details' && (
            <TransactionView
              transaction={transaction}
              onSplitStart={handleSplitStart}
              onShareStart={handleShareStart}
              onRefresh={onRefresh}
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
        </SplitContext.Provider>
      </DialogContent>
    </Dialog>
  );
}; 