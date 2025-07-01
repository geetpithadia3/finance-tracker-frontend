import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MinusCircle, DollarSign, Tag, FileText } from 'lucide-react';
import { useSplitViewContext } from '../context/SplitViewContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export const SplitItem = ({ split, index, categories }) => {
  const { dispatch, state: { openSplitIndex } } = useSplitViewContext();
  const isOpen = openSplitIndex === index;

  const handleAmountChange = (value) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      dispatch({ type: 'UPDATE_SPLIT', index, field: 'amount', value });
    }
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <Accordion
        type="single"
        collapsible
        value={isOpen ? `item-${index}` : undefined}
        onValueChange={(value) => 
          dispatch({
            type: 'SET_OPEN_INDEX',
            index: value === `item-${index}` ? index : -1
          })
        }
      >
        <AccordionItem value={`item-${index}`} className="border-none">
          <div className="flex items-center justify-between p-4">
            <AccordionTrigger className="py-0 hover:no-underline hover:text-blue-600 flex-1 text-left">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-base font-semibold text-gray-900">
                    Split {index + 1}
                  </span>
                  {split.amount && (
                    <span className="text-sm text-gray-500">
                      <DollarSign className="h-3 w-3 inline mr-1" />
                      {parseFloat(split.amount).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'REMOVE_SPLIT', index });
              }}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
          </div>

          <AccordionContent className="px-4 pb-4 pt-0">
            <div className="space-y-4">
              {/* Amount and Category Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Amount
                  </label>
                  <Input
                    type="text"
                    value={split.amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Category
                  </label>
                  <Select
                    value={split.category.name}
                    onValueChange={(value) => dispatch({
                      type: 'UPDATE_SPLIT',
                      index,
                      field: 'category',
                      value: categories.find(c => c.name === value)
                    })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description (optional)
                </label>
                <Input
                  value={split.description || ''}
                  onChange={(e) => dispatch({
                    type: 'UPDATE_SPLIT',
                    index,
                    field: 'description',
                    value: e.target.value
                  })}
                  placeholder="Enter description for this split"
                  className="h-12"
                  maxLength={100}
                />
                {split.description && (
                  <div className="text-xs text-gray-500">
                    {split.description.length}/100 characters
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}; 