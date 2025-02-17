import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

export const EmptyState = ({ selectedDate }) => {
  const navigate = useNavigate();
  
  return (
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
}; 