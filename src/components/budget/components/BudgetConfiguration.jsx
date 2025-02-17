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
    <div className="container mx-auto py-6 space-y-8">
      <div className="grid gap-6">
        <MonthSelector 
          selectedDate={selectedDate}
          onMonthChange={handleMonthChange}
          showLabel={true}
        />
        
        <BudgetSummary totalBudget={totalBudget} />
        
        <CategoryBudgets
          categories={categories}
          budgets={budgets}
          onBudgetChange={handleBudgetChange}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default BudgetConfiguration;
