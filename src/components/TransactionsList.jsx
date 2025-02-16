import React, { useEffect, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Save,
  X,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Plus,
} from 'lucide-react';
import moment from 'moment';
import { getAuthHeaders } from '../utils/auth';
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { transactionsApi } from '../api/transactions';
import TransactionManager from './TransactionManager';
import { categoriesApi } from '../api/categories';
import { toast } from "@/components/ui/use-toast";

const TransactionsList = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().subtract(1, 'months'));
  const [editMode, setEditMode] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [splitModalVisible, setSplitModalVisible] = useState(false);
  const [splitTransaction, setSplitTransaction] = useState(null);
  const [splitItems, setSplitItems] = useState([]);
  const [splitError, setSplitError] = useState(null);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const inputRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'ascending' });

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const fetchTransactions = async (date) => {
    try {
      setIsLoading(true);
      setError(null);
      const month = date.format('MM');
      const year = date.year();

      const data = await transactionsApi.getAll(`${year}-${month}`);
      const formattedData = (Array.isArray(data) ? data : []).map(item => ({
        ...item,
        key: item.id.toString(),
        date: moment(item.date),
        deleted: false,
      }));
      setTransactions(formattedData);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(selectedDate);
    fetchCategories()
  }, [selectedDate]);

  const fetchCategories = async () => {
    try {
      const formattedCategories = await categoriesApi.getAllFormatted();
      setCategories(formattedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleMonthChange = (direction) => {
    setSelectedDate(prev => prev.clone().add(direction, 'months'));
  };

  const handleDelete = (transaction) => {
    setTransactions(prev =>
      prev.map(t =>
        t.key === transaction.key
          ? { ...t, deleted: !t.deleted, modified: true }
          : t
      )
    );
  };

  const handleEdit = (transaction, field, value) => {
    setTransactions(prev =>
      prev.map(t =>
        t.key === transaction.key
          ? {
            ...t,
            [field]: field === 'category'
              ? categories.find(c => c.name === value)
              : value,
            modified: true
          }
          : t
      )
    );
  };

  const handleSaveChanges = async () => {
    try {
      const updatedTransactions = transactions
        .filter(t => t.deleted || t.modified)
        .map(transaction => ({
          id: transaction.id,
          description: transaction.description,
          amount: transaction.amount,
          categoryId: transaction.category.id,
          occurredOn: transaction.occurredOn,
          deleted: transaction.deleted || false,
          account: transaction.account
        }));

      await transactionsApi.update(updatedTransactions);
      await fetchTransactions(selectedDate);
      setEditMode(false);
      toast({
        title: "Changes Saved! 🎯",
        description: "Your transactions are all tucked in and updated",
      });
    } catch (error) {
      toast({
        title: "Uh-oh! 🎭",
        description: "Those changes played hide and seek. Let's try again!",
        variant: "destructive",
      });
    }
  };

  // Safe formatting helper
  const formatCurrency = (amount) => {
    const value = parseFloat(amount);
    return isNaN(value) ? '$0.00' : `$${value.toFixed(2)}`;
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setTransactionModalOpen(true);
  };

  useEffect(() => {
    if (transactionModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [transactionModalOpen]);

  const handleShareSave = async (shareData) => {
    try {
      const updatedTransaction = {
        id: selectedTransaction.id,
        description: selectedTransaction.description,
        amount: selectedTransaction.amount,
        category: selectedTransaction.category,
        occurredOn: selectedTransaction.occurredOn,
        deleted: false,
        account: selectedTransaction.account,
        splitType: shareData.splitType,
        personalShare: shareData.personalShare,
        owedShare: shareData.owedShare,
        shareMetadata: shareData.shareMetadata
      };

      await transactionsApi.update([updatedTransaction]);
      await fetchTransactions(selectedDate);
      setTransactionModalOpen(false);
      setSelectedTransaction(null);
      toast({
        title: "Share Saved! 🤝",
        description: "Split it like a pro! Your share is locked in",
      });
    } catch (error) {
      toast({
        title: "Share Snafu! 🎪",
        description: "That share didn't make the cut. Another go?",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header Controls - Improved responsive layout */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => handleMonthChange(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-medium min-w-[160px] text-center">
            {selectedDate.format('MMMM YYYY')}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => handleMonthChange(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        { transactions.length > 0 && (
        <div className="flex items-center justify-center sm:justify-end gap-2">
          <Button
            variant={editMode ? "secondary" : "outline"}
            className="h-9 text-sm font-medium"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancel Edit
              </>
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Transactions
              </>
            )}
          </Button>
          {editMode && (
            <Button
              className="h-9 text-sm font-medium"
              onClick={handleSaveChanges}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          )}
        </div>)}
      </div>

      {transactions.length === 0 ? (
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold mb-2">No Transactions Yet! 🌱</h3>
          <p className="text-muted-foreground mb-4">Start tracking your spending by providing transaction list for Accounts.</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[110px] whitespace-nowrap">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => requestSort('occurredOn')}>
                      Date
                      {sortConfig.key === 'occurredOn' && (
                        sortConfig.direction === 'ascending' ?
                          <ChevronUp className="h-4 w-4" /> :
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-[90px] whitespace-nowrap">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => requestSort('type')}>
                      Type
                      {sortConfig.key === 'type' && (
                        sortConfig.direction === 'ascending' ?
                          <ChevronUp className="h-4 w-4" /> :
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px] whitespace-nowrap">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => requestSort('category')}>
                      Category
                      {sortConfig.key === 'category' && (
                        sortConfig.direction === 'ascending' ?
                          <ChevronUp className="h-4 w-4" /> :
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[200px] max-w-[400px] xl:max-w-[500px]">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => requestSort('description')}>
                      Description
                      {sortConfig.key === 'description' && (
                        sortConfig.direction === 'ascending' ?
                          <ChevronUp className="h-4 w-4" /> :
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-[100px] text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 cursor-pointer" onClick={() => requestSort('amount')}>
                      Amount
                      {sortConfig.key === 'amount' && (
                        sortConfig.direction === 'ascending' ?
                          <ChevronUp className="h-4 w-4" /> :
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.map(transaction => (
                  <TableRow
                    key={transaction.key}
                    className={`${transaction.deleted ? 'bg-red-50 line-through' : ''} 
                  ${transaction.refunded ? 'bg-yellow-50' : ''} 
                  cursor-pointer hover:bg-gray-50`}
                    onClick={() => handleTransactionClick(transaction)}
                  >
                    <TableCell className="align-top py-4 text-sm whitespace-nowrap">
                      {moment(transaction.occurredOn).format('YYYY-MM-DD')}
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium 
                    ${transaction.type.toLowerCase() === 'credit'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1).toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell className="align-top py-4">
                      {editMode ? (
                        <Select
                          defaultValue={transaction.category.name}
                          onValueChange={(value) => handleEdit(transaction, 'category', value)}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem
                                key={category.id}
                                value={category.name}
                                className="text-sm"
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100">
                          {transaction.category.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="min-w-[200px] max-w-[400px] xl:max-w-[500px] py-4">
                      {editMode ? (
                        <Input
                          ref={inputRef}
                          value={transaction.description}
                          onChange={(e) => handleEdit(transaction, 'description', e.target.value)}
                          className="h-8 text-sm"
                        />
                      ) : (
                        <div className="text-sm text-gray-600 break-words pr-4">
                          {transaction.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="align-top py-4 text-right text-sm whitespace-nowrap">
                      <span className={`font-medium ${transaction.type.toLowerCase() === 'credit'
                          ? 'text-green-600'
                          : 'text-red-600'
                        }`}>
                        {formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
      {/* Transaction Dialog - Improved responsive sizing */}
      <Dialog open={transactionModalOpen} onOpenChange={setTransactionModalOpen}>
        <DialogContent className="sm:max-w-[400px] md:max-w-[475px] lg:max-w-[550px] xl:max-w-[700px] w-[90vw] max-h-[85vh] p-0 gap-0">
          {selectedTransaction && (
            <div className="flex flex-col h-full">
              <TransactionManager
                onClose={() => {
                  setTransactionModalOpen(false);
                  setSelectedTransaction(null);
                }}
                transaction={selectedTransaction}
                onSplitSave={async (parentUpdate, newSplits) => {
                  try {
                    await transactionsApi.updateParentAndCreateSplits(
                      selectedTransaction,
                      parentUpdate,
                      newSplits
                    );
                    await fetchTransactions(selectedDate);
                    setTransactionModalOpen(false);
                    setSelectedTransaction(null);
                    toast({
                      title: "Splits Saved! 🎯",
                      description: "Your splits are all tucked in and updated",
                    });
                  } catch (error) {
                    console.error('Error saving splits:', error);
                    toast({
                      title: "Uh-oh! 🎭",
                      description: "Those splits played hide and seek. Let's try again!",
                      variant: "destructive",
                    });
                  }
                }}
                onShareSave={handleShareSave}
                categories={categories}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionsList;