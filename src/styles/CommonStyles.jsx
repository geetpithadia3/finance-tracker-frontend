// This file is deprecated - please use shadcn components instead.
// For imports and examples, see documentation for each component:
//
// Button: import { Button } from "@/components/ui/button"
// Input: import { Input } from "@/components/ui/input"
// Select: import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// Card/Container: import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
//
// For styling utilities, use Tailwind classes with the cn utility:
// import { cn } from "@/lib/utils"

import { createTheme } from '@mui/material';
import styled from 'styled-components';

// DEPRECATED: Use shadcn Card component instead
export const CommonContainer = styled.div`
  padding: 20px;
  font-family: Arial, sans-serif;
  max-width: 900px;
  margin: 0 auto;
  background-color: #fff;
  
  border-radius: 8px;
  text-align: center;
`;

// DEPRECATED: Use shadcn Button component with icon instead
// Example: <Button variant="ghost" size="icon"><Icons.trash className="h-4 w-4" /></Button>
export const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 5px;
  transition: color 0.3s;

  &:hover {
    color: #000000;
  }
`;

// DEPRECATED: Consider using Tailwind theme configuration for customization
export const theme = createTheme({
  palette: {
      primary: {
          main: '#000000',
      },
      grey: {
          300: '#e0e0e0',
          500: '#9e9e9e',
      },
      text: {
          primary: '#000000',
          secondary: '#555555',
      },
  },
  typography: {
      fontFamily: 'brandon-grotesque',
      h5: {
          fontWeight: 600,
      },
      body2: {
          fontWeight: 300,
      },
  },
});

// DEPRECATED: Use shadcn Input component instead
// Example: <Input type="text" placeholder="Enter name" />
export const StyledInput = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #000000;
  border-radius: 0;
  box-sizing: border-box;
  background-color: #ffffff;
  color: #000000;
`;

// DEPRECATED: Use shadcn Select component instead
// Example:
// <Select>
//   <SelectTrigger>
//     <SelectValue placeholder="Select option" />
//   </SelectTrigger>
//   <SelectContent>
//     <SelectItem value="option1">Option 1</SelectItem>
//     <SelectItem value="option2">Option 2</SelectItem>
//   </SelectContent>
// </Select>
export const StyledSelect = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #000000;
  border-radius: 0;
  box-sizing: border-box;
  background-color: #ffffff;
  color: #000000;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
`;

// DEPRECATED: Use shadcn SelectItem component instead
export const StyledOption = styled.option`
  background-color: #ffffff;
  color: #000000;
`;

// DEPRECATED: Use Flexbox Tailwind utilities instead
// Example: <div className="flex justify-between items-center mb-5">...</div>
export const RowContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20px;
`;

// DEPRECATED: Use shadcn Button component instead
// Example: <Button variant="outline">Submit</Button>
export const StyledButton = styled.button`
  padding: 10px 20px;
  color: #000000;
  background-color: #e0e0e0;
  border: 1px solid #000000;
  border-radius: 0;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #cccccx;
  }

  &:disabled {
    background-color: #e0e0e0;
    cursor: not-allowed;
  }
`;

// DEPRECATED: Use shadcn Button component with asChild prop for label styling
// Example: 
// <Button asChild variant="outline" disabled={isDisabled}>
//   <label>
//     <input type="file" className="hidden" onChange={handleFileChange} />
//     Upload File
//   </label>
// </Button>
export const StyledButtonLabel = styled.label`
  display: inline-block;
  padding: 10px 20px;
  color: #000000;
  background-color: ${({ disabled }) => (disabled ? '#e0e0e0' : '#f0f0f0')};
  border: 1px solid #000000;
  border-radius: 0;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.3s;

  &:hover {
    background-color: ${({ disabled }) => (disabled ? '#e0e0e0' : '#cccccc')};
  }

  input {
    display: none;
  }

  button{
    display: none
  }
`;