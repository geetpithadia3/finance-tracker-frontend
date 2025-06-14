import React from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";

const CategoryBudgets = ({ categories, budgets, onBudgetChange }) => {
  return (
    <Card className="p-2 sm:p-4 w-full max-w-full">
      <h3 className="text-base sm:text-xl font-semibold mb-2 sm:mb-4">Category Budgets</h3>
      <ScrollArea className="h-[calc(100vh-24rem)] pr-2 sm:pr-4 w-full max-w-full">
        <div className="space-y-2 sm:space-y-4 w-full max-w-full">
          {categories.map((category) => (
            <div key={category.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 py-1 sm:py-2 w-full max-w-full">
              <div className="min-w-[100px] sm:min-w-[150px]">
                <h4 className="font-medium text-xs sm:text-sm">{category.name}</h4>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto max-w-[120px] sm:max-w-[200px]">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                <Input
                  type="number"
                  value={budgets[category.name] || ''}
                  onChange={(e) => onBudgetChange(category.name, e.target.value)}
                  className="w-full text-xs sm:text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default CategoryBudgets; 