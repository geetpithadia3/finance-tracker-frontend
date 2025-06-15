import { useState, useReducer, useEffect } from 'react';
import { splitReducer } from '../reducers/splitReducer';
import { useSplitCalculations } from '../components/transactions/hooks/useSplitCalculations';

export const useTransactionManager = (transaction, onSplitSave, onShareSave, onClose) => {
  const [isSplitView, setIsSplitView] = useState(false);
  const [isShareView, setIsShareView] = useState(false);
  const [state, dispatch] = useReducer(splitReducer, {
    splits: [],
    openSplitIndex: 0,
    step: 1
  });

  const calculations = useSplitCalculations(transaction, state.splits);

  useEffect(() => {
    dispatch({ type: 'RESET' });
    setIsSplitView(false);
    setIsShareView(false);
  }, [transaction]);

  const handleSplitStart = () => {
    dispatch({
      type: 'ADD_SPLIT',
      category: transaction.category
    });
    setIsSplitView(true);
  };

  const handleSplitSave = () => {
    onSplitSave(
      { amount: calculations.remainingAmount },
      state.splits
    );
  };

  const handleShareStart = () => {
    setIsShareView(true);
  };

  const handleShareSave = (shareData) => {
    onShareSave(shareData);
    setIsShareView(false);
  };

  return {
    isSplitView,
    isShareView,
    state,
    dispatch,
    calculations,
    handleSplitStart,
    handleSplitSave,
    handleShareStart,
    handleShareSave,
    setIsSplitView,
    setIsShareView
  };
}; 