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
    saveBudgetConfiguration,
    deleteBudgetConfiguration,
    copyBudgetFromPreviousMonth,
    existingBudgetId,
    isLoading
  } = useBudgetConfiguration(initialDate);

  const handleMonthChange = (newValue) => {
    setSelectedDate(moment(newValue));
  };

  const handleSave = async () => {
    const success = await saveBudgetConfiguration();
    if (success) {
      navigate(-1);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this budget configuration?')) {
      const success = await deleteBudgetConfiguration();
      if (success) {
        navigate(-1);
      }
    }
  };

  const handleCopyFromPrevious = async () => {
    await copyBudgetFromPreviousMonth();
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <MonthSelector 
              selectedDate={selectedDate}
              onMonthChange={handleMonthChange}
              showLabel={true}
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={handleCopyFromPrevious}
                disabled={isLoading}
                className="text-sm"
              >
                Copy from Previous Month
              </Button>
              {existingBudgetId && (
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="text-sm"
                >
                  Delete Budget
                </Button>
              )}
            </div>
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
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Saving...' : existingBudgetId ? 'Update Configuration' : 'Save Configuration'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetConfiguration;
