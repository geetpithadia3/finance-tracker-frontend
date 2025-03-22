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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const RECURRENCE_OPTIONS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Bi-weekly' },
  { value: 'FOUR_WEEKLY', label: 'Every 4 weeks' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' }
];

// Define flexibility options for different frequencies
const DATE_FLEXIBILITY_OPTIONS = {
  MONTHLY: [
    { value: 'EXACT', label: 'Exact date' },
    { value: 'EARLY_MONTH', label: 'Early month (1st-10th)' },
    { value: 'MID_MONTH', label: 'Mid month (11th-20th)' },
    { value: 'LATE_MONTH', label: 'Late month (21st-31st)' },
    { value: 'CUSTOM_RANGE', label: 'Custom range' }
  ],
  FOUR_WEEKLY: [
    { value: 'EXACT', label: 'Exact day' },
    { value: 'WEEKDAY', label: 'Any weekday (Mon-Fri)' },
    { value: 'WEEKEND', label: 'Weekend (Sat-Sun)' }
  ],
  BIWEEKLY: [
    { value: 'EXACT', label: 'Exact day' },
    { value: 'WEEKDAY', label: 'Any weekday (Mon-Fri)' },
    { value: 'WEEKEND', label: 'Weekend (Sat-Sun)' }
  ],
  WEEKLY: [
    { value: 'EXACT', label: 'Exact day of week' },
    { value: 'WEEKDAY', label: 'Any weekday (Mon-Fri)' },
    { value: 'WEEKEND', label: 'Weekend (Sat-Sun)' }
  ],
  YEARLY: [
    { value: 'EXACT', label: 'Exact date' },
    { value: 'MONTH_RANGE', label: 'Month range' },
    { value: 'SEASON', label: 'Season-based' }
  ],
  DEFAULT: [
    { value: 'EXACT', label: 'Exact date' }
  ]
};

