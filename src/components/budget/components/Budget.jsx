import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { useBudget } from '../hooks/useBudget';
import { BudgetCategory } from './BudgetCategory';
import { EmptyState } from './EmptyState';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Budget = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    budgets,
    selectedDate,
    setSelectedDate
  } = useBudget();

  const handleMonthChange = (direction) => {
    setSelectedDate(prev => prev.clone().add(direction, 'months'));
  };

  const handleConfigureClick = () => {
    toast({
      title: "Budget Workshop Time! 🛠️",
      description: "Let's craft the perfect budget for your money goals!",
    });
    navigate('/budget/configure');
  };

  if (budgets.length === 0) {
    return <EmptyState selectedDate={selectedDate} />;
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col bg-white">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => handleMonthChange(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-medium min-w-[160px] text-center">
            {selectedDate.format('MMMM YYYY')}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => handleMonthChange(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          className="text-sm w-full sm:w-auto"
          onClick={handleConfigureClick}
        >
          Configure Budget
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-4">
        {budgets.map((budget) => (
          <BudgetCategory
            key={budget.categoryId}
            categoryName={budget.categoryName}
            limit={budget.limit}
            spent={budget.spent}
          />
        ))}
      </div>
    </div>
  );
};

export default Budget;