import React, { useState, useEffect, createContext, useContext, useReducer, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Plus, MinusCircle, ChevronDown, ChevronUp, ArrowRight, Scissors, ShareIcon, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { transactionsApi } from "@/api/transactions";
import { toast } from "@/components/ui/use-toast";
import ShareView from './ShareView';

const splitReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_SPLIT':
      return {
        ...state,
        splits: [...state.splits, { amount: '', description: '', category: action.category }],
        openSplitIndex: state.splits.length
      };
    case 'UPDATE_SPLIT':
      return {
        ...state,
        splits: state.splits.map((split, i) => 
          i === action.index ? { ...split, [action.field]: action.value } : split
        )
      };
    case 'REMOVE_SPLIT':
      return {
        ...state,
        splits: state.splits.filter((_, i) => i !== action.index),
        openSplitIndex: state.openSplitIndex === action.index 
          ? Math.max(0, action.index - 1) 
          : state.openSplitIndex
      };
    case 'SET_OPEN_INDEX':
      return { ...state, openSplitIndex: action.index };
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'RESET':
      return { splits: [], openSplitIndex: 0, step: 1 };
    default:
      return state;
  }
};

const SplitContext = createContext(null);

const useSplitContext = () => {
  const context = useContext(SplitContext);
  if (!context) throw new Error('useSplitContext must be used within SplitProvider');
  return context;
};

const useSplitCalculations = (transaction, splits) => {
  return useMemo(() => ({
    remainingAmount: transaction?.amount - splits.reduce((sum, split) => 
      sum + (parseFloat(split.amount) || 0), 0) || 0,
    totalSplitAmount: splits.reduce((sum, split) => 
      sum + (parseFloat(split.amount) || 0), 0),
    isValid: splits.length > 0 && splits.every(split => 
      parseFloat(split.amount) > 0 && split.category
    )
  }), [transaction?.amount, splits]);
};

