import { useState, useReducer, useEffect } from 'react';
import { splitReducer } from '../../../reducers/splitReducer';
import { useSplitCalculations } from './useSplitCalculations';

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
      {
        id: transaction.id,
        amount: calculations.remainingAmount,
        description: transaction.description,
        categoryId: transaction.category.id,
        occurredOn: transaction.occurredOn,
        account: transaction.account,
        type: transaction.type,
        category: transaction.category
      },
      state.splits.map(split => ({
        ...split,
        type: transaction.type,
        account: transaction.account,
        occurredOn: transaction.occurredOn
      }))
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