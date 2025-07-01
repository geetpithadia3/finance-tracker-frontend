import { EmptyState as BaseEmptyState } from "@/components/ui/empty-state";

export const EmptyState = ({ selectedDate }) => {
  return (
    <BaseEmptyState
      title="No Transactions Yet!"
      description={`Your financial story for ${selectedDate.format('MMMM YYYY')} is waiting to be written. Transactions will show up here once you import or add them.`}
      icon="💸"
    />
  );
};