const SplitItem = ({ split, index, categories }) => {
  const { dispatch, state: { openSplitIndex } } = useSplitContext();
  const isOpen = openSplitIndex === index;
  
  const handleAmountChange = (value) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      dispatch({ type: 'UPDATE_SPLIT', index, field: 'amount', value });
    }
  };

  return (
    <div className="border rounded-lg">
      <div className="p-3 flex items-center justify-between">
        <button
          className="flex items-center gap-2 hover:text-blue-600"
          onClick={() => dispatch({ 
            type: 'SET_OPEN_INDEX', 
            index: isOpen ? -1 : index 
          })}
        >
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          <span className="text-sm font-medium">
            Split {index + 1} 
            {split.amount && ` - $${parseFloat(split.amount).toFixed(2)}`}
          </span>
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => dispatch({ type: 'REMOVE_SPLIT', index })}
        >
          <MinusCircle className="h-4 w-4" />
        </Button>
      </div>

      {isOpen && (
        <div className="px-3 pb-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="text"
              value={split.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="Amount"
              className="h-8"
            />
            
            <Select
              value={split.category.name}
              onValueChange={(value) => dispatch({
                type: 'UPDATE_SPLIT',
                index,
                field: 'category',
                value: categories.find(c => c.name === value)
              })}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="col-span-2">
              <Input
                value={split.description || ''}
                onChange={(e) => dispatch({
                  type: 'UPDATE_SPLIT',
                  index,
                  field: 'description',
                  value: e.target.value
                })}
                placeholder="Description (optional)"
                className="h-8"
                maxLength={100}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SplitEntryStep = ({ transaction, categories }) => {
  const { state: { splits }, dispatch, calculations } = useSplitContext();
  
  return (
    <div className="space-y-6">
      {/* Transaction Info Card */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-base font-semibold">{transaction.description}</div>
            <Badge variant="outline" className="mt-1 text-xs">
              {transaction.category.name}
            </Badge>
          </div>
          <div className="text-xl font-bold text-blue-700">
            ${Math.abs(transaction.amount).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Split List Section */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-500">Split Transactions</div>
        <div className="border rounded-lg">
          <ScrollArea className="h-[240px]">
            <div className="p-4 space-y-3">
              {splits.map((split, index) => (
                <SplitItem 
                  key={index} 
                  split={split} 
                  index={index} 
                  categories={categories} 
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        <Button 
          variant="outline" 
          className="w-full h-9 text-sm"
          onClick={() => dispatch({ 
            type: 'ADD_SPLIT', 
            category: transaction.category 
          })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Split
        </Button>
      </div>

      {/* Summary Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
          <span className="text-gray-600">Remaining Amount:</span>
          <span className="font-medium">
            ${calculations.remainingAmount.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg text-sm border border-blue-100">
          <span className="text-gray-600">Total Split Amount:</span>
          <span className="font-medium">
            ${calculations.totalSplitAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

const SummaryStep = ({ transaction }) => {
  const { state: { splits }, calculations } = useSplitContext();
  
  const finalTransactions = [
    {
      ...transaction,
      amount: calculations.remainingAmount,
      isParent: true
    },
    ...splits.map((split, index) => ({
      ...split,
      type: transaction.type,
      occurredOn: transaction.occurredOn,
      amount: parseFloat(split.amount) || 0,
      isSplit: true,
      splitIndex: index + 1
    }))
  ].filter(t => t.amount > 0);

  return (
    <div className="space-y-6">
      <div className="text-sm font-medium uppercase text-gray-500">
        Final Transactions
      </div>
      
      <div className="border rounded-lg">
        <ScrollArea className="h-[320px]">
          <div className="p-4 space-y-3">
            {finalTransactions.map((t, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${
                  t.isParent 
                    ? 'bg-blue-50 border-blue-100' 
                    : 'bg-green-50 border-green-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium">
                      {t.isParent ? 'Parent Transaction' : `Split ${t.splitIndex}`}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {t.description || transaction.description}
                    </div>
                    <Badge 
                      variant="outline" 
                      className="mt-2 text-xs"
                    >
                      {t.category.name}
                    </Badge>
                  </div>
                  <div className="text-base font-bold">
                    ${t.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm">
        <span className="text-gray-600">Total Amount:</span>
        <span className="font-medium">
          ${transaction.amount.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

const TransactionView = ({ transaction, onClose, onSplitStart, onShareStart }) => {
  const isDebit = transaction.type.toLowerCase() === 'debit';
  const amountColor = isDebit ? 'text-red-600' : 'text-green-600';

  const handleMarkAsRefunded = async () => {
    try {
      await transactionsApi.update([{
        ...transaction,
        refunded: !transaction.refunded,
      }]);
      transaction.refunded = !transaction.refunded;
      toast({
        title: transaction.refunded ? "Refund Recorded! 💫" : "Refund Removed! 🔄",
        description: transaction.refunded 
          ? "Ka-ching! This transaction is now marked as refunded" 
          : "Back to its original state - no refund in sight!",
      });
      onClose();
    } catch (error) {
      console.error('Error updating refund status:', error);
      toast({
        title: "Refund Riddle! 🎭",
        description: "The refund status is playing hard to get. Shall we try again?",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex-shrink-0">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold">Transaction Details</DialogTitle>
            <Badge variant={isDebit ? "destructive" : "success"}>
              {transaction.type}
            </Badge>
          </div>
        </DialogHeader>
      </div>

      <div className="p-4 pt-2 flex-1 overflow-y-auto space-y-4">
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
          <div>
            <div className={`text-xl font-bold ${amountColor}`}>
              {isDebit ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(transaction.occurredOn).toLocaleDateString()}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {transaction.category.name}
          </Badge>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-xs font-medium text-gray-500">Description</div>
          <div className="text-sm mt-1">{transaction.description}</div>
        </div>

        {isDebit && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button 
              className="h-10"
              variant="default"
              onClick={onSplitStart}
            >
              <Scissors className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Split Transaction</span>
              <span className="sm:hidden">Split</span>
            </Button>
            <Button 
              className="h-10"
              variant="default"
              onClick={onShareStart}
            >
              <ShareIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Adjust Share</span>
              <span className="sm:hidden">Share</span>
            </Button>
            <Button 
              className="h-10"
              variant={transaction.refunded ? "outline" : "default"}
              onClick={handleMarkAsRefunded}
            >
              <CheckCircle className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">
                {transaction.refunded ? 'Undo Refund' : 'Mark as Refunded'}
              </span>
              <span className="sm:hidden">
                {transaction.refunded ? 'Undo' : 'Refund'}
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const SplitView = ({ transaction, onSave, onCancel, categories }) => {
  const { state: { step }, dispatch } = useSplitContext();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6 flex-shrink-0">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">
              {step === 1 ? 'Split Transaction' : 'Review Splits'}
            </DialogTitle>
          </div>
        </DialogHeader>
      </div>

      <ScrollArea className="flex-1 px-6">
        {step === 1 ? 
          <SplitEntryStep transaction={transaction} categories={categories} /> 
          : <SummaryStep transaction={transaction} />}
      </ScrollArea>

      <div className="p-6 pt-4 border-t flex-shrink-0">
        <div className="flex w-full gap-2">
          <Button 
            variant="outline" 
            className="flex-1 h-10 text-base font-medium"
            onClick={() => {
              if (step === 1) {
                onCancel();
              } else {
                dispatch({ type: 'SET_STEP', step: 1 });
              }
            }}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button 
            className="flex-1 h-10 text-base font-medium bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              if (step === 1) {
                dispatch({ type: 'SET_STEP', step: 2 });
              } else {
                onSave();
              }
            }}
          >
            {step === 1 ? (
              <>
                Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              'Confirm Split'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

const TransactionManager = ({ transaction, onSplitSave, onShareSave, categories = [], onClose }) => {
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