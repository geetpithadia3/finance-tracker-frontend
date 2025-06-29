import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent } from '../../ui/card';
import { Trash2, Plus } from 'lucide-react';
import { categoriesApi } from '../../../api/categories';

export function BudgetForm({ initialData, onSubmit, onCancel, isEditing = false }) {
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
        budget_amount: limit.budget_amount
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
      { category_id: '', budget_amount: 0 }
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
        category_limits: categoryLimits.map(limit => ({
          category_id: limit.category_id,
          budget_amount: parseFloat(limit.budget_amount)
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

  const availableCategories = categories.filter(category => 
    !categoryLimits.some(limit => limit.category_id === category.id) || 
    categoryLimits.find(limit => limit.category_id === category.id) === categoryLimits.find(limit => limit.category_id === category.id)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{errors.general}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Category Budget Limits</h3>
          <Button type="button" onClick={addCategoryLimit} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {categoryLimits.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No category limits added yet. Click "Add Category" to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {categoryLimits.map((limit, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">
                        Category
                      </label>
                      <select
                        value={limit.category_id}
                        onChange={(e) => updateCategoryLimit(index, 'category_id', e.target.value)}
                        className={`w-full p-2 border rounded-md ${
                          errors[`category_${index}_category_id`] ? 'border-red-500' : 'border-gray-300'
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
                        <p className="text-red-500 text-xs mt-1">{errors[`category_${index}_category_id`]}</p>
                      )}
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">
                        Budget Amount ($)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={limit.budget_amount}
                        onChange={(e) => updateCategoryLimit(index, 'budget_amount', e.target.value)}
                        className={errors[`category_${index}_budget_amount`] ? 'border-red-500' : ''}
                        placeholder="0.00"
                      />
                      {errors[`category_${index}_budget_amount`] && (
                        <p className="text-red-500 text-xs mt-1">{errors[`category_${index}_budget_amount`]}</p>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={() => removeCategoryLimit(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {categoryLimits.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Budget:</span>
              <span className="text-xl font-bold text-blue-600">
                ${categoryLimits.reduce((sum, limit) => sum + (parseFloat(limit.budget_amount) || 0), 0).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
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