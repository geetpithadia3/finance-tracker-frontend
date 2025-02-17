import React from 'react';
import { Card } from "@/components/ui/card";
import { PiggyBank } from "lucide-react";

const BudgetSummary = ({ totalBudget }) => {
  return (
    <Card className="p-6">
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="flex items-center gap-4">
          <PiggyBank className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Total Budgeted Amount</h3>
            <p className="text-2xl font-bold">${totalBudget.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BudgetSummary; 