import React, { useRef } from 'react';
import { TransactionTableHeader } from './TransactionTableHeader';
import { TransactionRow } from './TransactionRow';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Table, TableBody } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Pencil, Save, X } from 'lucide-react';
import { useTransactionListManager } from '../hooks/useTransactionListManager';
import { EmptyState } from './EmptyState';
import { TransactionDialog } from './TransactionDialog';
import { TransactionsTable } from './TransactionsTable';

const TransactionsList = () => {
  const inputRef = useRef(null);
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
    setSelectedTransaction(transaction);
    setTransactionModalOpen(true);
  };

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

        {/* Edit Controls */}
        {transactions.length > 0 && (
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
          </div>
        )}
      </div>

      {/* Transaction Table */}
      {transactions.length === 0 ? (
        <EmptyState selectedDate={selectedDate} />
      ) : (
        <TransactionsTable
          transactions={transactions}
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