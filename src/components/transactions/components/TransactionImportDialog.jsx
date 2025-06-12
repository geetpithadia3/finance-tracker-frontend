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
const TransactionTable = ({ data, categories, editMode }) => {
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
              {record.description}
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs font-medium
              ${record.type?.toUpperCase() === 'CREDIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {record.type || 'Debit'}
              </span>
            </TableCell>
            <TableCell>
              {editMode ? (
                <Select 
                  value={record.category?.id || ""} 
                  onValueChange={(value) => {
                    record.category = categories.find(cat => cat.id === value) || null;
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
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
                <span className="px-2 py-1 rounded-full bg-gray-100 text-xs font-medium">
                  {record.category?.name || 'Uncategorized'}
                </span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <span className={record.type?.toUpperCase() === 'CREDIT' ? 'text-green-600' : 'text-red-600'}>
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
      <DialogHeader className="px-6 pt-6">
        <DialogTitle className="text-2xl font-semibold">Import Transactions</DialogTitle>
        <DialogDescription>
          Upload your transaction data or sync with external services
        </DialogDescription>
      </DialogHeader>
      <DialogContent className="max-w-5xl h-[800px] px-6 pb-6 flex flex-col">
        {!data.length && <FileUploadComponent onFileUpload={handleFileUpload} />}

        {data.length > 0 && (
          <div className="mt-6 space-y-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">Transaction Details</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setData([]);
                    setEditMode(false);
                  }}
                >
                  <Upload className="w-4 h-4" />
                  Upload New File
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={editMode ? "secondary" : "outline"}
                  onClick={() => setEditMode(!editMode)}
                  disabled={!data.length || isLoading}
                  className="gap-2"
                >
                  {editMode ? (
                    <>
                      <Save className="w-4 h-4" />
                      Done Editing
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      Edit All
                    </>
                  )}
                </Button>
                <Button
                  onClick={saveTransactions}
                  disabled={!data.length || isLoading}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden flex-1 flex flex-col w-full">
              <TransactionTable 
                data={data}
                categories={categories}
                editMode={editMode}
              />
            </div>
          </div>
        )}
        
        {!data.length && !isLoading && (
          <div className="mt-6 text-center text-muted-foreground">
            No transactions imported yet. Upload a file to get started.
          </div>
        )}
        
        {isLoading && (
          <div className="mt-6 text-center text-muted-foreground">
            Processing your data...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 