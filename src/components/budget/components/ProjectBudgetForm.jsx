import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Trash2, Plus, Calendar } from 'lucide-react';
import { categoriesApi } from '../../../api/categories';

export function ProjectBudgetForm({ initialData, onSubmit, onCancel, isEditing = false }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    total_amount: 0,
    category_allocations: []
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        start_date: initialData.start_date ? new Date(initialData.start_date).toISOString().split('T')[0] : '',
        end_date: initialData.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : '',
        total_amount: initialData.total_amount || 0,
        category_allocations: initialData.category_allocations?.map(allocation => ({
          category_id: allocation.category_id,
          allocated_amount: allocation.allocated_amount
        })) || []
      });
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

  const addCategoryAllocation = () => {
    setFormData(prev => ({
      ...prev,
      category_allocations: [
        ...prev.category_allocations,
        { category_id: '', allocated_amount: 0 }
      ]
    }));
  };

  const removeCategoryAllocation = (index) => {
    setFormData(prev => ({
      ...prev,
      category_allocations: prev.category_allocations.filter((_, i) => i !== index)
    }));
  };

  const updateCategoryAllocation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      category_allocations: prev.category_allocations.map((allocation, i) =>
        i === index ? { ...allocation, [field]: value } : allocation
      )
    }));
    
    // Clear error for this field
    if (errors[`allocation_${index}_${field}`]) {
      setErrors({ ...errors, [`allocation_${index}_${field}`]: undefined });
    }
  };

  const updateFormField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    
    if (formData.start_date && formData.end_date && formData.start_date >= formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    if (!formData.total_amount || formData.total_amount <= 0) {
      newErrors.total_amount = 'Total amount must be greater than 0';
    }
    
    if (formData.category_allocations.length === 0) {
      newErrors.general = 'At least one category allocation is required';
    }

    // Validate category allocations
    formData.category_allocations.forEach((allocation, index) => {
      if (!allocation.category_id) {
        newErrors[`allocation_${index}_category_id`] = 'Category is required';
      }
      if (!allocation.allocated_amount || allocation.allocated_amount <= 0) {
        newErrors[`allocation_${index}_allocated_amount`] = 'Amount must be greater than 0';
      }
    });

    // Check for duplicate categories
    const categoryIds = formData.category_allocations.map(a => a.category_id).filter(Boolean);
    const duplicates = categoryIds.filter((id, index) => categoryIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      duplicates.forEach(id => {
        const indices = formData.category_allocations.map((a, i) => a.category_id === id ? i : null).filter(i => i !== null);
        indices.forEach(index => {
          newErrors[`allocation_${index}_category_id`] = 'Duplicate category';
        });
      });
    }

    // Check if total allocations exceed total budget
    const totalAllocated = formData.category_allocations.reduce((sum, allocation) => sum + (parseFloat(allocation.allocated_amount) || 0), 0);
    if (totalAllocated > parseFloat(formData.total_amount)) {
      newErrors.total_amount = `Total allocations (${totalAllocated.toFixed(2)}) exceed total budget`;
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
      const submitData = {
        name: formData.name,
        description: formData.description || null,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        total_amount: parseFloat(formData.total_amount),
        category_allocations: formData.category_allocations.map(allocation => ({
          category_id: allocation.category_id,
          allocated_amount: parseFloat(allocation.allocated_amount)
        }))
      };

      console.log('Submitting project budget data:', submitData);
      await onSubmit(submitData);
    } catch (err) {
      console.error('Form submission error:', err);
      // Add more detailed error reporting
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
      }
      throw err; // Re-throw to let parent handle it
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const totalAllocated = formData.category_allocations.reduce((sum, allocation) => sum + (parseFloat(allocation.allocated_amount) || 0), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{errors.general}</p>
        </div>
      )}

      {/* Basic Project Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => updateFormField('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
              placeholder="e.g., Home Renovation, Vacation, New Car"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormField('description', e.target.value)}
              className="w-full p-2 border rounded-md resize-none"
              rows="3"
              placeholder="Optional description of the project..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date *</label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => updateFormField('start_date', e.target.value)}
                className={errors.start_date ? 'border-red-500' : ''}
              />
              {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date *</label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => updateFormField('end_date', e.target.value)}
                className={errors.end_date ? 'border-red-500' : ''}
              />
              {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Total Budget Amount ($) *</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.total_amount}
              onChange={(e) => updateFormField('total_amount', e.target.value)}
              className={errors.total_amount ? 'border-red-500' : ''}
              placeholder="0.00"
            />
            {errors.total_amount && <p className="text-red-500 text-xs mt-1">{errors.total_amount}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Category Allocations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Category Allocations</CardTitle>
            <Button type="button" onClick={addCategoryAllocation} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {formData.category_allocations.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No category allocations added yet. Click "Add Category" to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {formData.category_allocations.map((allocation, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">
                          Category
                        </label>
                        <select
                          value={allocation.category_id}
                          onChange={(e) => updateCategoryAllocation(index, 'category_id', e.target.value)}
                          className={`w-full p-2 border rounded-md ${
                            errors[`allocation_${index}_category_id`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select category</option>
                          {categories.map(category => (
                            <option 
                              key={category.id} 
                              value={category.id}
                              disabled={formData.category_allocations.some((a, i) => i !== index && a.category_id === category.id)}
                            >
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {errors[`allocation_${index}_category_id`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`allocation_${index}_category_id`]}</p>
                        )}
                      </div>

                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">
                          Allocated Amount ($)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={allocation.allocated_amount}
                          onChange={(e) => updateCategoryAllocation(index, 'allocated_amount', e.target.value)}
                          className={errors[`allocation_${index}_allocated_amount`] ? 'border-red-500' : ''}
                          placeholder="0.00"
                        />
                        {errors[`allocation_${index}_allocated_amount`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`allocation_${index}_allocated_amount`]}</p>
                        )}
                      </div>

                      <Button
                        type="button"
                        onClick={() => removeCategoryAllocation(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 mt-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Summary */}
      {formData.category_allocations.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Budget:</span>
                <span className="text-lg font-bold text-blue-600">
                  ${parseFloat(formData.total_amount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Allocated:</span>
                <span className={`text-lg font-bold ${totalAllocated > parseFloat(formData.total_amount) ? 'text-red-600' : 'text-green-600'}`}>
                  ${totalAllocated.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="font-medium">Remaining:</span>
                <span className={`text-lg font-bold ${(parseFloat(formData.total_amount) - totalAllocated) < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                  ${(parseFloat(formData.total_amount) - totalAllocated).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={loading || formData.category_allocations.length === 0}>
          {loading ? 'Saving...' : isEditing ? 'Update Project Budget' : 'Create Project Budget'}
        </Button>
      </div>
    </form>
  );
}