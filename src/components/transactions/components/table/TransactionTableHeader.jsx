import React from 'react';
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from 'lucide-react';

export const TransactionTableHeader = ({ sortConfig, onRequestSort }) => {
  const columns = [
    { key: 'occurredOn', label: 'Date', className: 'w-[80px] sm:w-[110px] text-xs sm:text-sm' },
    { key: 'type', label: 'Type', className: 'w-[60px] sm:w-[90px] text-xs sm:text-sm' },
    { key: 'category', label: 'Category', className: 'w-[90px] sm:w-[120px] text-xs sm:text-sm' },
    { key: 'description', label: 'Description', className: 'max-w-[120px] sm:min-w-[200px] sm:max-w-[400px] xl:max-w-[500px] truncate text-xs sm:text-sm' },
    { key: 'amount', label: 'Amount', className: 'w-[70px] sm:w-[100px] text-right text-xs sm:text-sm' },
  ];

  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        {columns.map(({ key, label, className }) => (
          <TableHead key={key} className={className + " whitespace-nowrap"}>
            <div 
              className={`flex items-center gap-1 cursor-pointer ${key === 'amount' ? 'justify-end' : ''}`}
              onClick={() => onRequestSort(key)}
            >
              {label}
              {sortConfig.key === key && (
                sortConfig.direction === 'ascending' ?
                  <ChevronUp className="h-4 w-4" /> :
                  <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};