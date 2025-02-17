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
import { FileUploadCard } from './FileUploadCard';
import { TransactionTable } from './TransactionTable';

export const TransactionImportDialog = ({ selectedAccount, onClose }) => {
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
  } = useTransactionsImport(selectedAccount, onClose);

  useEffect(() => {
    fetchCategories();
  }, [selectedAccount]);

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
        {!data.length && <FileUploadCard onFileUpload={handleFileUpload} />}

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