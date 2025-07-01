import React, { useReducer } from 'react';
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus, DollarSign, Tag, Calculator } from "lucide-react";
import { SplitItem } from './SplitItem';
import { SplitViewContext } from '../context/SplitViewContext';
import { splitReducer } from '../../../reducers/splitReducer';
import { useSplitCalculations } from '../hooks/useSplitCalculations';
import { useSplitViewContext } from '../context/SplitViewContext';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const SplitEntryStep = ({ transaction, categories }) => {
  const { state, dispatch, calculations } = useSplitViewContext();

  return (
    <div className="space-y-6">
      {/* Original Transaction Card */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 mr-6">
              <div className="text-lg font-semibold text-gray-900 mb-2">{transaction.description}</div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm px-3 py-1 bg-white">
                  <Tag className="h-3 w-3 mr-1" />
                  {transaction.category.name}
                </Badge>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 whitespace-nowrap">
              <DollarSign className="h-6 w-6 inline mr-1" />
              {Math.abs(transaction.amount).toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Split Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Split Details</h3>
          <span className="text-sm text-gray-500">
            {state.splits.length} split{state.splits.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {state.splits.map((split, index) => (
          <SplitItem
            key={index}
            split={split}
            index={index}
            categories={categories}
          />
        ))}
      </div>

      {/* Add Split Button */}
      <Button
        variant="outline"
        className="w-full h-12 text-base font-medium gap-2"
        onClick={() => dispatch({
          type: 'ADD_SPLIT',
          category: transaction.category
        })}
      >
        <Plus className="h-5 w-5" />
        Add Split
      </Button>

      {/* Remaining Amount Card */}
      <Card className={`${calculations.remainingAmount < 0 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-gray-600" />
              <span className="font-semibold text-gray-900">Remaining Amount:</span>
            </div>
            <span className={`text-xl font-bold ${calculations.remainingAmount < 0 ? 'text-red-600' : 'text-blue-600'}`}>
              <DollarSign className="h-5 w-5 inline mr-1" />
              {calculations.remainingAmount.toFixed(2)}
            </span>
          </div>
          {calculations.remainingAmount < 0 && (
            <p className="text-sm text-red-600 mt-2">
              Warning: Total split amount exceeds original transaction amount.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const SummaryStep = ({ transaction }) => {
  const { state, calculations } = useSplitViewContext();

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Original Transaction</span>
              <span className="font-bold text-gray-500 line-through">
                <DollarSign className="h-5 w-5 inline mr-1" />
                {Math.abs(transaction.amount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Updated Amount</span>
              <span className="font-bold text-blue-600">
                <DollarSign className="h-5 w-5 inline mr-1" />
                {Math.abs(calculations.remainingAmount).toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-600">{transaction.description}</div>
          </div>
        </CardContent>
      </Card>

      {/* Split Summary */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Split Summary</h3>
        {state.splits.map((split, index) => (
          <Card key={index} className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="font-semibold text-gray-900">Split {index + 1}</div>
                  <Badge variant="outline" className="mt-2 text-sm px-3 py-1">
                    <Tag className="h-3 w-3 mr-1" />
                    {split.category.name}
                  </Badge>
                  {split.description && (
                    <div className="mt-2 text-sm text-gray-600">{split.description}</div>
                  )}
                </div>
                <div className="font-bold text-gray-900">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  {parseFloat(split.amount).toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Final Remaining Amount */}
      <Card className={`${calculations.remainingAmount < 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Remaining Amount</span>
            <span className={`text-xl font-bold ${calculations.remainingAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
              <DollarSign className="h-5 w-5 inline mr-1" />
              {calculations.remainingAmount.toFixed(2)}
            </span>
          </div>
          {calculations.remainingAmount < 0 && (
            <p className="text-sm text-red-600 mt-2">
              Please adjust split amounts to match the original transaction.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const SplitView = ({ transaction, onSave, onCancel, categories }) => {
  const [state, dispatch] = useReducer(splitReducer, {
    splits: [],
    openSplitIndex: 0,
    step: 1
  });

  const calculations = useSplitCalculations(transaction, state.splits);

  const handleSave = () => {
    const remainingTransaction = {
      amount: calculations.remainingAmount,
      description: transaction.description,
      categoryId: transaction.category.id,
      category: transaction.category,
      type: transaction.type,
      account: transaction.account,
      occurredOn: transaction.occurredOn
    };
    onSave(remainingTransaction, state.splits);
  };

  return (
    <SplitViewContext.Provider value={{ state, dispatch, calculations }}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 flex-shrink-0 border-b border-gray-200">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {state.step === 1 ? 'Split Transaction' : 'Review Split'}
              </DialogTitle>
              {state.step === 1 && (
                <div className="text-2xl font-bold text-gray-900">
                  <DollarSign className="h-6 w-6 inline mr-1" />
                  {Math.abs(transaction.amount).toFixed(2)}
                </div>
              )}
            </div>
          </DialogHeader>
          <Progress className="mt-4" value={state.step === 1 ? 50 : 100} />
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {state.step === 1 ? (
            <SplitEntryStep transaction={transaction} categories={categories} />
          ) : (
            <SummaryStep transaction={transaction} />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 flex-shrink-0 border-t border-gray-200">
          <div className="flex w-full gap-4">
            <Button
              variant="outline"
              className="flex-1 h-12 text-base font-medium"
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
              className="flex-1 h-12 text-base font-medium gap-2"
              onClick={() => {
                if (state.step === 1) {
                  dispatch({ type: 'SET_STEP', step: 2 });
                } else {
                  handleSave();
                }
              }}
              disabled={calculations.remainingAmount < 0}
            >
              {state.step === 1 ? (
                <>
                  Review
                  <ArrowRight className="h-5 w-5" />
                </>
              ) : (
                'Confirm Split'
              )}
            </Button>
          </div>
        </div>
      </div>
    </SplitViewContext.Provider>
  );
};

export default SplitView;