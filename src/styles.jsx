// This file is deprecated - please use shadcn components instead.
// For containers, use Card components or Tailwind classes:
// import { Card, CardContent } from "@/components/ui/card"
// For tables, use the shadcn Table components:
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import styled from 'styled-components';

// DEPRECATED: Use Card component or Tailwind classes instead
// Example: <div className="p-5 font-sans"></div>
export const AppContainer = styled.div`
  padding: 20px;
  font-family: Arial, sans-serif;
`;

// DEPRECATED: Use shadcn Table components instead
// Example:
// <Table>
//   <TableHeader>
//     <TableRow>
//       <TableHead>Column 1</TableHead>
//       <TableHead>Column 2</TableHead>
//     </TableRow>
//   </TableHeader>
//   <TableBody>
//     <TableRow>
//       <TableCell>Cell 1</TableCell>
//       <TableCell>
//         <Button variant="destructive" size="sm">Delete</Button>
//       </TableCell>
//     </TableRow>
//   </TableBody>
// </Table>
export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
  }

  th {
    background-color: #f2f2f2;
    text-align: left;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #ddd;
  }

  button {
    background-color: #f44336;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
  }
`;