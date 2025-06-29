import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const AddAccountDialog = ({ isOpen, onClose, onSave, account, onAccountChange }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name">Name</label>
            <Input
              id="name"
              value={account?.name}
              onChange={(e) => onAccountChange({ ...account, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label>Initial Balance</label>
            <Input
              type="number"
              value={account?.initialBalance}
              onChange={(e) => onAccountChange({ ...account, initialBalance: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label>Currency</label>
            <Input
              value={account?.currency}
              disabled
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 