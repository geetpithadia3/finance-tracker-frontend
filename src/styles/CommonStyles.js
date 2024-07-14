import { createTheme } from '@mui/material';
import styled from 'styled-components';

export const CommonContainer = styled.div`
  padding: 20px;
  font-family: Arial, sans-serif;
  max-width: 900px;
  margin: 0 auto;
  background-color: #fff;
  
  border-radius: 8px;
  text-align: center;
`;

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

export const StyledInput = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #000000;
  border-radius: 0;
  box-sizing: border-box;
  background-color: #ffffff;
  color: #000000;
`;

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

export const StyledOption = styled.option`
  background-color: #ffffff;
  color: #000000;
`;

export const RowContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20px;
`;

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