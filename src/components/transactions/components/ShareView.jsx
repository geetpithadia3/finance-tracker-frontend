import React, { useReducer, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, DollarSign, Tag, Calculator, Percent, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

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
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 mr-6">
              <div className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{transaction.description}</div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm px-3 py-1 bg-white">
                  <Tag className="h-3 w-3 mr-1" />
                  {transaction.category.name}
                </Badge>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 whitespace-nowrap">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 inline mr-1" />
              {Math.abs(transaction.amount).toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Share Configuration</h3>
        </div>

        {state.splitType === 'shares' ? (
          <div className="space-y-4">
            <Select
              value={state.splitType}
              onValueChange={(value) => dispatch({ type: 'UPDATE_SPLIT_TYPE', value })}
            >
              <SelectTrigger className="h-10 sm:h-12">
                <SelectValue placeholder="Split Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amount">Amount ($)</SelectItem>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="shares">Shares</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Your shares</label>
                <Input
                  type="number"
                  value={state.yourShares}
                  onChange={(e) => {
                    const value = e.target.value;
                    dispatch({ type: 'UPDATE_YOUR_SHARES', value });
                    calculateShares('shares', value);
                  }}
                  placeholder="0"
                  className="h-10 sm:h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Total shares</label>
                <Input
                  type="number"
                  value={state.totalShares}
                  onChange={(e) => {
                    const value = e.target.value;
                    dispatch({ type: 'UPDATE_TOTAL_SHARES', value });
                    calculateShares('shares', state.yourShares, value);
                  }}
                  placeholder="0"
                  className="h-10 sm:h-12"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-[1fr,auto] gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {state.splitType === 'amount' ? 'Your share amount' : 'Your percentage'}
                </label>
                <Input
                  type="number"
                  value={state.splitType === 'amount' ? state.personalShare : state.percentage}
                  onChange={(e) => calculateShares(state.splitType, e.target.value)}
                  placeholder={state.splitType === 'amount' ? "0.00" : "0"}
                  className="h-10 sm:h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Split type</label>
                <Select
                  value={state.splitType}
                  onValueChange={(value) => dispatch({ type: 'UPDATE_SPLIT_TYPE', value })}
                >
                  <SelectTrigger className="h-10 sm:h-12 min-w-[140px]">
                    <SelectValue placeholder="Split Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">Amount ($)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="shares">Shares</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Share Summary</h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Your Share:</span>
                  <span className="text-base sm:text-lg font-bold text-gray-900">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    {state.personalShare.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Owed Share:</span>
                  <span className="text-base sm:text-lg font-bold text-blue-600">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    {state.owedShare.toFixed(2)}
                  </span>
                </div>
                {state.splitType === 'shares' && state.yourShares && state.totalShares && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Split Ratio:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {state.yourShares} : {parseFloat(state.totalShares) - parseFloat(state.yourShares)} of {state.totalShares}
                    </span>
                  </div>
                )}
                <Separator className="my-3" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total Amount:</span>
                  <span className="text-lg sm:text-xl font-bold text-gray-900">
                    <DollarSign className="h-5 w-5 inline mr-1" />
                    {Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SummaryStep = ({ state, transaction }) => {
  return (
    <div className="space-y-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Original Transaction</span>
              <span className="font-bold text-gray-500 line-through">
                <DollarSign className="h-5 w-5 inline mr-1" />
                {Math.abs(transaction.amount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Your Share</span>
              <span className="font-bold text-blue-600">
                <DollarSign className="h-5 w-5 inline mr-1" />
                {state.personalShare.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-600">{transaction.description}</div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Share Details</h3>
        
        <Card className="border-gray-200">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">Your Share</span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-gray-900">
                  <DollarSign className="h-5 w-5 inline mr-1" />
                  {state.personalShare.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">Owed Share</span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-blue-600">
                  <DollarSign className="h-5 w-5 inline mr-1" />
                  {state.owedShare.toFixed(2)}
                </span>
              </div>
              
              {state.splitType === 'percentage' && state.percentage && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">Your Percentage</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {state.percentage}%
                  </span>
                </div>
              )}
              
              {state.splitType === 'shares' && state.yourShares && state.totalShares && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">Share Ratio</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {state.yourShares} : {parseFloat(state.totalShares) - parseFloat(state.yourShares)} of {state.totalShares}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total Transaction Amount</span>
            <span className="text-lg sm:text-xl font-bold text-green-600">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 inline mr-1" />
              {Math.abs(transaction.amount).toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ShareView = ({ transaction, onSave, onCancel }) => {
  const { toast } = useToast();
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
    const metadata = {
      splitType: state.splitType,
      ...(state.splitType === 'percentage' && { percentage: state.percentage }),
      ...(state.splitType === 'shares' && { 
        yourShares: state.yourShares,
        totalShares: state.totalShares
      })
    };

    onSave({
      personalShare: state.personalShare,
      owedShare: state.owedShare,
      metadata: JSON.stringify(metadata)
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 sm:p-6 flex-shrink-0 border-b border-gray-200">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <DialogTitle className="text-base sm:text-2xl font-bold text-gray-900">
              {state.step === 1 ? 'Adjust Shares' : 'Review Shares'}
            </DialogTitle>
            {state.step === 1 && (
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 inline mr-1" />
                {Math.abs(transaction.amount).toFixed(2)}
              </div>
            )}
          </div>
        </DialogHeader>
        <Progress className="mt-4" value={state.step === 1 ? 50 : 100} />
      </div>

      <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
        {state.step === 1 ? 
          <ShareEntryStep state={state} dispatch={dispatch} transaction={transaction} /> 
          : <SummaryStep state={state} transaction={transaction} />}
      </div>

      <div className="p-4 sm:p-6 flex-shrink-0 border-t border-gray-200">
        <div className="flex w-full gap-4">
          <Button 
            variant="outline" 
            className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-medium"
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
            className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-medium gap-2"
            onClick={() => {
              if (state.step === 1) {
                dispatch({ type: 'SET_STEP', step: 2 });
              } else {
                handleSave();
              }
            }}
          >
            {state.step === 1 ? (
              <>
                Review
                <ArrowRight className="h-5 w-5" />
              </>
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