import React from 'react';
import { Table, TableBody } from "@/components/ui/table";
import { TransactionTableHeader } from './TransactionTableHeader';
import { TransactionRow } from './TransactionRow';

export const TransactionsTable = ({
  transactions,
  categories,
  editMode,
  sortConfig,
  inputRef,
  onEdit,
  onTransactionClick,
  formatCurrency,
  onRequestSort
}) => {
  return (
    <div className="border rounded-lg mt-4 overflow-hidden">
      <Table>
        <TransactionTableHeader 
          sortConfig={sortConfig}
          onRequestSort={onRequestSort}
        />
        <TableBody>
          {transactions.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              categories={categories}
              editMode={editMode}
              inputRef={inputRef}
              onEdit={onEdit}
              onClick={() => onTransactionClick(transaction)}
              formatCurrency={formatCurrency}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};