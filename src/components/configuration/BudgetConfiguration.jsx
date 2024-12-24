import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { getAuthHeaders } from '@/utils/auth';
import { 
  DollarSign, 
  ArrowLeft, 
  PiggyBank,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import moment from 'moment';

const BudgetConfiguration = ({ selectedDate: initialDate }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [totalBudget, setTotalBudget] = useState(0);
  const [estimatedIncome, setEstimatedIncome] = useState(0);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      fetchExistingBudgets();
      fetchEstimatedIncome();
    }
  }, [categories, selectedDate]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/budgets/categories', {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.filter(category => category.isActive));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const fetchExistingBudgets = async () => {
    try {
      if (categories.length === 0) return;

      const response = await fetch(
        `http://localhost:8080/budgets?yearMonth=${selectedDate.format('YYYY-MM')}`,
        { headers: getAuthHeaders() }
      );
      if (!response.ok) throw new Error('Failed to fetch budgets');
      const data = await response.json();
      
      const budgetMap = {};
      categories.forEach(category => {
        budgetMap[category.name] = 0;
      });

      if (data.categories) {
        data.categories.forEach(budget => {
          const category = categories.find(c => c.id === budget.categoryId);
          if (category) {
            budgetMap[category.name] = parseFloat(budget.limit) || 0;
          }
        });
      }
      
      setBudgets(budgetMap);
      
      const total = Object.values(budgetMap).reduce((sum, amount) => sum + parseFloat(amount || 0), 0);
      setTotalBudget(total);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load existing budgets",
        variant: "destructive",
      });
    }
  };

  const fetchEstimatedIncome = async () => {
    try {
      const response = await fetch('http://localhost:8080/income-sources', {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch income');
      const data = await response.json();
      
      const monthlyTotal = data.reduce((total, income) => {
        const amount = parseFloat(income.payAmount) || 0;
        switch (income.payFrequency) {
          case 'WEEKLY': return total + (amount * 52) / 12;
          case 'BI_WEEKLY': return total + (amount * 26) / 12;
          case 'SEMI_MONTHLY': return total + (amount * 24) / 12;
          case 'MONTHLY': return total + amount;
          default: return total;
        }
      }, 0);
      
      setEstimatedIncome(monthlyTotal);
    } catch (error) {
      console.error('Error fetching income:', error);
    }
  };

  const handleBudgetChange = (category, value) => {
    const newBudgets = { ...budgets };
    newBudgets[category] = parseFloat(value) || 0;
    setBudgets(newBudgets);
    
    const total = Object.values(newBudgets).reduce((sum, amount) => sum + amount, 0);
    setTotalBudget(total);
  };

  const handleSave = async () => {
    try {
      const budgetData = {
        yearMonth: selectedDate.format('YYYY-MM'),
        categoryLimits: categories.map(category => ({
          categoryId: category.id,
          budgetAmount: parseFloat(budgets[category.name] || 0)
        }))
      };

      const response = await fetch('http://localhost:8080/budgets', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData)
      });

      if (!response.ok) throw new Error('Failed to save budgets');

      toast({
        title: "Success",
        description: "Budget configuration saved successfully",
      });
      
      navigate(-1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save budget configuration",
        variant: "destructive",
      });
    }
  };

  const getMonthOptions = () => {
    const options = [];
    const currentMonth = moment();
    
    for (let i = -3; i <= 12; i++) {
      const monthOption = moment().add(i, 'months');
      options.push({
        value: monthOption.format('YYYY-MM'),
        label: monthOption.format('MMMM YYYY')
      });
    }
    return options;
  };

  const handleMonthChange = (newValue) => {
    setSelectedDate(moment(newValue, 'YYYY-MM'));
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      

      <div className="grid gap-6">
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Budget applicable from</h3>
            <Select
              value={selectedDate.format('YYYY-MM')}
              onValueChange={handleMonthChange}
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

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Estimated Monthly Income</h3>
                <p className="text-2xl font-bold">${estimatedIncome.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <PiggyBank className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Total Budgeted Amount</h3>
                <p className="text-2xl font-bold">${totalBudget.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Progress</span>
              <span>{((totalBudget / estimatedIncome) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-4 bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all",
                  totalBudget > estimatedIncome ? "bg-destructive" : "bg-primary"
                )}
                style={{ 
                  width: `${Math.min((totalBudget / estimatedIncome) * 100, 100)}%`
                }}
              />
            </div>
            {totalBudget > estimatedIncome && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>Budget exceeds estimated income</span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Category Budgets</h3>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    {budgets[category.name] > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {((budgets[category.name] / totalBudget) * 100).toFixed(1)}% of total budget
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={budgets[category.name] || ''}
                      onChange={(e) => handleBudgetChange(category.name, e.target.value)}
                      className="w-32"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
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