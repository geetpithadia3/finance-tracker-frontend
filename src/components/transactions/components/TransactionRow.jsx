import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Repeat, RefreshCw, Users, Scissors } from "lucide-react";
import moment from 'moment';
import { Badge } from "@/components/ui/badge";

export const TransactionRow = ({ 
  transaction, 
  editMode, 
  categories, 
  onEdit, 
  onClick, 
  inputRef,
  formatCurrency
}) => {
  // Debug transaction object, particularly the category
  console.log('Transaction in TransactionRow:', transaction);
  console.log('Transaction category:', transaction.category);

  // Handle the case where the category might be a string or an object or missing
  const getCategoryName = () => {
    if (!transaction.category) return 'No Category';
    if (typeof transaction.category === 'string') return transaction.category;
    if (transaction.category.name) return transaction.category.name;
    return 'No Category';
  };

  // Get the current category name
  const categoryName = getCategoryName();

  // Check if transaction is shared
  const isShared = () => {
    return transaction.owedShare > 0 || 
           (transaction.shareMetadata && Object.keys(transaction.shareMetadata).length > 0);
  };

  // Check if transaction is split
  const isSplit = () => {
    return transaction.isSplit || 
           (transaction.parentTransactionId) || 
           (transaction.splitTransactions && transaction.splitTransactions.length > 0);
  };
  
  // Handle row click, preventing actions on refunded transactions
  const handleRowClick = (e) => {
    if (transaction.refunded) {
      // Prevent any action on refunded transactions
      e.stopPropagation();
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <TableRow
      key={transaction.key}
      className={`${transaction.deleted ? 'bg-red-50 dark:bg-red-900/20 line-through' : ''} 
        ${transaction.refunded ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''} 
        cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50`}
      onClick={handleRowClick}
    >
      <TableCell className="align-top py-4 text-sm whitespace-nowrap">
        {moment(transaction.occurredOn).format('YYYY-MM-DD')}
        <div className="flex flex-col gap-1 mt-1">
          {transaction.recurrence && (
            <div className="flex items-center text-blue-600 dark:text-blue-400">
              <Repeat className="h-3 w-3 mr-1" />
              <span className="text-xs">Recurring</span>
            </div>
          )}
          {transaction.refunded && (
            <div className="flex items-center text-amber-600 dark:text-amber-400">
              <RefreshCw className="h-3 w-3 mr-1" />
              <span className="text-xs">Refunded</span>
            </div>
          )}
          {isShared() && (
            <div className="flex items-center text-purple-600 dark:text-purple-400">
              <Users className="h-3 w-3 mr-1" />
              <span className="text-xs">Shared</span>
            </div>
          )}
          {isSplit() && (
            <div className="flex items-center text-indigo-600 dark:text-indigo-400">
              <Scissors className="h-3 w-3 mr-1" />
              <span className="text-xs">Split</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="align-top py-4">
        <Badge
          variant={transaction.type?.toLowerCase() === 'credit' ? 'outline' : 'default'}
        >
          {(transaction.type || 'Unknown').charAt(0).toUpperCase() + (transaction.type || 'Unknown').slice(1).toLowerCase()}
        </Badge>
      </TableCell>
      <TableCell className="align-top py-4">
        {editMode ? (
          <Select
            defaultValue={categoryName}
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
          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            {categoryName}
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
          <div className="flex flex-col">
            <div className="text-sm text-gray-600 dark:text-gray-300 break-words pr-4">
              {transaction.description}
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {transaction.refunded && (
                <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  <RefreshCw className="h-2 w-2 mr-0.5" />
                  Refunded
                </span>
              )}
              {isShared() && (
                <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  <Users className="h-2 w-2 mr-0.5" />
                  Shared
                </span>
              )}
              {isSplit() && (
                <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                  <Scissors className="h-2 w-2 mr-0.5" />
                  Split
                </span>
              )}
            </div>
          </div>
        )}
      </TableCell>
      <TableCell className="align-top py-4 text-right text-sm whitespace-nowrap">
        <div className="flex flex-col items-end">
          {transaction.personalShare > 0 && transaction.personalShare !== transaction.amount && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
              Your share: {formatCurrency(transaction.personalShare)}
            </span>
          )}
          {transaction.owedShare > 0 && (
            <span className="text-xs text-purple-600 dark:text-purple-400 mb-0.5">
              Owed: {formatCurrency(transaction.owedShare)}
            </span>
          )}
          <span className={`font-medium ${
            transaction.type?.toLowerCase() === 'credit'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatCurrency(transaction.amount)}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
};
