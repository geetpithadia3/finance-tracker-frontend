import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import moment from 'moment';

export const TransactionRow = ({ 
  transaction, 
  editMode, 
  categories, 
  onEdit, 
  onClick, 
  inputRef,
  formatCurrency
}) => {
  return (
    <TableRow
      key={transaction.key}
      className={`${transaction.deleted ? 'bg-red-50 line-through' : ''} 
        ${transaction.refunded ? 'bg-yellow-50' : ''} 
        cursor-pointer hover:bg-gray-50`}
      onClick={onClick}
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
            onValueChange={(value) => onEdit(transaction, 'category', value)}
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
            onChange={(e) => onEdit(transaction, 'description', e.target.value)}
            className="h-8 text-sm"
          />
        ) : (
          <div className="text-sm text-gray-600 break-words pr-4">
            {transaction.description}
          </div>
        )}
      </TableCell>
      <TableCell className="align-top py-4 text-right text-sm whitespace-nowrap">
        <div className="flex flex-col items-end">
          {transaction.personalShare > 0 && (
            <span className={`text-xs text-gray-500 mb-0.5`}>
              Your share: {formatCurrency(transaction.personalShare)}
            </span>
          )}
          <span className={`font-medium ${
            transaction.type.toLowerCase() === 'credit'
              ? 'text-green-600'
              : 'text-red-600'
          }`}>
            {formatCurrency(transaction.amount)}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
};
