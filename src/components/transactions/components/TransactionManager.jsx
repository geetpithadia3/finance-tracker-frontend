import React from 'react';
import { useTransactionManager } from '../hooks/useTransactionManager';
import SplitView from './SplitView';
import ShareView  from './ShareView';
import { SplitContext } from '../../../context/SplitContext';
import TransactionView from './TransactionView';

const TransactionManager = ({ transaction, onSplitSave, onShareSave, categories = [], onClose }) => {
  const {
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
  } = useTransactionManager(transaction, onSplitSave, onShareSave, onClose);

  if (!transaction) return null;

  return (
    <SplitContext.Provider value={{ state, dispatch, calculations }}>
      {isShareView ? (
        <ShareView
          transaction={transaction}
          onSave={handleShareSave}
          onCancel={() => setIsShareView(false)}
        />
      ) : isSplitView ? (
        <SplitView
          transaction={transaction}
          onSave={handleSplitSave}
          onCancel={() => setIsSplitView(false)}
          categories={categories}
        />
      ) : (
        <TransactionView
          transaction={transaction}
          onClose={onClose}
          onSplitStart={handleSplitStart}
          onShareStart={handleShareStart}
        />
      )}
    </SplitContext.Provider>
  );
};

export default TransactionManager;