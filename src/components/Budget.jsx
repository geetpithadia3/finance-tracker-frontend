import React, { useState, useEffect, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { budgetsApi } from '../api/budgets';

const Budget = () => {
  const { toast } = useToast();
  const [budgets, setBudgets] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(moment());
  
  const currentYearMonth = useMemo(() => 
    selectedDate.format('YYYY-MM'),
    [selectedDate.format('YYYY-MM')]
  );

  useEffect(() => {
    fetchBudgets();
  }, [selectedDate]);

  const fetchBudgets = async () => {
    try {
      const data = await budgetsApi.get(currentYearMonth);
      
      if (data && data.categories && data.categories.length > 0) {
        const filteredCategories = data.categories.filter(cat => cat.categoryName !== 'Income');
        setBudgets(filteredCategories);
        const total = filteredCategories.reduce((acc, budget) => acc + budget.limit, 0);
        const spent = filteredCategories.reduce((acc, budget) => acc + budget.spent, 0);
        
        setTotalBudget(total);
        setTotalSpent(spent);
      } else {
        setBudgets([]);
        setTotalBudget(0);
        setTotalSpent(0);
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
          
          <div className="grid grid-cols-2 gap-4">
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