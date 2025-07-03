import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Trash2, Plus } from 'lucide-react';
import { categoriesApi } from '../../../api/categories';

export function BudgetForm({ initialData, onSubmit, onCancel, isEditing = false, yearMonth }) {
  const [categories, setCategories] = useState([]);
  const [categoryLimits, setCategoryLimits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData && initialData.category_limits) {
      setCategoryLimits(initialData.category_limits.map(limit => ({
        category_id: limit.category_id,
        budget_amount: limit.budget_amount,
        rollover_enabled: limit.rollover_enabled || false,
      })));
    }
  }, [initialData]);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const addCategoryLimit = () => {
    setCategoryLimits([
      ...categoryLimits,
      { 
        category_id: '', 
        budget_amount: 0,
        rollover_enabled: false,
      }
    ]);
  };

  const removeCategoryLimit = (index) => {
    setCategoryLimits(categoryLimits.filter((_, i) => i !== index));
  };

  const updateCategoryLimit = (index, field, value) => {
    const updated = [...categoryLimits];
    updated[index] = { ...updated[index], [field]: value };
    setCategoryLimits(updated);
    
    // Clear error for this field
    if (errors[`category_${index}_${field}`]) {
      setErrors({ ...errors, [`category_${index}_${field}`]: undefined });
    }
  };

  const applyRolloverToAll = (field, value) => {
    const updated = categoryLimits.map(limit => ({
      ...limit,
      [field]: value
    }));
    setCategoryLimits(updated);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (categoryLimits.length === 0) {
      newErrors.general = 'At least one category limit is required';
    }

    categoryLimits.forEach((limit, index) => {
      if (!limit.category_id) {
        newErrors[`category_${index}_category_id`] = 'Category is required';
      }
      if (!limit.budget_amount || limit.budget_amount <= 0) {
        newErrors[`category_${index}_budget_amount`] = 'Budget amount must be greater than 0';
      }
    });

    // Check for duplicate categories
    const categoryIds = categoryLimits.map(l => l.category_id).filter(Boolean);
    const duplicates = categoryIds.filter((id, index) => categoryIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      duplicates.forEach(id => {
        const indices = categoryLimits.map((l, i) => l.category_id === id ? i : null).filter(i => i !== null);
        indices.forEach(index => {
          newErrors[`category_${index}_category_id`] = 'Duplicate category';
        });
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        year_month: yearMonth,
        category_limits: categoryLimits.map(limit => ({
          category_id: limit.category_id,
          budget_amount: parseFloat(limit.budget_amount),
          rollover_enabled: limit.rollover_enabled || false,
        }))
      });
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const totalBudget = categoryLimits.reduce((sum, limit) => sum + (parseFloat(limit.budget_amount) || 0), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
          <p className="text-destructive text-sm">{errors.general}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Budget Categories</h3>
          <Button type="button" onClick={addCategoryLimit} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Global Rollover Controls */}
        {categoryLimits.length > 0 && (
          <div className="bg-muted rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-3">Apply to All Categories:</h4>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={categoryLimits.every(limit => limit.rollover_enabled)}
                  onCheckedChange={(checked) => applyRolloverToAll('rollover_enabled', checked)}
                />
                <label className="text-sm text-muted-foreground font-medium">Rollover funds</label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              These settings will apply to all categories. You can still customize individual categories below.
            </p>
          </div>
        )}

        {categoryLimits.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
            <p className="text-muted-foreground mb-4">No categories added yet</p>
            <Button type="button" onClick={addCategoryLimit} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add First Category
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {categoryLimits.map((limit, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <select
                      value={limit.category_id}
                      onChange={(e) => updateCategoryLimit(index, 'category_id', e.target.value)}
                      className={`w-full p-2 border rounded-md ${
                        errors[`category_${index}_category_id`] ? 'border-destructive' : 'border-border'
                      }`}
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option 
                          key={category.id} 
                          value={category.id}
                          disabled={categoryLimits.some((l, i) => i !== index && l.category_id === category.id)}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors[`category_${index}_category_id`] && (
                      <p className="text-destructive text-xs mt-1">{errors[`category_${index}_category_id`]}</p>
                    )}
                  </div>

                  <div className="w-32">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={limit.budget_amount}
                      onChange={(e) => updateCategoryLimit(index, 'budget_amount', e.target.value)}
                      className={errors[`category_${index}_budget_amount`] ? 'border-destructive' : ''}
                      placeholder="0.00"
                    />
                    {errors[`category_${index}_budget_amount`] && (
                      <p className="text-destructive text-xs mt-1">{errors[`category_${index}_budget_amount`]}</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={() => removeCategoryLimit(index)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Rollover Options */}
                <div className="flex items-center gap-6 pl-2 border-l-2 border-border">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={limit.rollover_enabled || false}
                      onCheckedChange={(checked) => updateCategoryLimit(index, 'rollover_enabled', checked)}
                    />
                    <label className="text-sm text-muted-foreground">Rollover funds</label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {categoryLimits.length > 0 && (
        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <span className="font-medium text-foreground">Total Budget:</span>
          <span className="text-lg sm:text-xl font-bold text-primary">
            ${totalBudget.toFixed(2)}
          </span>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={loading || categoryLimits.length === 0}>
          {loading ? 'Saving...' : isEditing ? 'Update Budget' : 'Create Budget'}
        </Button>
      </div>
    </form>
  );
}