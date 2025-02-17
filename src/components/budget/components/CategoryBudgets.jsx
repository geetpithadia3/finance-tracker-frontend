import React from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";

const CategoryBudgets = ({ categories, budgets, onBudgetChange }) => {
  return (
    <Card className="p-4">
      <h3 className="text-xl font-semibold mb-4">Category Budgets</h3>
      <ScrollArea className="h-[calc(100vh-24rem)] pr-4">
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2">
              <div className="min-w-[150px]">
                <h4 className="font-medium">{category.name}</h4>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto max-w-[200px]">
                <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  type="number"
                  value={budgets[category.name] || ''}
                  onChange={(e) => onBudgetChange(category.name, e.target.value)}
                  className="w-full"
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