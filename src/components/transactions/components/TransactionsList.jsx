import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Pencil, Save, X, Filter, Repeat, Upload, Plus, Calendar } from 'lucide-react';
import { useTransactionListManager } from '../hooks/useTransactionListManager';
import { EmptyState } from './EmptyState';
import { TransactionDialog } from './TransactionDialog';
import { TransactionsTable } from './TransactionsTable';
import RecurringTransactionsList from './RecurringTransactionsList';
import { TransactionImportDialog } from './TransactionImportDialog';

const TransactionsList = () => {
  const inputRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showRecurring, setShowRecurring] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const {
    transactions,
    categories,
    selectedDate,
    editMode,
    selectedTransaction,
    transactionModalOpen,
    sortConfig,
    setTransactionModalOpen,
    setSelectedTransaction,
    setEditMode,
    handleMonthChange,
    handleEdit,
    handleSaveChanges,
    fetchTransactions,
    handleRequestSort,
  } = useTransactionListManager();

  const formatCurrency = (amount) => {
    const value = parseFloat(amount);
    return isNaN(value) ? '$0.00' : `$${value.toFixed(2)}`;
  };

  const handleTransactionClick = (transaction) => {
    if (!editMode) {
      setSelectedTransaction(transaction);
      setTransactionModalOpen(true);
    }
  };

  // Helper function to get category name from a transaction
  const getCategoryName = (transaction) => {
    if (!transaction.category) return '';
    return typeof transaction.category === 'string' 
      ? transaction.category 
      : transaction.category.name || '';
  };

  const filteredTransactions = selectedCategory && selectedCategory !== 'all'
    ? transactions.filter(transaction => {
        const categoryName = getCategoryName(transaction);
        return categoryName === selectedCategory;
      })
    : transactions;

  if (showRecurring) {
    return <RecurringTransactionsList onBack={() => setShowRecurring(false)} />;
  }

  return (
    <div className="flex flex-col">
      {/* Minimal header with main controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleMonthChange(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-medium">{selectedDate.format('MMM YYYY')}</div>
          <Button variant="ghost" size="icon" onClick={() => handleMonthChange(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            {selectedCategory && selectedCategory !== 'all' ? selectedCategory : "Filter"}
          </Button>
          
          <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportDialog(true)}
            >
              <Upload className="h-4 w-4 mr-1" />
              Import
            </Button>
        </div>
      </div>

      {/* Expandable filters panel */}
      {showFilters && (
        <div className="p-3 bg-muted/30 rounded-lg mb-4 flex flex-wrap gap-3 items-center">
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[160px] h-8">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRecurring(true)}
            >
              <Repeat className="h-4 w-4 mr-1" />
              Recurring
            </Button>
          </div>
        </div>
      )}
      
      {/* Transaction Table with inline edit mode */}
      {filteredTransactions.length === 0 ? (
        <EmptyState selectedDate={selectedDate} />
      ) : (
        <div className="relative rounded-lg border overflow-hidden">
          {editMode && (
            <div className="p-2 bg-muted/50 flex justify-between items-center border-b">
              <span className="text-sm text-muted-foreground">Editing mode</span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="default" onClick={handleSaveChanges}>
                  Save
                </Button>
              </div>
            </div>
          )}
          
          <TransactionsTable
            transactions={filteredTransactions}
            categories={categories}
            editMode={editMode}
            sortConfig={sortConfig}
            inputRef={inputRef}
            onEdit={handleEdit}
            onTransactionClick={handleTransactionClick}
            formatCurrency={formatCurrency}
            onRequestSort={handleRequestSort}
          />
          
          {!editMode && (
            <div className="p-2 flex justify-end border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditMode(true)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <TransactionDialog
        open={transactionModalOpen}
        transaction={selectedTransaction}
        categories={categories}
        onClose={() => {
          setTransactionModalOpen(false);
          setSelectedTransaction(null);
        }}
        onRefresh={() => fetchTransactions(selectedDate)}
      />

      {showImportDialog && (
        <TransactionImportDialog
          onClose={() => {
            setShowImportDialog(false);
            fetchTransactions(selectedDate);
          }}
        />
      )}
    </div>
  );
};

export default TransactionsList;