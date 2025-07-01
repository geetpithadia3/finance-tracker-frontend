import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export function MonthSelector({ 
  value, 
  onChange, 
  className = "",
  showTodayButton = true,
  size = "default" // "default" | "compact" | "large"
}) {
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

  // Size configurations
  const sizeConfig = {
    compact: {
      buttonSize: "icon",
      buttonClass: "h-8 w-8",
      iconSize: "h-3 w-3",
      textClass: "text-sm font-medium",
      minWidth: "min-w-[120px]",
      gap: "gap-1"
    },
    default: {
      buttonSize: "icon",
      buttonClass: "h-9 w-9",
      iconSize: "h-4 w-4",
      textClass: "text-lg font-medium",
      minWidth: "min-w-[140px]",
      gap: "gap-3"
    },
    large: {
      buttonSize: "icon",
      buttonClass: "h-10 w-10",
      iconSize: "h-5 w-5",
      textClass: "text-xl font-medium",
      minWidth: "min-w-[160px]",
      gap: "gap-4"
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={cn("flex items-center", config.gap, className)}>
      <Button
        variant="outline"
        size={config.buttonSize}
        className={cn(config.buttonClass, "border-border hover:bg-muted")}
        onClick={() => navigateMonth('prev')}
        aria-label="Previous month"
      >
        <ChevronLeft className={config.iconSize} />
      </Button>
      
      <div className="flex items-center gap-2">
        <div className={cn(
          config.textClass,
          config.minWidth,
          "text-center text-foreground flex items-center justify-center gap-2"
        )}>
          <Calendar className={cn(config.iconSize, "text-muted-foreground")} />
          {formatMonthDisplay(value)}
        </div>
        {showTodayButton && !isCurrentMonth() && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToCurrentMonth}
            className="text-xs h-7 px-2 border-border hover:bg-muted"
          >
            Today
          </Button>
        )}
      </div>
      
      <Button
        variant="outline"
        size={config.buttonSize}
        className={cn(config.buttonClass, "border-border hover:bg-muted")}
        onClick={() => navigateMonth('next')}
        aria-label="Next month"
      >
        <ChevronRight className={config.iconSize} />
      </Button>
    </div>
  );
}

export default MonthSelector; 