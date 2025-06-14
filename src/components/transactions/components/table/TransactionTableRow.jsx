import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Repeat, RefreshCw, Users, Scissors } from "lucide-react";
import moment from 'moment';
import { Badge } from "@/components/ui/badge";
import { 
  formatCurrency, 
  getCategoryName, 
  isSharedTransaction, 
  isSplitTransaction,
  getTransactionAmountColor 
} from '../../utils/transactionHelpers';

export const TransactionTableRow = ({ 
  transaction, 
  editMode, 
  categories, 
  onEdit, 
  onClick, 
  inputRef
}) => {
  const categoryName = getCategoryName(transaction);
  const isShared = isSharedTransaction(transaction);
  const isSplit = isSplitTransaction(transaction);
  
  const handleRowClick = (e) => {
    if (transaction.refunded) {
      e.stopPropagation();
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  const TransactionIndicator = ({ icon: Icon, label, color }) => (
    <div className={`flex items-center ${color}`}>
      <Icon className="h-3 w-3 mr-1" />
      <span className="text-xs">{label}</span>
    </div>
  );

  const TransactionBadge = ({ icon: Icon, label, color }) => (
    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${color}`}>
      <Icon className="h-2 w-2 mr-0.5" />
      {label}
    </span>
  );

  return (
    <TableRow
      key={transaction.key}
      className={`${transaction.deleted ? 'bg-red-50 dark:bg-red-900/20 line-through' : ''} 
        ${transaction.refunded ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''} 
        cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50`}
      onClick={handleRowClick}
    >
      <TableCell className="align-top py-2 sm:py-4 text-xs sm:text-sm whitespace-nowrap max-w-full">
        {moment(transaction.occurredOn).format('YYYY-MM-DD')}
        <div className="flex flex-col gap-1 mt-1">
          {transaction.recurrence && (
            <TransactionIndicator 
              icon={Repeat} 
              label="Recurring" 
              color="text-blue-600 dark:text-blue-400" 
            />
          )}
          {transaction.refunded && (
            <TransactionIndicator 
              icon={RefreshCw} 
              label="Refunded" 
              color="text-amber-600 dark:text-amber-400" 
            />
          )}
          {isShared && (
            <TransactionIndicator 
              icon={Users} 
              label="Shared" 
              color="text-purple-600 dark:text-purple-400" 
            />
          )}
          {isSplit && (
            <TransactionIndicator 
              icon={Scissors} 
              label="Split" 
              color="text-indigo-600 dark:text-indigo-400" 
            />
          )}
        </div>
      </TableCell>
      
      <TableCell className="align-top py-2 sm:py-4 text-xs sm:text-sm max-w-full">
        <Badge
          variant={transaction.type?.toLowerCase() === 'credit' ? 'outline' : 'default'}
        >
          {(transaction.type || 'Unknown').charAt(0).toUpperCase() + (transaction.type || 'Unknown').slice(1).toLowerCase()}
        </Badge>
      </TableCell>
      
      <TableCell className="align-top py-2 sm:py-4 text-xs sm:text-sm max-w-full">
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
      
      <TableCell className="max-w-[120px] sm:min-w-[200px] sm:max-w-[400px] xl:max-w-[500px] py-2 sm:py-4 text-xs sm:text-sm truncate align-top">
        {editMode ? (
          <Input
            ref={inputRef}
            value={transaction.description}
            onChange={(e) => onEdit(transaction, 'description', e.target.value)}
            className="h-8 text-sm"
          />
        ) : (
          <div className="flex flex-col">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 break-words pr-2 sm:pr-4 truncate max-w-full">
              {transaction.description}
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {transaction.refunded && (
                <TransactionBadge 
                  icon={RefreshCw} 
                  label="Refunded"
                  color="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                />
              )}
              {isShared && (
                <TransactionBadge 
                  icon={Users} 
                  label="Shared"
                  color="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                />
              )}
              {isSplit && (
                <TransactionBadge 
                  icon={Scissors} 
                  label="Split"
                  color="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                />
              )}
            </div>
          </div>
        )}
      </TableCell>
      
      <TableCell className="align-top py-2 sm:py-4 text-right text-xs sm:text-sm whitespace-nowrap max-w-full">
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
          <span className={`font-medium ${getTransactionAmountColor(transaction.type)}`}>
            {formatCurrency(transaction.amount)}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
};