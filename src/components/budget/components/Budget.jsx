import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useBudget } from '../hooks/useBudget';
import { BudgetCategory } from './BudgetCategory';
import { EmptyState } from './EmptyState';
import moment from 'moment';
import { MonthSelector } from './MonthSelector';

const Budget = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    budgets, 
    selectedDate, 
    setSelectedDate 
  } = useBudget();

  const handleMonthChange = (value) => {
    const [year, month] = value.split('-');
    setSelectedDate(moment().year(year).month(month - 1));
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
      <div className="flex-none p-6 bg-white">
        <div className="w-full">
          <div className="flex justify-between items-baseline mb-4">
            <div className="flex items-center gap-4">
              <MonthSelector 
                selectedDate={selectedDate} 
                onMonthChange={handleMonthChange} 
              />
              <h2 className="text-2xl font-bold">
                {selectedDate.format('MMMM YYYY')}
              </h2>
            </div>
            <Button 
              variant="outline" 
              className="text-sm"
              onClick={handleConfigureClick}
            >
              Configure Budget
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
      </div>
    </div>
  );
};

export default Budget;