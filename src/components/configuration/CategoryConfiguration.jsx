import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { getAuthHeaders } from '@/utils/auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const CategoryConfiguration = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/categories', {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data.map(category => ({
        id: category.id,
        name: category.name || category,
        isActive: category.isActive,
        isEditable: category.isEditable
      })));
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const response = await fetch('http://localhost:8080/categories', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategory.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to add category');
      }

      await fetchCategories();
      setNewCategory('');
      
      toast({
        title: "Success",
        description: "Category added successfully",
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = (index) => {
    const category = categories[index];
    if (!category.isEditable) return;
    
    setEditingCategory({
      index,
      name: category.name
    });
  };

  const handleUpdateCategory = async (index) => {
    if (!editingCategory || !editingCategory.name.trim()) return;

    try {
      const response = await fetch(`http://localhost:8080/categories/${categories[index].name}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newName: editingCategory.name.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      await fetchCategories();
      setEditingCategory(null);

      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleToggleCategory = async (index) => {
    try {
      const category = categories[index];
      const response = await fetch(`http://localhost:8080/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: category.name,
          isActive: !category.isActive,
          isEditable: category.isEditable
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle category');
      }

      const updatedCategories = [...categories];
      updatedCategories[index].isActive = !category.isActive;
      setCategories(updatedCategories);

      toast({
        title: "Success",
        description: `Category ${!category.isActive ? 'disabled' : 'enabled'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling category:', error);
      toast({
        title: "Error",
        description: "Failed to toggle category status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleAddCategory}>Add Category</Button>
      </div>

      <ScrollArea className="h-[400px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category, index) => (
              <TableRow key={index}>
                <TableCell>
                  {editingCategory?.index === index ? (
                    <Input
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({
                        ...editingCategory,
                        name: e.target.value
                      })}
                    />
                  ) : (
                    category.name
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={category.isActive}
                    onCheckedChange={() => handleToggleCategory(index)}
                  />
                </TableCell>
                <TableCell>
                  {editingCategory?.index === index ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateCategory(index)}
                    >
                      Save
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditCategory(index)}
                      disabled={!category.isEditable}
                    >
                      Edit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default CategoryConfiguration;