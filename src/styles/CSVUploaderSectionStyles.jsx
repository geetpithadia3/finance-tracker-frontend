// This file is deprecated - please use shadcn components and Tailwind utilities instead.
// Import examples:
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent } from "@/components/ui/card"
// Use Tailwind classes for layout: className="flex justify-between items-center gap-4 mb-5"

import styled from 'styled-components';

// DEPRECATED: Use Tailwind flex utilities instead
// Example: <div className="flex items-center justify-between mb-5 gap-3 relative z-10">...</div>
export const RowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 10px; /* Add gap between elements */
  position: relative; /* Ensure proper positioning */
  z-index: 10; /* Ensure it appears above other elements */
`;

// DEPRECATED: Use shadcn Card or Select component instead
// Example: 
// <Card className="flex-grow mr-2">
//   <CardContent className="p-2 bg-black">...</CardContent>
// </Card>
export const AccountContainer = styled.div`
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: black
    box-sizing: border-box;
    flex-grow: 1;
    margin-right: 10px;
`;

// DEPRECATED: Use shadcn Input component instead
// Example: <Input className="flex-grow mr-2" />
export const InputField = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  flex-grow: 1;
  margin-right: 10px;
`;

// DEPRECATED: Use shadcn Button component instead
// Example: <Button variant="success" className="flex-grow ml-2" disabled={isDisabled}>Save</Button>
export const SaveButton = styled.button`
  padding: 10px 20px;
  color: #fff;
  background-color: #28a745;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  flex-grow: 1;
  margin-left: 10px;

  &:hover {
    background-color: #218838;
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

// DEPRECATED: Use shadcn Card component instead
// Example: 
// <Card className="max-w-3xl mx-auto relative z-1">
//   <CardContent className="p-5 text-center">...</CardContent>
// </Card>
export const UploaderContainer = styled.div`
  padding: 20px;
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  text-align: center;
  position: relative; /* Ensure proper positioning */
  z-index: 1; /* Ensure it appears above other elements */
`;
