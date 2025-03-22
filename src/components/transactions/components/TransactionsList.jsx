import React, { useRef, useState } from 'react';
import { TransactionTableHeader } from './TransactionTableHeader';
import { TransactionRow } from './TransactionRow';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Table, TableBody } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Pencil, Save, X, Filter, Repeat } from 'lucide-react';
import { useTransactionListManager } from '../hooks/useTransactionListManager';
import { EmptyState } from './EmptyState';
import { TransactionDialog } from './TransactionDialog';
import { TransactionsTable } from './TransactionsTable';
import RecurringTransactionsList from './RecurringTransactionsList';

const TransactionsList = () => {
  const inputRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showRecurring, setShowRecurring] = useState(false);

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

  const filteredTransactions = selectedCategory && selectedCategory !== 'all'
    ? transactions.filter(transaction => transaction.category.name === selectedCategory)
    : transactions;

  if (showRecurring) {
    return <RecurringTransactionsList onBack={() => setShowRecurring(false)} />;
  }

  return (
    <div className="flex flex-col">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Month Navigation */}
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

        {/* Filter and Edit Controls */}
        <div className="flex items-center justify-center sm:justify-end gap-2">
          <Button
            variant="outline"
            className="h-9 text-sm font-medium"
            onClick={() => setShowRecurring(true)}
          >
            <Repeat className="mr-2 h-4 w-4" />
            View Recurring
          </Button>
          
          <div className="flex items-center gap-2">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px] h-9">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by category" />
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
            {selectedCategory && selectedCategory !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="h-9 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {transactions.length > 0 && (
            <div className="flex items-center gap-2">
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
            </div>
          )}
        </div>
      </div>

      {/* Transaction Table */}
      {filteredTransactions.length === 0 ? (
        <EmptyState selectedDate={selectedDate} />
      ) : (
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
      )}

      {/* Transaction Dialog */}
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
    </div>
  );
};

export default TransactionsList;