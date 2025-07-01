import { EmptyState as BaseEmptyState } from "@/components/ui/empty-state";
import { useNavigate } from 'react-router-dom';

export const EmptyState = ({ selectedDate }) => {
  const navigate = useNavigate();
  
  return (
    <BaseEmptyState
      title={`No Budget for ${selectedDate.format('MMMM YYYY')}`}
      description="Start tracking your spending by setting up category budgets"
      icon="💰"
      action={{
        label: "Configure Budget",
        onClick: () => navigate('/budget/configure')
      }}
    />
  );
}; 