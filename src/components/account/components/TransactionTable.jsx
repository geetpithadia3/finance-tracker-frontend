import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import moment from 'moment';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

export const TransactionTable = ({ data: initialData, categories, editMode }) => {
  const [data, setData] = useState(initialData);
  
  // Update local state when props change
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleCategoryChange = (recordId, categoryId) => {
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    if (selectedCategory) {
      setData(prevData => 
        prevData.map(record => 
          record.id === recordId 
            ? { ...record, category: selectedCategory } 
            : record
        )
      );
    }
  };

  return (
    <Table className="flex-1 w-full">
      <TableHeader className="flex-none">
        <TableRow className="bg-secondary/50 hover:bg-secondary/50">
          <TableHead className="font-semibold w-[140px]">Date</TableHead>
          <TableHead className="font-semibold w-[300px]">Description</TableHead>
          <TableHead className="font-semibold w-[120px]">Type</TableHead>
          <TableHead className="font-semibold w-[140px]">Category</TableHead>
          <TableHead className="font-semibold text-right w-[120px]">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="overflow-auto">
        {data.map((record) => (
          <TableRow key={record.id} className="hover:bg-secondary/30">
            <TableCell className="font-medium">
              {moment(record.date).format('MMM D, YYYY')}
            </TableCell>
            <TableCell>
              {editMode ? (
                <Input 
                  defaultValue={record.description}
                  className="w-full"
                />
              ) : (
                record.description
              )}
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs font-medium
              ${record.type === 'Credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {record.type}
              </span>
            </TableCell>
            <TableCell>
              {editMode ? (
                <Select 
                  value={record.category?.id || ""}
                  onValueChange={(value) => handleCategoryChange(record.id, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category">
                      {record.category?.name || 'Select category'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary text-xs font-medium">
                    {record.category?.name || 'Uncategorized'}
                  </span>
                   {record.autoCategorized && (
                    <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs text-blue-500 cursor-help">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {record.reasoning || "Auto-categorized"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  )}
                </div> 
              )}
            </TableCell>
            <TableCell className="text-right">
              <span className={record.type === 'Credit' ? 'text-green-600' : 'text-red-600'}>
                ${parseFloat(record.amount).toFixed(2)}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}; 