const getNextDate = (currentDate, frequency) => {
  let baseDate = new Date(currentDate);

  switch (frequency) {
    case 'DAILY':
      return addDays(baseDate, 1);
    case 'WEEKLY':
      return addWeeks(baseDate, 1);
    case 'BIWEEKLY':
      return addWeeks(baseDate, 2);
    case 'FOUR_WEEKLY':
      return addWeeks(baseDate, 4);
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
  const [showRangeInputs, setShowRangeInputs] = useState(false);
  const isExistingRecurrence = transaction.recurrence !== null && transaction.recurrence !== undefined;

  useEffect(() => {
    // Initialize recurrence state when transaction changes
    if (transaction.recurrence) {
      setRecurrence(transaction.recurrence);
      setShowRangeInputs(
        ['CUSTOM_RANGE', 'MONTH_RANGE'].includes(transaction.recurrence.dateFlexibility)
      );
    } else {
      setRecurrence(null);
      setShowRangeInputs(false);
    }
  }, [transaction]);

  const handleFrequencyChange = (frequency) => {
    // Reset dateFlexibility when frequency changes to ensure compatibility
    setRecurrence({ 
      ...recurrence, 
      frequency, 
      dateFlexibility: 'EXACT',
      // Reset any frequency-specific fields
      rangeStart: null,
      rangeEnd: null,
      preference: null
    });
    setShowRangeInputs(false);
  };

  const handleDateFlexibilityChange = (dateFlexibility) => {
    setShowRangeInputs(['CUSTOM_RANGE', 'MONTH_RANGE'].includes(dateFlexibility));
    setRecurrence({ ...recurrence, dateFlexibility });
  };

  const handleVariableAmountChange = (isVariable) => {
    setRecurrence({ 
      ...recurrence, 
      isVariableAmount: isVariable,
      // If turning off variable amount, reset the min/max values
      ...(isVariable ? {} : { estimatedMinAmount: null, estimatedMaxAmount: null })
    });
  };

  const handleMinAmountChange = (value) => {
    const minAmount = parseFloat(value);
    if (!isNaN(minAmount)) {
      setRecurrence({ 
        ...recurrence, 
        estimatedMinAmount: minAmount,
        // Ensure max is at least as large as min
        estimatedMaxAmount: recurrence.estimatedMaxAmount < minAmount 
          ? minAmount 
          : recurrence.estimatedMaxAmount
      });
    }
  };

  const handleMaxAmountChange = (value) => {
    const maxAmount = parseFloat(value);
    if (!isNaN(maxAmount)) {
      setRecurrence({ 
        ...recurrence, 
        estimatedMaxAmount: maxAmount,
        // Ensure min is not larger than max
        estimatedMinAmount: recurrence.estimatedMinAmount > maxAmount 
          ? maxAmount 
          : recurrence.estimatedMinAmount
      });
    }
  };

  const handleSave = () => {
    if (!recurrence) {
      onSave({
        ...transaction,
        recurrence: null
      });
      return;
    }

    if (!recurrence.frequency) {
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
    setRecurrence({ 
      frequency: 'MONTHLY', 
      dateFlexibility: 'EXACT',
      rangeStart: null,
      rangeEnd: null,
      preference: null,
      isVariableAmount: false,
      estimatedMinAmount: null,
      estimatedMaxAmount: null
    });
  };

  // Get the appropriate flexibility options based on frequency
  const getFlexibilityOptions = () => {
    if (!recurrence || !recurrence.frequency) return DATE_FLEXIBILITY_OPTIONS.DEFAULT;
    
    switch (recurrence.frequency) {
      case 'MONTHLY':
        return DATE_FLEXIBILITY_OPTIONS.MONTHLY;
      case 'FOUR_WEEKLY':
        return DATE_FLEXIBILITY_OPTIONS.FOUR_WEEKLY;
      case 'BIWEEKLY':
        return DATE_FLEXIBILITY_OPTIONS.BIWEEKLY;
      case 'WEEKLY':
        return DATE_FLEXIBILITY_OPTIONS.WEEKLY;
      case 'YEARLY':
        return DATE_FLEXIBILITY_OPTIONS.YEARLY;
      default:
        return DATE_FLEXIBILITY_OPTIONS.DEFAULT;
    }
  };

  // Get range input labels based on frequency and flexibility
  const getRangeLabels = () => {
    if (recurrence.frequency === 'MONTHLY' && recurrence.dateFlexibility === 'CUSTOM_RANGE') {
      return {
        startLabel: 'Range Start (Day of Month)',
        endLabel: 'Range End (Day of Month)',
        startMin: 1,
        startMax: 28,
        endMin: 1,
        endMax: 31
      };
    } else if (recurrence.frequency === 'YEARLY' && recurrence.dateFlexibility === 'MONTH_RANGE') {
      return {
        startLabel: 'Start Month',
        endLabel: 'End Month',
        startMin: 1,
        startMax: 12,
        endMin: 1,
        endMax: 12
      };
    }
    return null;
  };

  // Render frequency-specific flexibility options
  const renderFlexibilityOptions = () => {
    if (!recurrence) return null;

    // Common flexibility selector for all frequency types
    const flexibilitySelector = (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {recurrence.frequency === 'WEEKLY' ? 'Day Flexibility' : 'Date Flexibility'}
        </label>
        <Select
          value={recurrence.dateFlexibility || 'EXACT'}
          onValueChange={handleDateFlexibilityChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${recurrence.frequency === 'WEEKLY' ? 'day' : 'date'} flexibility`} />
          </SelectTrigger>
          <SelectContent>
            {getFlexibilityOptions().map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );

    // Render range inputs if needed
    const rangeInputs = showRangeInputs && (
      <div className="space-y-4">
        {(() => {
          const labels = getRangeLabels();
          if (!labels) return null;
          
          return (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{labels.startLabel}</label>
                <Input
                  type="number"
                  min={labels.startMin}
                  max={labels.startMax}
                  value={recurrence.rangeStart || ''}
                  onChange={(e) => setRecurrence({ 
                    ...recurrence, 
                    rangeStart: parseInt(e.target.value) || labels.startMin 
                  })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{labels.endLabel}</label>
                <Input
                  type="number"
                  min={labels.endMin}
                  max={labels.endMax}
                  value={recurrence.rangeEnd || ''}
                  onChange={(e) => setRecurrence({ 
                    ...recurrence, 
                    rangeEnd: parseInt(e.target.value) || labels.endMin 
                  })}
                  className="h-8 text-sm"
                />
              </div>
            </>
          );
        })()}
      </div>
    );

    // Render preference selector for specific flexibility types
    const preferenceSelector = (() => {
      if (recurrence.frequency === 'WEEKLY' && recurrence.dateFlexibility === 'EXACT') {
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Day of Week</label>
            <Select
              value={recurrence.preference || getDayOfWeek(transaction.occurredOn)}
              onValueChange={(day) => setRecurrence({ ...recurrence, preference: day })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select day of week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONDAY">Monday</SelectItem>
                <SelectItem value="TUESDAY">Tuesday</SelectItem>
                <SelectItem value="WEDNESDAY">Wednesday</SelectItem>
                <SelectItem value="THURSDAY">Thursday</SelectItem>
                <SelectItem value="FRIDAY">Friday</SelectItem>
                <SelectItem value="SATURDAY">Saturday</SelectItem>
                <SelectItem value="SUNDAY">Sunday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      } else if (recurrence.frequency === 'YEARLY' && recurrence.dateFlexibility === 'SEASON') {
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Season</label>
            <Select
              value={recurrence.preference || 'SPRING'}
              onValueChange={(season) => setRecurrence({ 
                ...recurrence, 
                preference: season
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SPRING">Spring (Mar-May)</SelectItem>
                <SelectItem value="SUMMER">Summer (Jun-Aug)</SelectItem>
                <SelectItem value="FALL">Fall (Sep-Nov)</SelectItem>
                <SelectItem value="WINTER">Winter (Dec-Feb)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      }
      return null;
    })();

    return (
      <>
        {flexibilitySelector}
        {rangeInputs}
        {preferenceSelector}
      </>
    );
  };

  // Helper function to get day of week from date
  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()];
  };

  const getFrequencyLabel = (frequency) => {
    const option = RECURRENCE_OPTIONS.find(opt => opt.value === frequency);
    return option ? option.label : frequency;
  };

  // Render variable amount section
  const renderVariableAmountSection = () => {
    if (!recurrence) return null;

    return (
      <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Variable Amount</label>
          <Switch
            checked={recurrence.isVariableAmount || false}
            onCheckedChange={handleVariableAmountChange}
          />
        </div>
        
        {recurrence.isVariableAmount && (
          <div className="space-y-4 mt-2 p-3 bg-blue-50 rounded-md">
            <div className="text-sm text-blue-700">
              This transaction varies in amount each time it occurs.
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Minimum Amount ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={recurrence.estimatedMinAmount || ''}
                  onChange={(e) => handleMinAmountChange(e.target.value)}
                  className="h-8 text-sm"
                  placeholder={`${Math.abs(transaction.amount) * 0.8}`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Maximum Amount ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={recurrence.estimatedMaxAmount || ''}
                  onChange={(e) => handleMaxAmountChange(e.target.value)}
                  className="h-8 text-sm"
                  placeholder={`${Math.abs(transaction.amount) * 1.2}`}
                />
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mt-2">
              Tip: Set a typical range to help with budget planning. The current transaction amount is ${Math.abs(transaction.amount).toFixed(2)}.
            </div>
          </div>
        )}
      </div>
    );
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

              {/* Render frequency-specific flexibility options */}
              {renderFlexibilityOptions()}

              {/* Add variable amount section */}
              {renderVariableAmountSection()}

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
                This transaction is not set to recur.
              </div>
              <Button onClick={handleSetupRecurrence}>
                Set Up Recurrence
              </Button>
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