import React, { useState, useEffect, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { getAuthHeaders } from '../utils/auth';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { use } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Budget = () => {
  const { toast } = useToast();
  const [budgets, setBudgets] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [estimatedIncome, setEstimatedIncome] = useState(0);
  const [actualIncome, setActualIncome] = useState(0);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(moment());
  
  const currentYearMonth = useMemo(() => 
    selectedDate.format('YYYY-MM'),
    [selectedDate.format('YYYY-MM')]
  );

  useEffect(() => {
    fetchBudgets();
    fetchEstimatedIncome();
  }, [selectedDate]);

  const fetchEstimatedIncome = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/income-sources`,
        { headers: getAuthHeaders() }
      );
      const data = await response.json();
      
      const monthlyTotal = data.reduce((acc, source) => {
        if (source.isDeleted) return acc;
        
        switch (source.payFrequency) {
          case 'MONTHLY':
            return acc + source.payAmount;
          case 'BI_WEEKLY':
            // Bi-weekly (26 payments per year) to monthly conversion
            return acc + (source.payAmount * 26 / 12);
          case 'WEEKLY':
            // Weekly (52 payments per year) to monthly conversion
            return acc + (source.payAmount * 52 / 12);
          case 'SEMI_MONTHLY':
            // Semi-monthly (24 payments per year) to monthly conversion
            return acc + (source.payAmount * 2);
          default:
            return acc;
        }
      }, 0);

      setEstimatedIncome(monthlyTotal);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load estimated income",
        variant: "destructive",
      });
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/budgets?yearMonth=${currentYearMonth}`,
        { headers: getAuthHeaders() }
      );
      const data = await response.json();
      
      if (data && data.categories && data.categories.length > 0) {
        const filteredCategories = data.categories.filter(cat => cat.categoryName !== 'Income');
        setBudgets(filteredCategories);
        const total = filteredCategories.reduce((acc, budget) => acc + budget.limit, 0);
        const spent = filteredCategories.reduce((acc, budget) => acc + budget.spent, 0);
        
        const incomeCategory = data.categories.find(cat => cat.categoryName === 'Income');
        setTotalBudget(total);
        setTotalSpent(spent);
        setActualIncome(incomeCategory ? incomeCategory.spent : (data.actualIncome || 0));
      } else {
        setBudgets([]);
        setTotalBudget(0);
        setTotalSpent(0);
        setActualIncome(0);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load budgets",
        variant: "destructive",
      });
    }
  };

  const EmptyState = () => (
    <Card className="p-6 text-center">
      <h3 className="text-lg font-semibold mb-2">No Budget for {selectedDate.format('MMMM YYYY')}</h3>
      <p className="text-muted-foreground mb-4">
        Start tracking your spending by setting up category budgets
      </p>
      <Button onClick={() => navigate('/budget/configure')}>
        Configure Budget
      </Button>
    </Card>
  );

  const BudgetCategory = ({ categoryName, limit, spent }) => {
    const remaining = limit - spent;
    const percentageUsed = (spent / limit) * 100;
    const isOverBudget = spent > limit;

    return (
      <Card className="p-3 hover:bg-gray-50 transition-colors">
        <div className="flex justify-between items-center mb-1.5">
          <h3 className="text-sm font-medium">{categoryName}</h3>
          <span className={`text-xs font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
            ${Math.abs(remaining).toFixed(2)} {isOverBudget ? 'over' : 'left'}
          </span>
        </div>
        <Progress 
          value={percentageUsed > 100 ? 100 : percentageUsed} 
          className={`h-1 ${isOverBudget ? 'bg-red-100 [&>div]:bg-red-500' : ''}`}
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-gray-600">
            ${spent.toFixed(2)}
          </span>
          <span className="text-xs text-gray-600">
            ${limit.toFixed(2)}
          </span>
        </div>
      </Card>
    );
  };

  const handleMonthChange = (value) => {
    const [year, month] = value.split('-');
    setSelectedDate(moment().year(year).month(month - 1));
  };

  if (budgets.length === 0) {
    return <EmptyState />;
  }

  const percentageSpent = (totalSpent / totalBudget) * 100;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50">
      <div className="flex-none p-6 bg-white border-b">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-baseline mb-4">
            <div className="flex items-center gap-4">
              <Select
                value={selectedDate.format('YYYY-MM')}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = moment().subtract(i, 'months');
                    return (
                      <SelectItem key={date.format('YYYY-MM')} value={date.format('YYYY-MM')}>
                        {date.format('MMMM YYYY')}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <h2 className="text-2xl font-bold">
                {selectedDate.format('MMMM YYYY')}
              </h2>
            </div>
            <Button 
              variant="outline" 
              className="text-sm"
              onClick={() => navigate('/budget/configure')}
            >
              Configure Budget
            </Button>
          </div>
          
          {budgets.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-medium">Monthly Income</span>
                    <span className="text-sm text-gray-600">
                      ${actualIncome.toFixed(2)} of ${estimatedIncome.toFixed(2)}
                    </span>
                  </div>
                  <Progress 
                    value={(actualIncome / estimatedIncome) * 100} 
                    className="h-2 mb-1"
                  />
                  <div className="flex justify-end">
                    <span className={`text-sm ${actualIncome >= estimatedIncome ? 'text-green-600' : 'text-yellow-600'}`}>
                      ${Math.abs(estimatedIncome - actualIncome).toFixed(2)} 
                      {actualIncome >= estimatedIncome ? ' over target' : ' below target'}
                    </span>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-medium">Total Progress</span>
                    <span className="text-sm text-gray-600">
                      ${totalSpent.toFixed(2)} of ${totalBudget.toFixed(2)}
                    </span>
                  </div>
                  <Progress 
                    value={percentageSpent > 100 ? 100 : percentageSpent} 
                    className={`h-2 mb-1 ${percentageSpent > 100 ? 'bg-red-100 [&>div]:bg-red-500' : ''}`}
                  />
                  <div className="flex justify-end">
                    <span className={`text-sm ${percentageSpent > 100 ? 'text-red-600' : 'text-green-600'}`}>
                      ${Math.abs(totalBudget - totalSpent).toFixed(2)} 
                      {percentageSpent > 100 ? ' over budget' : ' remaining'}
                    </span>
                  </div>
                </Card>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budget;