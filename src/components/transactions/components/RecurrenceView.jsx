import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, addWeeks, addMonths, addYears } from "date-fns";
import { cn } from "@/lib/utils";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

const RECURRENCE_OPTIONS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Bi-weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' }
];

const getNextDate = (currentDate, frequency) => {
  let baseDate = new Date(currentDate);

  switch (frequency) {
    case 'DAILY':
      return addDays(baseDate, 1);
    case 'WEEKLY':
      return addWeeks(baseDate, 1);
    case 'BIWEEKLY':
      return addWeeks(baseDate, 2);
    case 'MONTHLY':
      return addMonths(baseDate, 1);
    case 'YEARLY':
      return addYears(baseDate, 1);
    default:
      return baseDate;
  }
};

export const RecurrenceView = ({ transaction, onSave, onCancel }) => {
  const [recurrence, setRecurrence] = useState(null);
  const isExistingRecurrence = transaction.recurrence !== null && transaction.recurrence !== undefined;

  useEffect(() => {
    // Initialize recurrence state when transaction changes
    if (transaction.recurrence) {
      setRecurrence(transaction.recurrence);
    } else {
      setRecurrence(null);
    }
  }, [transaction]);

  const handleFrequencyChange = (frequency) => {
    // Always calculate next date from the original transaction date
    const nextDate = getNextDate(transaction.occurredOn, frequency);
    setRecurrence({ ...recurrence, frequency, nextDate });
  };

  const handleSave = () => {
    if (!recurrence) {
      onSave({
        ...transaction,
        recurrence: null
      });
      return;
    }

    if (!recurrence.frequency || !recurrence.nextDate) {
      return;
    }
    
    onSave({
      ...transaction,
      recurrence
    });
  };

  const handleRemoveRecurrence = () => {
    setRecurrence(null);
  };

  const handleSetupRecurrence = () => {
    // Always use the transaction's original date as the base for calculation
    const nextDate = getNextDate(transaction.occurredOn, 'MONTHLY');
    setRecurrence({ frequency: 'MONTHLY', nextDate });
  };

  const getFrequencyLabel = (frequency) => {
    const option = RECURRENCE_OPTIONS.find(opt => opt.value === frequency);
    return option ? option.label : frequency;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 flex-shrink-0">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold">
              {isExistingRecurrence ? 'Edit Recurring Transaction' : 'Set Up Recurring Transaction'}
            </DialogTitle>
            <div className="text-xl font-semibold text-gray-700">
              ${Math.abs(transaction.amount).toFixed(2)}
            </div>
          </div>
        </DialogHeader>
      </div>

      <div className="p-6 pt-2 flex-1 overflow-y-auto">
        <div className="space-y-6">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1 mr-4">
                <div className="text-base font-semibold truncate">
                  {transaction.description}
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <Badge variant="outline" className="text-xs w-fit">
                    {transaction.category.name}
                  </Badge>
                  <Badge variant="outline" className="text-xs w-fit text-gray-500">
                    Transaction Date: {format(new Date(transaction.occurredOn), "MMMM d, yyyy")}
                  </Badge>
                  {isExistingRecurrence && (
                    <Badge variant="outline" className="text-xs w-fit bg-blue-100 text-blue-700 border-blue-200">
                      Currently Recurring: {getFrequencyLabel(transaction.recurrence.frequency)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {recurrence ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Frequency</label>
                <Select
                  value={recurrence.frequency}
                  onValueChange={handleFrequencyChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Next Occurrence</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !recurrence.nextDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {recurrence.nextDate ? (
                        format(new Date(recurrence.nextDate), "MMMM d, yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={recurrence.nextDate ? new Date(recurrence.nextDate) : undefined}
                      onSelect={(date) => setRecurrence({ ...recurrence, nextDate: date })}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleRemoveRecurrence}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Recurrence
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="text-gray-500">
                {isExistingRecurrence 
                  ? "You're about to remove the recurring schedule for this transaction" 
                  : "No recurrence set for this transaction"}
              </div>
              {!isExistingRecurrence && (
                <Button
                  variant="outline"
                  onClick={handleSetupRecurrence}
                >
                  Set Up Recurrence
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 pt-4 border-t flex-shrink-0">
        <div className="flex w-full gap-2">
          <Button 
            variant="outline" 
            className="flex-1 h-10 text-base font-medium"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            className="flex-1 h-10 text-base font-medium"
            onClick={handleSave}
          >
            {recurrence 
              ? (isExistingRecurrence ? 'Update Recurrence' : 'Save Recurrence') 
              : 'Remove Recurrence'}
          </Button>
        </div>
      </div>
    </div>
  );
}; 