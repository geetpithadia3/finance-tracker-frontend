import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Pencil, Filter, Repeat, Upload, Plus } from 'lucide-react';
import { useTransactionListManager } from '../hooks/useTransactionListManager';
import { EmptyState } from './EmptyState';
import { TransactionDialog } from './TransactionDialog';
import { TransactionTable } from './table';
import { formatCurrency } from '../utils/transactionHelpers';
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
    <div className="flex flex-col px-1 sm:px-0">
      {/* Minimal header with main controls */}
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={() => handleMonthChange(-1)}>
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <div className="text-sm sm:text-lg font-medium">{selectedDate.format('MMM YYYY')}</div>
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={() => handleMonthChange(1)}>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        <div className="flex gap-1 sm:gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">
              {selectedCategory && selectedCategory !== 'all' ? selectedCategory : "Filter"}
            </span>
          </Button>
          
          <Button
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
              onClick={() => setShowImportDialog(true)}
            >
              <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-0 sm:mr-1" />
              <span className="hidden sm:inline">Import</span>
            </Button>
        </div>
      </div>

      {/* Expandable filters panel */}
      {showFilters && (
        <div className="p-2 sm:p-3 bg-muted/30 rounded-lg mb-3 sm:mb-4 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 items-start sm:items-center">
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-full sm:w-[160px] h-8 text-xs sm:text-sm">
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
          
          <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm h-8 sm:h-9 flex-1 sm:flex-none"
              onClick={() => setShowRecurring(true)}
            >
              <Repeat className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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
              <span className="text-xs sm:text-sm text-muted-foreground">Editing mode</span>
              <div className="flex gap-1 sm:gap-2">
                <Button size="sm" variant="ghost" className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="default" className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3" onClick={handleSaveChanges}>
                  Save
                </Button>
              </div>
            </div>
          )}
          
          <TransactionTable
            transactions={filteredTransactions}
            categories={categories}
            editMode={editMode}
            sortConfig={sortConfig}
            inputRef={inputRef}
            onEdit={handleEdit}
            onTransactionClick={handleTransactionClick}
            onRequestSort={handleRequestSort}
          />
          
          {!editMode && (
            <div className="p-2 flex justify-end border-t">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
                onClick={() => setEditMode(true)}
              >
                <Pencil className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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

      {/* Add Transaction Floating Button */}
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-6 right-6 z-50 shadow-lg rounded-full w-14 h-14 flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700"
        onClick={() => {
          // Find the 'General' category if it exists
          const generalCategory = categories.find(cat => cat.name === 'General') || categories[0] || { id: '', name: 'General' };
          setSelectedTransaction({
            id: `new-${Date.now()}`,
            description: '',
            amount: '',
            type: 'DEBIT',
            occurredOn: selectedDate.clone().startOf('month').format('YYYY-MM-DD'),
            category: generalCategory,
            categoryId: generalCategory.id,
            personalShare: 0,
            owedShare: 0,
            shareMetadata: '',
            isNew: true
          });
          setTransactionModalOpen(true);
        }}
        title="Add Transaction"
      >
        <Plus className="w-7 h-7" />
      </Button>
    </div>
  );
};

export default TransactionsList;