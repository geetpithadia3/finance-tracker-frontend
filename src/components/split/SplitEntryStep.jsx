import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SplitItem } from './SplitItem';
import { useSplitContext } from './SplitContext';
import { useSplitCalculations } from '../transactions/hooks/useSplitCalculations';

export const SplitEntryStep = ({ transaction }) => {
    const { state: { splits }, dispatch } = useSplitContext();
    const calculations = useSplitCalculations(transaction, splits);
    
    return (
      <div className="space-y-4">
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
  
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-500">Split Transactions</div>
          <ScrollArea className="h-[240px] rounded-md border">
            <div className="space-y-2 p-4">
              {splits.map((split, index) => (
                <SplitItem key={index} split={split} index={index} />
              ))}
            </div>
          </ScrollArea>
  
          <Button 
            variant="outline" 
            className="w-full h-8 text-sm"
            onClick={() => dispatch({ 
              type: 'ADD_SPLIT', 
              category: transaction.category 
            })}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Split
          </Button>
        </div>
  
        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm">
            <span>Remaining Amount:</span>
            <span className="font-semibold">
              ${calculations.remainingAmount.toFixed(2)}
            </span>
          </div>
  
          <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg text-sm border border-blue-100">
            <span>Total Split Amount:</span>
            <span className="font-semibold">
              ${calculations.totalSplitAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  };