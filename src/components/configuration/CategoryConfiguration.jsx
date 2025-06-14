import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Plus } from 'lucide-react';
import { categoriesApi } from '@/api/categories';

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
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
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
      await categoriesApi.create({ name: newCategory.trim() });
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
      await categoriesApi.update(categories[index].id, { name: editingCategory.name.trim() });
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
      await categoriesApi.toggleStatus(category.id, !category.isActive);

      const updatedCategories = [...categories];
      updatedCategories[index].isActive = !category.isActive;
      setCategories(updatedCategories);

      toast({
        title: "Success",
        description: `Category ${!category.isActive ? 'enabled' : 'disabled'} successfully`,
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

  const handleDeleteCategory = async (categoryId, categoryName) => {
    try {
      await categoriesApi.delete(categoryId);
      await fetchCategories();
      
      toast({
        title: "Success",
        description: `Category "${categoryName}" deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to delete category';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };


  return (
    <div className="space-y-3 sm:space-y-4 px-1 sm:px-0">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
        <Input
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="flex-1 text-xs sm:text-sm h-8 sm:h-10"
        />
        <Button 
          onClick={handleAddCategory}
          className="text-xs sm:text-sm h-8 sm:h-10 px-3 sm:px-4"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          Add Category
        </Button>
      </div>

      <ScrollArea className="h-[300px] sm:h-[400px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs sm:text-sm">Category Name</TableHead>
              <TableHead className="w-[80px] sm:w-[100px] text-xs sm:text-sm">Status</TableHead>
              <TableHead className="w-[120px] sm:w-[140px] text-xs sm:text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category, index) => (
              <TableRow key={index}>
                <TableCell className="text-xs sm:text-sm">
                  {editingCategory?.index === index ? (
                    <Input
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({
                        ...editingCategory,
                        name: e.target.value
                      })}
                      className="text-xs sm:text-sm h-7 sm:h-8"
                    />
                  ) : (
                    category.name
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={category.isActive}
                    onCheckedChange={() => handleToggleCategory(index)}
                    className="scale-75 sm:scale-100"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 sm:gap-2">
                    {editingCategory?.index === index ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs sm:text-sm h-6 sm:h-8 px-2 sm:px-3"
                        onClick={() => handleUpdateCategory(index)}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs sm:text-sm h-6 sm:h-8 px-2 sm:px-3"
                        onClick={() => handleEditCategory(index)}
                        disabled={!category.isEditable}
                      >
                        Edit
                      </Button>
                    )}
                    {category.isEditable && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs sm:text-sm h-6 sm:h-8 px-2 sm:px-3 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{category.name}"? This action cannot be undone and will fail if the category is being used by transactions.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteCategory(category.id, category.name)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
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
