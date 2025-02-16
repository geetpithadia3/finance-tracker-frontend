import React, { useReducer, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const shareReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_PERSONAL_SHARE':
      return { ...state, personalShare: action.value };
    case 'UPDATE_OWED_SHARE':
      return { ...state, owedShare: action.value };
    case 'UPDATE_SPLIT_TYPE':
      return { 
        ...state, 
        splitType: action.value,
        personalShare: 0,
        owedShare: 0,
        yourShares: '',
        totalShares: '',
        percentage: ''
      };
    case 'UPDATE_YOUR_SHARES':
      return { ...state, yourShares: action.value };
    case 'UPDATE_TOTAL_SHARES':
      return { ...state, totalShares: action.value };
    case 'UPDATE_PERCENTAGE':
      return { ...state, percentage: action.value };
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'INITIALIZE_FROM_METADATA':
      return {
        ...state,
        splitType: action.metadata.splitType,
        personalShare: action.metadata.personalShare,
        owedShare: action.metadata.owedShare,
        percentage: action.metadata.percentage || '',
        yourShares: action.metadata.yourShares || '',
        totalShares: action.metadata.totalShares || '',
        step: 1
      };
    case 'RESET':
      return { 
        personalShare: 0, 
        owedShare: 0, 
        splitType: 'amount',
        yourShares: '',
        totalShares: '',
        percentage: '',
        step: 1
      };
    default:
      return state;
  }
};

