import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const BudgetCategory = ({ categoryName, limit, spent }) => {
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