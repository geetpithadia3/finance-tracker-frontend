import React from 'react';
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from 'lucide-react';

export const TransactionTableHeader = ({ sortConfig, onRequestSort }) => {
  const columns = [
    { key: 'occurredOn', label: 'Date', className: 'w-[110px]' },
    { key: 'type', label: 'Type', className: 'w-[90px]' },
    { key: 'category', label: 'Category', className: 'w-[120px]' },
    { key: 'description', label: 'Description', className: 'min-w-[200px] max-w-[400px] xl:max-w-[500px]' },
    { key: 'amount', label: 'Amount', className: 'w-[100px] text-right' },
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