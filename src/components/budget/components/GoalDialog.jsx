import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { SumiButton } from '../../ui/sumi-button';
import { Input } from '../../ui/input';
import { goalsApi } from '@/api/goals';
import { useToast } from '../../ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Calendar } from '../../ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const GoalDialog = ({ open, onClose, initialGoal, onSaved }) => {
  const isEdit = !!initialGoal;
  console.log('initialGoal', initialGoal);
  // Helper function to format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().slice(0, 10); // YYYY-MM-DD format
    } catch {
      return '';
    }
  };
  
  const [form, setForm] = useState(() => {
    if (initialGoal) {
      return {
        name: initialGoal.name || '',
        description: initialGoal.description || '',
        target_amount: initialGoal.targetAmount?.toString() || '',
        current_amount: initialGoal.currentAmount?.toString() || '',
        deadline: formatDateForInput(initialGoal.deadline),
        create_temporary_category: false,
        temporary_category_name: '',
      };
    }
    return {
      name: '',
      description: '',
      target_amount: '',
      current_amount: '',
      deadline: '',
      create_temporary_category: false,
      temporary_category_name: '',
    };
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog opens or initialGoal changes
  useEffect(() => {
    if (open) {
      if (initialGoal) {
        setForm({
          name: initialGoal.name || '',
          description: initialGoal.description || '',
          target_amount: initialGoal.targetAmount?.toString() || '',
          current_amount: initialGoal.currentAmount?.toString() || '',
          deadline: formatDateForInput(initialGoal.deadline),
          create_temporary_category: false,
          temporary_category_name: '',
        });
      } else {
        setForm({
          name: '',
          description: '',
          target_amount: '',
          current_amount: '',
          deadline: '',
          create_temporary_category: false,
          temporary_category_name: '',
        });
      }
    }
  }, [open, initialGoal]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let deadlineValue = form.deadline || null;
      if (deadlineValue && /^\d{4}-\d{2}-\d{2}$/.test(deadlineValue)) {
        // Convert date to ISO datetime string
        deadlineValue = `${deadlineValue}T00:00:00Z`;
      }
      const payload = {
        ...form,
        target_amount: Number(form.target_amount),
        current_amount: Number(form.current_amount || 0),
        deadline: deadlineValue,
      };
      if (isEdit) {
        await goalsApi.update(initialGoal.id, payload);
        toast({ title: 'Goal updated', description: form.name });
      } else {
        await goalsApi.create(payload);
        toast({ title: 'Goal created', description: form.name });
      }
      onSaved?.();
      onClose();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save goal', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update your savings goal details below.' : 'Fill out the form to create a new savings goal.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Goal Name</label>
            <Input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input name="description" value={form.description} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Amount</label>
            <Input name="target_amount" type="number" value={form.target_amount} onChange={handleChange} required min={1} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Current Amount Saved</label>
            <Input name="current_amount" type="number" value={form.current_amount} onChange={handleChange} min={0} max={form.target_amount} placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Deadline</label>
            <Popover>
              <PopoverTrigger asChild>
                <SumiButton
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.deadline ? 
                    (() => {
                      try {
                        const date = new Date(form.deadline);
                        return isNaN(date.getTime()) ? 'Pick a date' : date.toLocaleDateString();
                      } catch {
                        return 'Pick a date';
                      }
                    })() : <span>Pick a date</span>
                  }
                </SumiButton>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.deadline ? (() => {
                    try {
                      const date = new Date(form.deadline);
                      return isNaN(date.getTime()) ? undefined : date;
                    } catch {
                      return undefined;
                    }
                  })() : undefined}
                  onSelect={(date) => setForm(f => ({ ...f, deadline: date ? date.toISOString().slice(0, 10) : '' }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="create_temporary_category" checked={form.create_temporary_category} onChange={handleChange} id="temp-cat" />
            <label htmlFor="temp-cat" className="text-sm">Create a temporary category for this goal</label>
          </div>
          {form.create_temporary_category && (
            <div>
              <label className="block text-sm font-medium mb-1">Temporary Category Name</label>
              <Input name="temporary_category_name" value={form.temporary_category_name} onChange={handleChange} placeholder="e.g. Vacation Savings" />
            </div>
          )}
          <div className="flex gap-2 justify-end mt-4">
            <SumiButton type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</SumiButton>
            <SumiButton type="submit" loading={loading} disabled={loading}>{isEdit ? 'Save Changes' : 'Create Goal'}</SumiButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalDialog; 