import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import moment from 'moment';

export const TransactionTable = ({ data, categories, editMode }) => {
  return (
    <Table className="flex-1 w-full">
      <TableHeader className="flex-none">
        <TableRow className="bg-secondary/50 hover:bg-secondary/50">
          <TableHead className="font-semibold w-[140px]">Date</TableHead>
          <TableHead className="font-semibold w-[300px]">Description</TableHead>
          <TableHead className="font-semibold w-[120px]">Type</TableHead>
          <TableHead className="font-semibold w-[140px]">Category</TableHead>
          <TableHead className="font-semibold text-right w-[120px]">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="overflow-auto">
        {data.map((record) => (
          <TableRow key={record.id} className="hover:bg-secondary/30">
            <TableCell className="font-medium">
              {moment(record.date).format('MMM D, YYYY')}
            </TableCell>
            <TableCell>
              {editMode ? (
                <Input 
                  defaultValue={record.description}
                  className="w-full"
                />
              ) : (
                record.description
              )}
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs font-medium
              ${record.type === 'Credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {record.type}
              </span>
            </TableCell>
            <TableCell>
              {editMode ? (
                <Select defaultValue={record.category?.id}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {record.category?.name || 'Select category'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-secondary text-xs font-medium">
                  {record.category?.name || 'Uncategorized'}
                </span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <span className={record.type === 'Credit' ? 'text-green-600' : 'text-red-600'}>
                ${parseFloat(record.amount).toFixed(2)}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}; 