import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Save, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTransactionsImport } from '../hooks/useTransactionsImport';
import { FileUploadComponent } from './FileUploadComponent';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import moment from 'moment';

// Simple transaction table component for import preview
const ImportTransactionTable = ({ data, categories, editMode, onDataChange }) => {
  return (
    <Table className="flex-1 w-full">
      <TableHeader className="flex-none">
        <TableRow className="bg-secondary/50 hover:bg-secondary/50">
          <TableHead className="font-semibold w-[100px] sm:w-[140px] text-xs sm:text-sm">Date</TableHead>
          <TableHead className="font-semibold w-[150px] sm:w-[300px] text-xs sm:text-sm">Description</TableHead>
          <TableHead className="font-semibold w-[80px] sm:w-[120px] text-xs sm:text-sm hidden sm:table-cell">Type</TableHead>
          <TableHead className="font-semibold w-[100px] sm:w-[140px] text-xs sm:text-sm">Category</TableHead>
          <TableHead className="font-semibold text-right w-[80px] sm:w-[120px] text-xs sm:text-sm">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="overflow-auto">
        {data.map((record) => (
          <TableRow key={record.id} className="hover:bg-secondary/30">
            <TableCell className="font-medium text-xs sm:text-sm">
              {moment(record.date).format('M/D/YY')}
            </TableCell>
            <TableCell className="text-xs sm:text-sm">
              <div className="truncate max-w-[150px] sm:max-w-[300px]">
                {record.description}
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <span className={`px-2 py-1 rounded-full text-xs font-medium
              ${record.type?.toUpperCase() === 'CREDIT' ? 'bg-green-100/50 text-green-700' : 'bg-red-100/50 text-red-700'}`}>
                {record.type || 'Debit'}
              </span>
            </TableCell>
            <TableCell className="text-xs sm:text-sm">
              {editMode ? (
                <Select 
                  value={record.category?.id || ""} 
                  onValueChange={(value) => {
                    const updatedRecord = {
                      ...record,
                      category: categories.find(cat => cat.id === value) || null
                    };
                    const updatedData = data.map(item => 
                      item.id === record.id ? updatedRecord : item
                    );
                    onDataChange(updatedData);
                  }}
                >
                  <SelectTrigger className="w-full h-6 sm:h-8 text-xs sm:text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id} className="text-xs sm:text-sm">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="px-1 sm:px-2 py-1 rounded-full bg-muted text-xs font-medium truncate max-w-[80px] sm:max-w-full block">
                  {record.category?.name || 'Uncategorized'}
                </span>
              )}
            </TableCell>
            <TableCell className="text-right text-xs sm:text-sm">
              <span className={record.type?.toUpperCase() === 'CREDIT' ? 'text-green-500' : 'text-destructive'}>
                ${parseFloat(record.amount).toFixed(2)}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export const TransactionImportDialog = ({ onClose }) => {
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [editMode, setEditMode] = useState(false);
  
  const {
    data,
    setData,
    categories,
    isLoading,
    fetchCategories,
    handleFileUpload,
    saveTransactions,
  } = useTransactionsImport(onClose);

  useEffect(() => {
    // Fetch categories only once when the component mounts
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setIsModalVisible(false);
    onClose();
  };

  return (
    <Dialog open={isModalVisible} onOpenChange={handleClose}>
      <DialogHeader className="p-4 sm:p-6 pb-0">
        <DialogTitle className="text-lg sm:text-2xl font-semibold">Import Transactions</DialogTitle>
        <DialogDescription className="text-sm">
          Upload your transaction data or sync with external services
        </DialogDescription>
      </DialogHeader>
      <DialogContent className="max-w-6xl h-[85vh] sm:h-[800px] p-4 sm:p-6 flex flex-col">
        {!data.length && <FileUploadComponent onFileUpload={handleFileUpload} />}

        {data.length > 0 && (
          <div className="mt-3 sm:mt-6 space-y-2 sm:space-y-4 flex-1 flex flex-col min-h-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-4">
                <h3 className="text-base sm:text-lg font-semibold">Transaction Details</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                  onClick={() => {
                    setData([]);
                    setEditMode(false);
                  }}
                >
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Upload New File</span>
                  <span className="sm:hidden">New File</span>
                </Button>
              </div>
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant={editMode ? "secondary" : "outline"}
                  onClick={() => setEditMode(!editMode)}
                  disabled={!data.length || isLoading}
                  className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                  size="sm"
                >
                  {editMode ? (
                    <>
                      <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Done Editing</span>
                      <span className="sm:hidden">Done</span>
                    </>
                  ) : (
                    <>
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Edit All</span>
                      <span className="sm:hidden">Edit</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={saveTransactions}
                  disabled={!data.length || isLoading}
                  className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
                  size="sm"
                >
                  <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Save Changes</span>
                  <span className="sm:hidden">Save</span>
                </Button>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden flex-1 flex flex-col w-full">
              <ImportTransactionTable 
                data={data}
                categories={categories}
                editMode={editMode}
                onDataChange={setData}
              />
            </div>
          </div>
        )}
        
        {!data.length && !isLoading && (
          <div className="mt-3 sm:mt-6 text-center text-muted-foreground text-sm">
            No transactions imported yet. Upload a file to get started.
          </div>
        )}
        
        {isLoading && (
          <div className="mt-3 sm:mt-6 text-center text-muted-foreground text-sm">
            Processing your data...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 