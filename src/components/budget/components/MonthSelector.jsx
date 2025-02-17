import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import moment from 'moment';

const MonthSelector = ({ selectedDate, onMonthChange, showLabel = false }) => {
  const getMonthOptions = () => {
    const options = [];
    for (let i = -3; i <= 12; i++) {
      const monthOption = moment().add(i, 'months');
      options.push({
        value: monthOption.format('YYYY-MM'),
        label: monthOption.format('MMMM YYYY')
      });
    }
    return options;
  };

  return (
    <div className={showLabel ? "mb-6" : ""}>
      {showLabel && (
        <h3 className="font-semibold mb-2">Budget applicable from</h3>
      )}
      <Select
        value={selectedDate.format('YYYY-MM')}
        onValueChange={onMonthChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select month" />
        </SelectTrigger>
        <SelectContent>
          {getMonthOptions().map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { MonthSelector }; 