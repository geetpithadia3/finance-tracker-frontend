import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import moment from 'moment';

export const TransactionTable = ({ data, columns }) => (
  <div className="block w-full overflow-x-auto">
    <Table className="min-w-[600px] w-full">
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={index} className="text-xs sm:text-sm font-medium">
              {column.title}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell 
              colSpan={columns.length} 
              className="h-16 sm:h-24 text-center text-xs sm:text-sm text-gray-500"
            >
              Looks like there's nothing here! Time to add some transactions!
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={item.key}>
              {columns.map((column, index) => (
                <TableCell key={index} className="text-xs sm:text-sm py-2 sm:py-3">
                  {column.render ? column.render(item[column.dataIndex]) : item[column.dataIndex]}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
); 