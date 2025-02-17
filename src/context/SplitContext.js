import { createContext, useContext } from 'react';

export const SplitContext = createContext(null);

export const useSplitContext = () => {
  const context = useContext(SplitContext);
  if (!context) {
    throw new Error('useSplitContext must be used within a SplitContext.Provider');
  }
  return context;
}; 