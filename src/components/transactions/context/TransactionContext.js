import React, { createContext, useContext, useReducer } from 'react';

const TransactionContext = createContext();

// Transaction context state reducer
const transactionReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.transactions };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.categories };
    case 'SET_SELECTED_TRANSACTION':
      return { ...state, selectedTransaction: action.transaction };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_EDIT_MODE':
      return { ...state, editMode: action.editMode };
    case 'SET_MODAL_STATE':
      return { 
        ...state, 
        transactionModalOpen: action.open,
        selectedTransaction: action.open ? state.selectedTransaction : null
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t.key === action.transaction.key ? { ...t, ...action.updates, modified: true } : t
        )
      };
    case 'SET_SORT_CONFIG':
      return { ...state, sortConfig: action.sortConfig };
    default:
      return state;
  }
};

const initialState = {
  transactions: [],
  categories: [],
  selectedTransaction: null,
  isLoading: false,
  error: null,
  editMode: false,
  transactionModalOpen: false,
  sortConfig: { key: 'date', direction: 'ascending' }
};

export const TransactionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);

  const setTransactions = (transactions) => 
    dispatch({ type: 'SET_TRANSACTIONS', transactions });
  
  const setCategories = (categories) => 
    dispatch({ type: 'SET_CATEGORIES', categories });
  
  const setSelectedTransaction = (transaction) => 
    dispatch({ type: 'SET_SELECTED_TRANSACTION', transaction });
  
  const setLoading = (isLoading) => 
    dispatch({ type: 'SET_LOADING', isLoading });
  
  const setError = (error) => 
    dispatch({ type: 'SET_ERROR', error });
  
  const setEditMode = (editMode) => 
    dispatch({ type: 'SET_EDIT_MODE', editMode });
  
  const setModalOpen = (open) => 
    dispatch({ type: 'SET_MODAL_STATE', open });
  
  const updateTransaction = (transaction, updates) => 
    dispatch({ type: 'UPDATE_TRANSACTION', transaction, updates });
  
  const setSortConfig = (sortConfig) => 
    dispatch({ type: 'SET_SORT_CONFIG', sortConfig });

  const value = {
    ...state,
    setTransactions,
    setCategories,
    setSelectedTransaction,
    setLoading,
    setError,
    setEditMode,
    setModalOpen,
    updateTransaction,
    setSortConfig
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactionContext must be used within TransactionProvider');
  }
  return context;
};