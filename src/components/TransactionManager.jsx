import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Plus, MinusCircle, ChevronDown, ChevronUp, ArrowRight, Scissors } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TransactionManager = ({ 
  transaction,
  onSplitSave,
  categories = [],
  onClose
}) => {
  const [isSplitView, setIsSplitView] = useState(false);
  const [splits, setSplits] = useState([]);
  const [step, setStep] = useState(1);
  const [openSplitIndex, setOpenSplitIndex] = useState(0);

  useEffect(() => {
    setSplits([]);
    setIsSplitView(false);
    setStep(1);
    setOpenSplitIndex(0);
  }, [transaction]);
  
  const remainingAmount = transaction ? 
    (transaction.amount - splits.reduce((sum, split) => sum + (parseFloat(split.amount) || 0), 0)) : 
    0;

  const addSplit = () => {
    if (!transaction) return;
    const newIndex = splits.length;
    const newSplit = { 
      amount: '', 
      description: '', 
      category: transaction.category 
    };
    setSplits([...splits, newSplit]);
    setOpenSplitIndex(newIndex);
  };

  const removeSplit = (index) => {
    setSplits(splits.filter((_, i) => i !== index));
    if (openSplitIndex === index) {
      setOpenSplitIndex(Math.max(0, index - 1));
    }
  };

  const updateSplit = (index, field, value) => {
    setSplits(splits.map((split, i) => {
      if (i !== index) return split;
      if (field === 'category') {
        value = categories.find(c => c.name === value);
      }
      return { ...split, [field]: value };
    }));
  };

  const SplitItem = ({ split, index }) => {
    const isOpen = openSplitIndex === index;
    
    return (
      <div className="border rounded-lg">
        <div className="p-3 flex items-center justify-between">
          <button
            className="flex items-center gap-2 hover:text-blue-600"
            onClick={() => setOpenSplitIndex(isOpen ? -1 : index)}
          >
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              Split {index + 1} 
              {split.amount && ` - $${parseFloat(split.amount).toFixed(2)}`}
            </span>
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => removeSplit(index)}
          >
            <MinusCircle className="h-4 w-4" />
          </Button>
        </div>

        {isOpen && (
          <div className="px-3 pb-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={split.amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || parseFloat(value) > 0) {
                    updateSplit(index, 'amount', value);
                  }
                }}
                placeholder="Amount"
                className="h-8"
              />
              
              <Select
                value={split.category.name}
                onValueChange={(value) => updateSplit(index, 'category', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem 
                      key={category.id} 
                      value={category.name}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="col-span-2">
                <Input
                  value={split.description || ''}
                  onChange={(e) => updateSplit(index, 'description', e.target.value)}
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

  const SplitEntryStep = () => (
    <div className="space-y-4">
      {/* Original Transaction */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-base font-semibold">{transaction.description}</div>
            <Badge variant="outline" className="mt-1 text-xs">
              {transaction.category.name}
            </Badge>
          </div>
          <div className="text-xl font-bold text-blue-700">
            ${transaction.amount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Splits Section - Scrollable */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-500">Split Transactions</div>
        <ScrollArea className="h-[240px] rounded-md border">
          <div className="space-y-2 p-4">
            {splits.map((split, index) => (
              <SplitItem 
                key={index} 
                split={split} 
                index={index} 
              />
            ))}
          </div>
        </ScrollArea>

        <Button 
          variant="outline" 
          className="w-full h-8 text-sm"
          onClick={addSplit}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Split
        </Button>
      </div>

      {/* Amount Summary - Fixed at Bottom */}
      <div className="space-y-2 border-t pt-4">
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm">
          <span>Remaining Amount:</span>
          <span className="font-semibold">${remainingAmount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg text-sm border border-blue-100">
          <span>Total Split Amount:</span>
          <span className="font-semibold">
            ${splits.reduce((sum, split) => sum + (parseFloat(split.amount) || 0), 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );

  const SummaryStep = () => {
    const finalTransactions = [
      {
        ...transaction,
        amount: remainingAmount,
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
      <div className="space-y-4">
        <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          Final Transactions
        </div>
        
        <ScrollArea className="h-[320px]">
          <div className="space-y-3 pr-4">
            {finalTransactions.map((t, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
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
                    <div className="text-sm">
                      {t.description || transaction.description}
                    </div>
                    <Badge 
                      variant="outline" 
                      className="mt-1 text-xs"
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

        <div className="border-t pt-4">
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm">
            <span>Total Amount:</span>
            <span className="font-semibold">
              ${transaction.amount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const SplitView = () => {
    if (!transaction) return null;

    return (
      <div className="flex flex-col">
        <DialogHeader className="flex-none pb-2">
          <div className="flex justify-between items-center">
            <DialogTitle>
              {step === 1 ? 'Split Transaction' : 'Review Splits'}
            </DialogTitle>
            
          </div>
        </DialogHeader>

        <div className="mt-2">
          {step === 1 ? <SplitEntryStep /> : <SummaryStep />}
        </div>

        <div className="flex gap-2 pt-4 mt-4 border-t">
          <Button 
            variant="outline" 
            className="flex-1 h-9"
            onClick={() => {
              if (step === 1) {
                setIsSplitView(false);
              } else {
                setStep(1);
              }
            }}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button 
            className="flex-1 h-9"
            onClick={() => {
              if (step === 1) {
                setStep(2);
              } else {
                const parentUpdate = { amount: remainingAmount };
                onSplitSave(parentUpdate, splits);
              }
            }}
            disabled={splits.length === 0 || remainingAmount < 0}
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
    );
  };

  const TransactionView = () => {
    if (!transaction) return null;

    const isDebit = transaction.type.toLowerCase() === 'debit';
    const amountColor = isDebit ? 'text-red-600' : 'text-green-600';

    return (
      <div className="space-y-4">
        <DialogHeader className="pb-2">
          <div className="flex justify-between items-center">
            <DialogTitle>Transaction Details</DialogTitle>
            <Badge variant={isDebit ? "destructive" : "success"}>
              {transaction.type}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
          <div>
            <div className={`text-2xl font-bold ${amountColor}`}>
              {isDebit ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              {new Date(transaction.occurredOn).toLocaleDateString()}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {transaction.category.name}
          </Badge>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-500">Description</div>
          <div className="text-base mt-1">{transaction.description}</div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            className="flex-1 h-9"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
          <Button 
            className="flex-1 h-9"
            variant="default"
            onClick={() => {
              setSplits([{ 
                amount: '', 
                description: '', 
                category: transaction.category 
              }]);
              setIsSplitView(true);
              setStep(1);
            }}
            disabled={!transaction || !isDebit}
          >
            <Scissors className="mr-2 h-4 w-4" />
            Split Transaction
          </Button>
        </div>
      </div>
    );
  };

  return isSplitView ? <SplitView /> : <TransactionView />;
};

export default TransactionManager;