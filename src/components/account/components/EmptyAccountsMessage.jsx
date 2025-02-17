import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

export const EmptyAccountsMessage = ({ onAddAccount }) => {
  return (
    <div className="text-center p-8">
      <h3 className="text-lg font-semibold mb-2">No accounts yet? No worries! 🌱</h3>
      <p className="text-muted-foreground mb-4">Time to plant your money tree</p>
      <Button onClick={onAddAccount}>
        <Plus className="mr-2 h-4 w-4" />
        Plant Your First Account
      </Button>
    </div>
  );
}; 