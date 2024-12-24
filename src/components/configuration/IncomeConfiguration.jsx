import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { getAuthHeaders } from '@/utils/auth';

const IncomeConfiguration = () => {
  const { toast } = useToast();
  const [incomes, setIncomes] = useState([{
    id: 1,
    payAmount: '',
    nextPayDate: new Date(),
    payFrequency: 'BI_WEEKLY',
  }]);
  const [deletedIncomes, setDeletedIncomes] = useState([]);
  const [estimatedMonthlyIncome, setEstimatedMonthlyIncome] = useState(0);

  useEffect(() => {
    const fetchIncomeSources = async () => {
      try {
        const response = await fetch('http://localhost:8080/income-sources', {
          headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch income sources');
        const data = await response.json();
        setIncomes(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load income sources",
          variant: "destructive",
        });
      }
    };

    fetchIncomeSources();
  }, []);

  useEffect(() => {
    const calculateMonthlyTotal = () => {
      return incomes.reduce((total, income) => {
        const amount = parseFloat(income.payAmount) || 0;
        switch (income.payFrequency) {
          case 'WEEKLY':
            return total + (amount * 52) / 12;
          case 'BI_WEEKLY':
            return total + (amount * 26) / 12;
          case 'SEMI_MONTHLY':
            return total + (amount * 24) / 12;
          case 'MONTHLY':
            return total + amount;
          default:
            return total;
        }
      }, 0);
    };

    setEstimatedMonthlyIncome(calculateMonthlyTotal());
  }, [incomes]);

  const removeIncome = (index) => {
    if (incomes.length > 1) {
      const incomeToRemove = incomes[index];
      if (incomeToRemove.id) {
        setDeletedIncomes([...deletedIncomes, incomeToRemove.id]);
      }
      setIncomes(incomes.filter((_, i) => i !== index));
    }
  };

  const handleIncomeChange = (index, field, value) => {
    const updatedIncomes = incomes.map((income, i) => {
      if (i === index) {
        return { ...income, [field]: value };
      }
      return income;
    });
    setIncomes(updatedIncomes);
  };

  const handleSave = async () => {
    try {
      // Delete removed incomes
      for (const id of deletedIncomes) {
        await fetch(`http://localhost:8080/income-sources/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
      }

      // Update or create income sources
      for (const income of incomes) {
        const method = income.id ? 'PUT' : 'POST';
        const url = income.id 
          ? `http://localhost:8080/income-sources/${income.id}`
          : 'http://localhost:8080/income-sources';

        const response = await fetch(url, {
          method,
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payAmount: income.payAmount,
            nextPayDate: income.nextPayDate,
            payFrequency: income.payFrequency,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to ${income.id ? 'update' : 'create'} income source`);
        }
      }

      // Clear deleted incomes after successful save
      setDeletedIncomes([]);
      
      // Refresh data
      const response = await fetch('http://localhost:8080/income-sources', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setIncomes(data);
      }

      toast({
        title: "Success",
        description: "Income sources saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save income sources",
        variant: "destructive",
      });
    }
  };

  const addIncome = () => {
    const newIncome = {
      payAmount: '',
      nextPayDate: new Date(),
      payFrequency: 'BI_WEEKLY',
    };
    setIncomes([...incomes, newIncome]);
  };

  return (
    <div className="space-y-4">
      {incomes.map((income, index) => (
        <div key={index} className="space-y-4 p-4 border rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Income Source {index + 1}</h3>
            {incomes.length > 1 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => removeIncome(index)}
              >
                Remove
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor={`payFrequency-${index}`}>Pay Frequency</label>
            <select
              id={`payFrequency-${index}`}
              value={income.payFrequency}
              onChange={(e) => handleIncomeChange(index, 'payFrequency', e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="WEEKLY">Weekly</option>
              <option value="BI_WEEKLY">Bi-weekly</option>
              <option value="SEMI_MONTHLY">Semi-monthly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor={`payAmount-${index}`}>Pay Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <Input
                id={`payAmount-${index}`}
                type="number"
                value={income.payAmount}
                onChange={(e) => handleIncomeChange(index, 'payAmount', e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label>Next Pay Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !income.nextPayDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {income.nextPayDate ? format(new Date(income.nextPayDate), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={new Date(income.nextPayDate)}
                  onSelect={(date) => handleIncomeChange(index, 'nextPayDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      ))}

      <Button 
        onClick={addIncome}
        variant="outline"
        className="w-full"
      >
        Add Another Income Source
      </Button>

      <div className="mt-4 p-4 bg-muted rounded-lg">
        <p className="text-sm font-medium">
          Estimated Monthly Income: ${estimatedMonthlyIncome.toFixed(2)}
        </p>
      </div>

      <div className="pt-4">
        <Button 
          onClick={handleSave}
          className="w-full"
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default IncomeConfiguration;
