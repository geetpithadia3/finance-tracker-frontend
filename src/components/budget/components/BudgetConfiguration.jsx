import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { MonthSelector } from './MonthSelector';
import BudgetSummary from './BudgetSummary';
import CategoryBudgets from './CategoryBudgets';
import { useBudgetConfiguration } from '../hooks/useBudgetConfiguration';
import moment from 'moment';

const BudgetConfiguration = ({ selectedDate: initialDate }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    categories,
    budgets,
    totalBudget,
    selectedDate,
    setSelectedDate,
    handleBudgetChange,
    saveBudgetConfiguration
  } = useBudgetConfiguration(initialDate);

  const handleMonthChange = (newValue) => {
    setSelectedDate(moment(newValue));
  };

  const handleSave = async () => {
    const success = await saveBudgetConfiguration();
    if (success) {
      toast({
        title: "Success",
        description: "Budget configuration saved successfully",
      });
      navigate(-1);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <MonthSelector 
              selectedDate={selectedDate}
              onMonthChange={handleMonthChange}
              showLabel={true}
            />
          </div>
          
          <BudgetSummary totalBudget={totalBudget} />
          
          <CategoryBudgets
            categories={categories}
            budgets={budgets}
            onBudgetChange={handleBudgetChange}
          />

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 sticky bottom-0 bg-white p-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="w-full sm:w-auto"
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetConfiguration;
