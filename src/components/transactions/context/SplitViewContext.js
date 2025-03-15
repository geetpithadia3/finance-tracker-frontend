import { createContext, useContext } from 'react';

export const SplitViewContext = createContext(null);

export const useSplitViewContext = () => {
  const context = useContext(SplitViewContext);
  if (!context) {
    throw new Error('useSplitViewContext must be used within a SplitViewContext.Provider');
  }
  return context;
}; 