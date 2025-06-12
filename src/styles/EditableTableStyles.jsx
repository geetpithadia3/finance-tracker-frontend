// This file is deprecated - please use shadcn Table and Input components instead.
// Import examples:
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Input } from "@/components/ui/input"

import styled from 'styled-components';

export const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  max-height: 900px; /* Adjust as needed */
  position: relative; /* Ensure it appears above other elements */
  z-index: 1;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th, td {
    border: none;
    padding: 12px;
    text-align: left;
  }

  th {
    background-color: #f8f9fa;
    color: #495057;
    position: sticky;
    top: 0;
    z-index: 2; /* Ensure it appears above other elements */
  }

  td {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  tr:hover {
    background-color: #e9ecef;
  }
`;

// DEPRECATED: Use shadcn Table components with proper styling instead
export const EditableTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
  }

  tr:hover {
    background-color: #f5f5f5;
  }
`;

// DEPRECATED: Use shadcn Input component instead
export const EditableCell = styled.input`
  width: 100%;
  padding: 5px;
  border: 1px solid #ddd;
  box-sizing: border-box;
  font-family: inherit;
  font-size: inherit;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;