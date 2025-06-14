import React, { useReducer } from 'react';
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plus } from "lucide-react";
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
    <div className="space-y-4">
      <Card>
        <CardContent className="p-3">
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
        </CardContent>
      </Card>

      <div className="space-y-3">
        {state.splits.map((split, index) => (
          <SplitItem
            key={index}
            split={split}
            index={index}
            categories={categories}
          />
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full h-10 text-base"
        onClick={() => dispatch({
          type: 'ADD_SPLIT',
          category: transaction.category
        })}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Split
      </Button>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Remaining Amount:</span>
            <span className={`font-semibold ${calculations.remainingAmount < 0 ? 'text-red-600' : ''}`}>
              ${calculations.remainingAmount.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SummaryStep = ({ transaction }) => {
  const { state, calculations } = useSplitViewContext();

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Original Transaction</span>
              <span className="font-semibold line-through text-gray-500">
                ${Math.abs(transaction.amount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Updated Amount</span>
              <span className="font-semibold text-blue-600">
                ${Math.abs(calculations.remainingAmount).toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-600">{transaction.description}</div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {state.splits.map((split, index) => (
          <Card key={index}>
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">Split {index + 1}</div>
                  <Badge variant="outline" className="mt-1">
                    {split.category.name}
                  </Badge>
                  {split.description && (
                    <div className="mt-1 text-sm text-gray-600">{split.description}</div>
                  )}
                </div>
                <div className="font-semibold">${parseFloat(split.amount).toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Remaining Amount</span>
            <span className={`font-semibold ${calculations.remainingAmount < 0 ? 'text-red-600' : ''}`}>
              ${calculations.remainingAmount.toFixed(2)}
            </span>
          </div>
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
        <div className="p-4 sm:p-6 flex-shrink-0">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <DialogTitle className="text-xl font-semibold">
                {state.step === 1 ? 'Split Transaction' : 'Review Split'}
              </DialogTitle>
              {state.step === 1 && (
                <div className="text-xl font-semibold text-red-600">
                  ${Math.abs(transaction.amount).toFixed(2)}
                </div>
              )}
            </div>
          </DialogHeader>
          <Progress className="mt-2" value={state.step === 1 ? 50 : 100} />
        </div>

        <div className="p-4 sm:p-6 pt-2 flex-1 overflow-y-auto">
          {state.step === 1 ? (
            <SplitEntryStep transaction={transaction} categories={categories} />
          ) : (
            <SummaryStep transaction={transaction} />
          )}
        </div>

        <Separator />
        <div className="p-6 flex-shrink-0">
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1 h-10 text-base font-medium"
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
              disabled={!calculations.isValid}
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