const ShareEntryStep = ({ state, dispatch, transaction }) => {
  const calculateShares = (type, value, totalShares = state.totalShares) => {
    const totalAmount = transaction.amount;
    let personalShare = 0;
    let owedShare = 0;

    switch(type) {
      case 'amount':
        personalShare = Math.min(parseFloat(value) || 0, totalAmount);
        owedShare = totalAmount - personalShare;
        break;
      case 'percentage':
        const percentage = Math.min(parseFloat(value) || 0, 100);
        personalShare = (totalAmount * percentage) / 100;
        owedShare = totalAmount - personalShare;
        dispatch({ type: 'UPDATE_PERCENTAGE', value: percentage });
        break;
      case 'shares':
        if (totalShares && value) {
          const yourShares = parseFloat(value);
          const total = parseFloat(totalShares);
          if (total > 0 && yourShares <= total) {
            personalShare = (totalAmount * yourShares) / total;
            owedShare = totalAmount - personalShare;
          }
        }
        break;
    }

    dispatch({ type: 'UPDATE_PERSONAL_SHARE', value: personalShare });
    dispatch({ type: 'UPDATE_OWED_SHARE', value: owedShare });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-base font-semibold">{transaction.description}</div>
            <Badge variant="outline" className="mt-1 text-xs">
              {transaction.category.name}
            </Badge>
          </div>
          <div className="text-xl font-bold text-gray-700">
            ${Math.abs(transaction.amount).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {state.splitType === 'shares' ? (
          <div className="space-y-3">
            <Select
              value={state.splitType}
              onValueChange={(value) => dispatch({ type: 'UPDATE_SPLIT_TYPE', value })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Split Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amount">Amount ($)</SelectItem>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="shares">Shares</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                value={state.yourShares}
                onChange={(e) => {
                  const value = e.target.value;
                  dispatch({ type: 'UPDATE_YOUR_SHARES', value });
                  calculateShares('shares', value);
                }}
                placeholder="Your shares"
                className="h-9"
              />
              <Input
                type="number"
                value={state.totalShares}
                onChange={(e) => {
                  const value = e.target.value;
                  dispatch({ type: 'UPDATE_TOTAL_SHARES', value });
                  calculateShares('shares', state.yourShares, value);
                }}
                placeholder="Total shares"
                className="h-9"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[1fr,auto] gap-3">
            <Input
              type="number"
              value={state.splitType === 'amount' ? state.personalShare : state.percentage}
              onChange={(e) => calculateShares(state.splitType, e.target.value)}
              placeholder={state.splitType === 'amount' ? "Enter your share ($)" : "Enter percentage (%)"}
              className="h-9"
            />
            <Select
              value={state.splitType}
              onValueChange={(value) => dispatch({ type: 'UPDATE_SPLIT_TYPE', value })}
            >
              <SelectTrigger className="h-9 min-w-[140px]">
                <SelectValue placeholder="Split Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amount">Amount ($)</SelectItem>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="shares">Shares</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Your Share:</span>
            <span className="text-base">${state.personalShare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Owed Share:</span>
            <span className="text-base">${state.owedShare.toFixed(2)}</span>
          </div>
          {state.splitType === 'shares' && state.yourShares && state.totalShares && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Split Ratio:</span>
              <span className="text-base">
                {state.yourShares} : {parseFloat(state.totalShares) - parseFloat(state.yourShares)} of {state.totalShares}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm font-medium text-gray-500">Total Amount:</span>
            <span className="text-base">${Math.abs(transaction.amount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryStep = ({ state, transaction }) => {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium uppercase text-gray-500">
        FINAL SHARES
      </div>

      <div className="bg-blue-50/50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-600">Your Share</span>
          <span className="text-lg font-semibold">${state.personalShare.toFixed(2)}</span>
        </div>
        {state.splitType === 'percentage' && (
          <span className="text-sm text-gray-500">
            {((state.personalShare / transaction.amount) * 100).toFixed(1)}% of total
          </span>
        )}
        {state.splitType === 'shares' && state.totalShares && (
          <span className="text-sm text-gray-500">
            {state.yourShares} of {state.totalShares} shares
          </span>
        )}
      </div>

      <div className="bg-green-50/50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-600">Owed Share</span>
          <span className="text-lg font-semibold">${state.owedShare.toFixed(2)}</span>
        </div>
        {state.splitType === 'percentage' && (
          <span className="text-sm text-gray-500">
            {((state.owedShare / transaction.amount) * 100).toFixed(1)}% of total
          </span>
        )}
        {state.splitType === 'shares' && state.totalShares && (
          <span className="text-sm text-gray-500">
            {parseFloat(state.totalShares) - parseFloat(state.yourShares)} of {state.totalShares} shares
          </span>
        )}
      </div>

      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
        <span className="font-medium">Total Amount:</span>
        <span className="font-semibold">${Math.abs(transaction.amount).toFixed(2)}</span>
      </div>
    </div>
  );
};

const ShareView = ({ transaction, onSave, onCancel }) => {
  const [state, dispatch] = useReducer(shareReducer, {
    step: 1,
    personalShare: transaction.personalShare || 0,
    owedShare: transaction.owedShare || 0,
    splitType: 'amount',
    yourShares: '',
    totalShares: '',
    percentage: ''
  });

  useEffect(() => {
    if (transaction.shareMetadata) {
      try {
        const metadata = JSON.parse(transaction.shareMetadata);
        dispatch({ type: 'INITIALIZE_FROM_METADATA', metadata: {
          splitType: metadata.splitType,
          personalShare: transaction.personalShare,
          owedShare: transaction.owedShare,
          ...(metadata.splitType === 'percentage' && { 
            percentage: metadata.percentage 
          }),
          ...(metadata.splitType === 'shares' && { 
            yourShares: metadata.yourShares,
            totalShares: metadata.totalShares
          })
        }});
      } catch (error) {
        console.error('Error parsing share metadata:', error);
      }
    }
  }, [transaction]);

  const handleSave = () => {
    const shareData = {
      personalShare: parseFloat(state.personalShare),
      owedShare: parseFloat(state.owedShare),
      shareMetadata: JSON.stringify({
        splitType: state.splitType,
        ...(state.splitType === 'percentage' && { 
          percentage: parseFloat(state.percentage) 
        }),
        ...(state.splitType === 'shares' && { 
          yourShares: parseFloat(state.yourShares),
          totalShares: parseFloat(state.totalShares)
        })
      })
    };

    onSave({
      ...transaction,
      ...shareData
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 flex-shrink-0">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">
              {state.step === 1 ? 'Adjust Shares' : 'Review Shares'}
            </DialogTitle>
            {state.step === 1 && (
              <div className="text-xl font-semibold text-red-600">
                ${Math.abs(transaction.amount).toFixed(2)}
              </div>
            )}
          </div>
        </DialogHeader>
      </div>

      <div className="p-6 pt-2 flex-1 overflow-y-auto">
        {state.step === 1 ? 
          <ShareEntryStep state={state} dispatch={dispatch} transaction={transaction} /> 
          : <SummaryStep state={state} transaction={transaction} />}
      </div>

      <div className="p-6 pt-4 border-t flex-shrink-0">
        <div className="flex w-full gap-2">
          <Button 
            variant="outline" 
            className="flex-1 h-10"
            onClick={() => {
              if (state.step === 1) {
                onCancel();
              } else {
                dispatch({ type: 'SET_STEP', step: 1 });
              }
            }}
          >
            {state.step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button 
            variant="default"
            className="flex-1 h-10 text-base font-medium"
            onClick={() => {
              if (state.step === 1) {
                dispatch({ type: 'SET_STEP', step: 2 });
              } else {
                handleSave();
              }
            }}
          >
            {state.step === 1 ? (
              <div className="flex items-center justify-center">
                Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            ) : (
              'Confirm Share'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareView;