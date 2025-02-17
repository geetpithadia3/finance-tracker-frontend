import { Card } from "@/components/ui/card";

export const EmptyState = ({ selectedDate }) => {
  return (
    <Card className="p-6 text-center mt-4">
      <h3 className="text-lg font-semibold mb-2">No Transactions Yet! 💸</h3>
      <p className="text-muted-foreground mb-4">
        Your financial story for {selectedDate.format('MMMM YYYY')} is waiting to be written. 
        Transactions will show up here once you import or add them.
      </p>
    </Card>
  );
};
