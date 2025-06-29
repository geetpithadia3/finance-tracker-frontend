import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { AlertTriangle, Calendar, DollarSign, Edit } from 'lucide-react';

export function BudgetOverlapDialog({ 
  isOpen, 
  onClose, 
  conflictData, 
  onEditExisting,
  onForceCreate 
}) {
  if (!conflictData) return null;

  const formatPeriod = (period) => {
    if (period.includes(' to ')) {
      // Project budget format: "2024-01-01 to 2024-03-31"
      const [start, end] = period.split(' to ');
      return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
    } else {
      // Monthly budget format: "2024-01"
      const [year, month] = period.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  };

  const getBudgetTypeIcon = (type) => {
    return type === 'monthly' ? <Calendar className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />;
  };

  const getBudgetTypeLabel = (type) => {
    return type === 'monthly' ? 'Monthly Budget' : 'Project Budget';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            Budget Overlap Detected
          </DialogTitle>
          <DialogDescription>
            Some categories are already budgeted for overlapping periods. 
            You can edit the existing budgets or force create the new budget.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {conflictData.overlapping_categories.map((categoryConflict, index) => (
            <Card key={index} className="border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-lg">{categoryConflict.category_name}</h4>
                  <Badge variant="outline" className="text-orange-700 border-orange-300">
                    {categoryConflict.conflicts.length} Conflict{categoryConflict.conflicts.length > 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {categoryConflict.conflicts.map((conflict, conflictIndex) => (
                    <div 
                      key={conflictIndex}
                      className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getBudgetTypeIcon(conflict.type)}
                          <span className="font-medium text-sm">
                            {getBudgetTypeLabel(conflict.type)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{conflict.budget_name}</p>
                        <p className="text-xs text-gray-500">
                          Period: {formatPeriod(conflict.period)}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                          ${conflict.allocated_amount.toFixed(2)}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditExisting(conflict)}
                          className="mt-1 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {onForceCreate && (
            <Button 
              variant="destructive" 
              onClick={onForceCreate}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Force Create Anyway
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}