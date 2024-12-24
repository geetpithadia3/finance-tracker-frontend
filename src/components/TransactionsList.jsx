import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronLeft,
  ChevronRight,
  Pencil,
  Save,
  Trash2,
  Share2,
  MoreHorizontal,
  X,
  SlidersHorizontal,
  Scissors,
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

const TransactionsList = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().subtract(1, 'months'));
  const [editMode, setEditMode] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [splitModalVisible, setSplitModalVisible] = useState(false);
  const [splitTransaction, setSplitTransaction] = useState(null);
  const [splitItems, setSplitItems] = useState([]);
  const [splitError, setSplitError] = useState(null);
  const [remainingAmount, setRemainingAmount] = useState(0);

  const fetchTransactions = async (date) => {
    try {
      setIsLoading(true);
      setError(null);
      const month = date.format('MM');
      const year = date.year();

      const response = await fetch('http://localhost:8080/transactions/list', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ "yearMonth": `${year}-${month}` }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
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
      const response = await fetch('http://localhost:8080/categories', {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data.map(category => ({
        name: typeof category === 'string' ? category : category.name,
        id: typeof category === 'string' ? category : category.id
      })));
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

      const response = await fetch('http://localhost:8080/transactions', {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTransactions),
      });

      if (!response.ok) {
        throw new Error('Failed to update transactions');
      }

      await fetchTransactions(selectedDate);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating transactions:', error);
    }
  };

  // Safe formatting helper
  const formatCurrency = (amount) => {
    const value = parseFloat(amount);
    return isNaN(value) ? '$0.00' : `$${value.toFixed(2)}`;
  };

  const handleSplitInit = (transaction) => {
    if (transaction.type.toLowerCase() !== 'debit') return;
    setSplitTransaction(transaction);
    setRemainingAmount(transaction.amount);
    setSplitItems([{
      id: Date.now(),
      amount: '',
      description: '',
      category: transaction.category,
      type: 'DEBIT',
      occurredOn: transaction.occurredOn,
      account: transaction.account
    }]);
    setSplitModalVisible(true);
  };

  const handleSplitItemChange = (itemId, field, value) => {
    setSplitItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    ));
    setSplitError(null);

    // Update remaining amount when split amounts change
    if (field === 'amount') {
      const totalSplit = splitItems.reduce((sum, item) => {
        const itemAmount = item.id === itemId ? parseFloat(value) || 0 : parseFloat(item.amount) || 0;
        return sum + itemAmount;
      }, 0);
      const newRemainingAmount = splitTransaction.amount - totalSplit;
      setRemainingAmount(newRemainingAmount);
    }
  };

  const addSplitItem = () => {
    setSplitItems(prev => [...prev, {
      id: Date.now(),
      amount: '',
      description: '',
      category: splitTransaction.category,
      type: 'DEBIT',
      occurredOn: splitTransaction.occurredOn,
      account: splitTransaction.account
    }]);
  };

  const removeSplitItem = (itemId) => {
    setSplitItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSaveSplit = async () => {
    // Validate that splits don't exceed original amount
    const totalSplit = splitItems.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    if (totalSplit > splitTransaction.amount) {
      setSplitError(`Total split amount cannot exceed ${formatCurrency(splitTransaction.amount)}`);
      return;
    }

    try {
      // First update the parent transaction with remaining amount
      const updateParentResponse = await fetch('http://localhost:8080/transactions', {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{
          id: splitTransaction.id,
          description: splitTransaction.description,
          amount: remainingAmount,
          categoryId: splitTransaction.category.id,
          occurredOn: splitTransaction.occurredOn,
          deleted: false,
          account: splitTransaction.account
        }]),
      });

      if (!updateParentResponse.ok) {
        throw new Error('Failed to update parent transaction');
      }

      // Then create the new split transactions
      const createSplitsResponse = await fetch('http://localhost:8080/transactions', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          splitItems.map(item => ({
            amount: parseFloat(item.amount),
            description: item.description || splitTransaction.description,
            categoryId: item.category.id,
            occurredOn: splitTransaction.occurredOn,
            accountId: splitTransaction.account,
            type: 'DEBIT'
          }))
        ),
      });

      if (!createSplitsResponse.ok) {
        throw new Error('Failed to create split transactions');
      }

      await fetchTransactions(selectedDate);
      setSplitModalVisible(false);
      setSplitTransaction(null);
      setSplitItems([]);
      setRemainingAmount(0);
    } catch (error) {
      console.error('Error splitting transaction:', error);
      setSplitError('Failed to save split transactions');
    }
  };

  const renderActionButtons = (transaction) => (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon"
        disabled={!editMode}
        onClick={() => handleDelete(transaction)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      {transaction.type.toLowerCase() === 'debit' && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleSplitInit(transaction)}
        >
          <Scissors className="h-4 w-4" />
        </Button>
      )}
      
    </div>
  );

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
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map(transaction => (
              <TableRow 
                key={transaction.key}
                className={transaction.deleted ? 'bg-red-50 line-through' : ''}
              >
                <TableCell>
                  {moment(transaction.occurredOn).format('YYYY-MM-DD')}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    transaction.type.toLowerCase() === 'credit' 
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
                      defaultValue={transaction.description}
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
                <TableCell>
                  {renderActionButtons(transaction)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Split Transaction Sheet */}
      <Sheet open={splitModalVisible} onOpenChange={setSplitModalVisible}>
        <SheetContent 
          className="w-[400px] sm:w-[540px]"
          description="Split a transaction into multiple parts"
        >
          <SheetHeader>
            <SheetTitle>Split Transaction</SheetTitle>
            <SheetDescription>
              Divide this transaction into multiple parts while maintaining the total amount.
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-4">
            <div className="flex justify-between mb-4">
              <div>Original Amount: {formatCurrency(splitTransaction?.amount)}</div>
              <div className={remainingAmount < 0 ? 'text-red-500' : 'text-green-500'}>
                Remaining: {formatCurrency(remainingAmount)}
              </div>
            </div>
            
            {splitError && (
              <div className="mb-4 text-red-500 text-sm">{splitError}</div>
            )}

            <div className="space-y-4">
              {splitItems.map((item, index) => (
                <div key={item.id} className="space-y-2 p-4 border rounded-lg">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={item.amount}
                    onChange={(e) => handleSplitItemChange(item.id, 'amount', e.target.value)}
                  />
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleSplitItemChange(item.id, 'description', e.target.value)}
                  />
                  <Select
                    value={item.category.name}
                    onValueChange={(value) => handleSplitItemChange(item.id, 'category', 
                      categories.find(c => c.name === value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {splitItems.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSplitItem(item.id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={addSplitItem}
            >
              Add Split
            </Button>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setSplitModalVisible(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSplit}>Save</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TransactionsList;