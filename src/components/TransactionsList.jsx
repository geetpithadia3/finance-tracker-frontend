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
      toast.success('Transactions updated successfully');
    } catch (error) {
      toast.error('Failed to update transactions');
      console.error('Error updating transactions:', error);
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

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleMonthChange(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[200px] text-center font-medium">
            {selectedDate.format('MMMM YYYY')}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleMonthChange(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={editMode ? "secondary" : "outline"}
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
            <Button onClick={handleSaveChanges}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                Clear Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => requestSort('occurredOn')}>
                Date {sortConfig.key === 'occurredOn' && (sortConfig.direction === 'ascending' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead onClick={() => requestSort('type')}>
                Type {sortConfig.key === 'type' && (sortConfig.direction === 'ascending' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead onClick={() => requestSort('category')}>
                Category {sortConfig.key === 'category' && (sortConfig.direction === 'ascending' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead onClick={() => requestSort('description')}>
                Description {sortConfig.key === 'description' && (sortConfig.direction === 'ascending' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead className="text-right" onClick={() => requestSort('amount')}>
                Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'ascending' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map(transaction => (
              <TableRow
                key={transaction.key}
                className={`${transaction.deleted ? 'bg-red-50 line-through' : ''} cursor-pointer hover:bg-gray-50`}
                onClick={() => handleTransactionClick(transaction)}
              >
                <TableCell>
                  {moment(transaction.occurredOn).format('YYYY-MM-DD')}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${transaction.type.toLowerCase() === 'credit'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                    }`}>
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1).toLowerCase()}
                  </span>
                </TableCell>
                <TableCell>
                  {editMode ? (
                    <Select
                      defaultValue={transaction.category.name}
                      onValueChange={(value) => handleEdit(transaction, 'category', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem
                            key={category.id}
                            value={category.name}
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
                <TableCell>
                  {editMode ? (
                    <Input
                      ref={inputRef}
                      value={transaction.description}
                      onChange={(e) => handleEdit(transaction, 'description', e.target.value)}
                      className="h-8"
                    />
                  ) : (
                    transaction.description
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className={transaction.type.toLowerCase() === 'credit' ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(transaction.amount)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add new Action Dialog */}
      <Dialog open={transactionModalOpen} onOpenChange={setTransactionModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          {selectedTransaction && (
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
                  toast.success('Splits saved successfully');
                } catch (error) {
                  console.error('Error saving splits:', error);
                  toast.error('Error saving splits');
                }
              }}
              categories={categories}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionsList;