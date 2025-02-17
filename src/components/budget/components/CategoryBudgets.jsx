import React from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { DollarSign } from "lucide-react";

const CategoryBudgets = ({ categories, budgets, onBudgetChange }) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">Category Budgets</h3>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between py-2">
              <div>
                <h4 className="font-medium">{category.name}</h4>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={budgets[category.name] || ''}
                  onChange={(e) => onBudgetChange(category.name, e.target.value)}
                  className="w-32"
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