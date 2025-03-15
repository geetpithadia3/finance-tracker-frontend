import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronUp, ChevronDown, MinusCircle } from 'lucide-react';
import { useSplitViewContext } from '../context/SplitViewContext';


export const SplitItem = ({ split, index, categories }) => {
  const { dispatch, state: { openSplitIndex } } = useSplitViewContext();
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