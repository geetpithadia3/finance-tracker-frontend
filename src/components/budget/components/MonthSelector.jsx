import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../ui/button';

export function MonthSelector({ value, onChange }) {
  const formatMonthDisplay = (yearMonth) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction) => {
    const [year, month] = value.split('-').map(Number);
    const currentDate = new Date(year, month - 1);
    
    if (direction === 'prev') {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    const newYear = currentDate.getFullYear();
    const newMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    onChange(`${newYear}-${newMonth}`);
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    onChange(`${year}-${month}`);
  };

  const isCurrentMonth = () => {
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return value === currentYearMonth;
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigateMonth('prev')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2">
        <span className="font-medium text-lg min-w-[140px] text-center">
          {formatMonthDisplay(value)}
        </span>
        {!isCurrentMonth() && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToCurrentMonth}
            className="text-xs"
          >
            Today
          </Button>
        )}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigateMonth('next')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}