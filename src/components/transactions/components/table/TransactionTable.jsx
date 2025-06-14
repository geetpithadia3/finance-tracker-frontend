import React from 'react';
import { Table, TableBody } from "@/components/ui/table";
import { TransactionTableHeader } from './TransactionTableHeader';
import { TransactionTableRow } from './TransactionTableRow';

export const TransactionTable = ({
  transactions,
  categories,
  editMode,
  sortConfig,
  inputRef,
  onEdit,
  onTransactionClick,
  onRequestSort
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-[500px] sm:min-w-[600px] w-full">
        <TransactionTableHeader 
          sortConfig={sortConfig}
          onRequestSort={onRequestSort}
        />
        <TableBody>
          {transactions.map((transaction) => (
            <TransactionTableRow
              key={transaction.id}
              transaction={transaction}
              categories={categories}
              editMode={editMode}
              inputRef={inputRef}
              onEdit={onEdit}
              onClick={() => onTransactionClick(transaction)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};