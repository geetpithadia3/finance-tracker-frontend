import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { CommonContainer, RowContainer, StyledButton } from '../styles/CommonStyles';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DatePickerContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
  z-index: 1000;
  padding: 10px;
`;



const TransactionsDatePicker = styled(DatePicker)`
  width: 100%;
  padding: 10px;
  border: 1px solid #000000;
  border-radius: 0;
  box-sizing: border-box;
  font-size: 16px;
  background-color: #ffffff;
  color: #000000;
  z-index: 1000;
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: 'Helvetica, Arial, sans-serif';

  th, td {
    padding: 12px;
    border: 1px solid #e0e0e0;
    text-align: left;
    font-size: 14px;
    color: #000000;
  }

  th {
    background-color: #f8f9fa;
    font-weight: bold;
  }

  tbody tr:hover {
    background-color: #f1f1f1;
  }

  tfoot {
    font-weight: bold;
  }
`;


const TransactionsList = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchTransactions = (date) => {
    const month = date.toLocaleString('default', { month: 'long' }).toUpperCase();
    const year = date.getFullYear();

    fetch('http://localhost:8080/transactions/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ month, year }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => setTransactions(Array.isArray(data) ? data : []))
      .catch((error) => console.error('Error fetching transactions:', error));
  };



  useEffect(() => {
    fetchTransactions(selectedDate);
  }, [selectedDate]);

  const totalAmount = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

  return (
    <CommonContainer>
      {/* <Title>Transactions</Title> */}
      <RowContainer>
        <DatePickerContainer>
          <TransactionsDatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="MMM/yyyy"
            showMonthYearPicker
          />
        </DatePickerContainer>
        {/* <StyledButton onClick={syncTransactions}>Sync Splitwise</StyledButton> */}
      </RowContainer>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Account ID</th>
              <th>Category</th>
              <th>Description</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.account}</td>
                <td>{transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1).toLowerCase()}</td>
                <td>{transaction.description}</td>
                <td>{transaction.date}</td>
                <td>${transaction.amount}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total</td>
              <td style={{ fontWeight: 'bold' }}>${totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </Table>
      </TableContainer>
    </CommonContainer>
  );
};

export default TransactionsList;
