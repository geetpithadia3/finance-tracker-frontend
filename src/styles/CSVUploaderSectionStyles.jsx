import styled from 'styled-components';

export const RowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 10px; /* Add gap between elements */
  position: relative; /* Ensure proper positioning */
  z-index: 10; /* Ensure it appears above other elements */
`;

export const AccountContainer = styled.div`
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: black
    box-sizing: border-box;
    flex-grow: 1;
    margin-right: 10px;
`;



export const InputField = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  flex-grow: 1;
  margin-right: 10px;
`;

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
