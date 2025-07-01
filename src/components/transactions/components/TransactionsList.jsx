import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Filter, Repeat, Upload, Plus } from 'lucide-react';
import { useTransactionListManager } from '../hooks/useTransactionListManager';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { EmptyState } from './EmptyState';
import { TransactionDialog } from './TransactionDialog';
import { TransactionTable } from './table';
import { formatCurrency } from '../utils/transactionHelpers';
import RecurringTransactionsList from './RecurringTransactionsList';
import { TransactionImportDialog } from './TransactionImportDialog';
import SectionHeader from "@/components/ui/SectionHeader";
import HelpButton from "@/components/ui/HelpButton";
import TransactionsHowItWorks from './TransactionsHowItWorks';

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
    return (
      <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <RecurringTransactionsList onBack={() => setShowRecurring(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-7xl mx-auto flex flex-col">
        <SectionHeader title="Transactions">
          <div className="flex gap-1 sm:gap-2 items-center">
            <HelpButton title="How Transaction Management Works" size="sm">
              <TransactionsHowItWorks />
            </HelpButton>
            <MonthSelector
              value={selectedDate.format('YYYY-MM')}
              onChange={(yearMonth) => {
                const [year, month] = yearMonth.split('-');
                const newDate = selectedDate.clone().year(parseInt(year)).month(parseInt(month) - 1);
                handleMonthChange(newDate.diff(selectedDate, 'months'));
              }}
              size="default"
            />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">
                {selectedCategory && selectedCategory !== 'all' ? selectedCategory : "Filter"}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportDialog(true)}
            >
              <Upload className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Import</span>
            </Button>
          </div>
        </SectionHeader>

        {/* Expandable filters panel */}
        {showFilters && (
          <div className="p-2 sm:p-3 bg-muted/30 rounded-lg mb-3 sm:mb-4 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 items-start sm:items-center">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
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
          className="fixed bottom-6 right-6 z-50 shadow-lg rounded-full w-14 h-14 flex items-center justify-center text-primary-foreground bg-primary hover:bg-primary/90"
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
    </div>
  );
};

export default TransactionsList;