import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Edit, Save, Upload, FileUp } from 'lucide-react';
import Papa from 'papaparse';
import moment from 'moment';
import { categoriesApi } from '../api/categories';
import { transactionsApi } from '../api/transactions';
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import Dropzone from 'shadcn-dropzone';

export const SyncResultComponent = ({ selectedAccount, onClose }) => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [selectedAccount]);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (file) => {
    setIsLoading(true);
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const formattedData = formatTransactions(results.data);
        setData(formattedData);
        setIsLoading(false);
        toast({
          title: "Success",
          description: "File uploaded successfully",
        });
      },
      error: (error) => {
        console.error('Error parsing file:', error);
        toast({
          title: "Error",
          description: "Failed to parse file",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    });
    return false;
  };

  const formatTransactions = (transactions) => {
    return transactions.map((item, index) => {
      const category = categories.find(cat => cat.name === (item.category || 'General')) || { id: null };
      return {
        id: index.toString(),
        date: moment(item.date || item.Date),
        description: item.description || item.Description,
        type: item.type || item['Type of Transaction'],
        amount: item.amount || item.Amount,
        category: category || null,
      };
    });
  };

  const handleSaveAll = async () => {
    setIsLoading(true);
    try {
      const formattedData = data.map(item => ({
        ...item,
        occurredOn: item.date.format('YYYY-MM-DD'),
        accountId: selectedAccount,
        categoryId: item.category?.id || null,
      }));

      await transactionsApi.create(formattedData);
      toast({ 
        title: 'Success',
        description: 'Transactions saved successfully'
      });
      onClose();
    } catch (error) {
      console.error('Error saving transactions:', error);
      toast({ 
        title: 'Error',
        description: 'Failed to save transactions',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        {!data.length && (
          <Card className="border-dashed">
            <CardContent className="p-0">
              <Dropzone
                onDrop={(acceptedFiles) => {
                  handleFileChange(acceptedFiles[0]);
                }}
                className="cursor-pointer"
              >
                {({ isDragAccept }) => (
                  <div className={`flex flex-col items-center justify-center p-8 space-y-4 text-center
                    ${isDragAccept ? 'bg-primary/5' : 'hover:bg-secondary/50'} transition-colors duration-200`}>
                    <div className="p-4 bg-primary/5 rounded-full">
                      <FileUp className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">
                        {isDragAccept ? 'Drop to import!' : 'Upload Transaction Data'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Drag and drop your CSV file or click to browse
                      </p>
                    </div>
                  </div>
                )}
              </Dropzone>
            </CardContent>
          </Card>
        )}

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
                  onClick={handleSaveAll}
                  disabled={!data.length || isLoading}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden flex-1 flex flex-col w-full">
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
                          <Select defaultValue={record.category?.id}>
                            <SelectTrigger className="w-full">
                              <SelectValue>
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
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary text-xs font-medium">
                            {record.category?.name || 'Uncategorized'}
                          </span>
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