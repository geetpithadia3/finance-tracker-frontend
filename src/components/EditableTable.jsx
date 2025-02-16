import React, { useState, useEffect } from 'react';
import DatePickerCell from './DatePickerCell';
import EditableCell from './EditableCell';
import CategorySelect from './CategorySelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCut, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import { IconButton, StyledButton, StyledButtonLabel } from '../styles/CommonStyles';
import categoriesApi from '@/api/categories';
import { transactionsApi } from '@/api/transactions';

const TableContainer = styled.div`
  width: 100%;
  height: 700px;
  overflow-y: auto;
`;

const Container = styled.div`
  width: 100%;
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
    position: sticky;
    top: 0;
    z-index: 2;
  }

  tbody tr:hover {
    background-color: #f1f1f1;
  }
`;



const TransactionTypeSelect = styled.select`
  width: 100%;
  padding: 4px;
  border: 1px solid #000000;
  border-radius: 0;
  font-size: 14px;
  background-color: #ffffff;
  color: #000000;
`;

const EditableTable = ({ data, setData, accounts, forAccount }) => {

  const [categories, setCategories] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const isEditable = !isSaved

  console.log(data)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getAll();
        const camelCaseList = list => list.map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
        setCategories(camelCaseList(data));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleSave = async () => {
    const mappedData = data.map(row => ({
      accountId: forAccount,
      amount: parseFloat(row.amount),
      description: row.description,
      category: row.category,
      occurredOn: new Date(row.date).toISOString().split('T')[0],
      type: row.type,
      toAccount: row.type === 'Transfer' ? row.transferAccount : null
    }));
    
    try {
      const response = await transactionsApi.create(mappedData);
      console.log('Success:', response);
      setIsSaved(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateRowData = (rowIndex, columnId, value) => {
    setData((oldData) => {
      const newData = [...oldData];
      newData[rowIndex][columnId] = value;
      return newData;
    });
  };

  const removeRow = (rowIndex) => {
    setData((oldData) => oldData.filter((_, index) => index !== rowIndex));
  };

  const handleTypeChange = (rowIndex, value) => {
    updateRowData(rowIndex, 'type', value);
    if (value === 'Transfer') {
      updateRowData(rowIndex, 'category', 'Transfer');
    } else {
      updateRowData(rowIndex, 'transferAccount', '');
    }
  };

  const handleSplit = (rowIndex) => {
    setData((oldData) => {
      const newData = [...oldData];
      newData.splice(rowIndex + 1, 0, {
        date: '',
        description: '',
        type: '',
        amount: '',
        category: ''
      });
      return newData;
    });
  };

  return (
    <Container>
      <div style={{display:'flex', justifyContent:'flex-end'}}>
      <StyledButtonLabel >
        Save
        <StyledButton onClick={handleSave} ></StyledButton>
      </StyledButtonLabel>
      </div>
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Type of Transaction</th>
            <th>Amount</th>
            <th>Category</th>
            {isEditable && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td>
                {isEditable ? (
                  <DatePickerCell
                    value={row.date}
                    onChange={(value) => updateRowData(rowIndex, 'date', value)}
                  />
                ) : (
                  row.date
                )}
              </td>
              <td>
                {isEditable ? (
                  <EditableCell
                    value={row.description}
                    onChange={(value) => updateRowData(rowIndex, 'description', value)}
                  />
                ) : (
                  row.description
                )}
              </td>
              <td>
                {isEditable ? (
                  <>
                    <TransactionTypeSelect
                      value={row.type}
                      onChange={(e) => handleTypeChange(rowIndex, e.target.value)}
                    >
                      <option value="" disabled>Select type</option>
                      <option value="Credit">Credit</option>
                      <option value="Debit">Debit</option>
                      <option value="Transfer">Transfer</option>
                    </TransactionTypeSelect>
                    {row.type === 'Transfer' && (
                      <TransactionTypeSelect
                        value={row.transferAccount || ''}
                        onChange={(e) => updateRowData(rowIndex, 'transferAccount', e.target.value)}
                      >
                        <option value="">Select account</option>
                        {accounts.map((account) => (
                          <option key={account} value={account}>
                            {account}
                          </option>
                        ))}
                      </TransactionTypeSelect>
                    )}
                  </>
                ) : (
                  row.type === 'Transfer' ? `${row.type} to ${row.transferAccount || 'N/A'}` : row.type
                )}
              </td>
              <td>
                {isEditable ? (
                  <EditableCell
                    type="number"
                    value={row.amount}
                    onChange={(value) => updateRowData(rowIndex, 'amount', value)}
                  />
                ) : (
                  '$' + row.amount
                )}
              </td>
              <td>
                {isEditable && row.type !== 'Transfer' ? (
                  <CategorySelect
                    value={row.category}
                    onChange={(value) => updateRowData(rowIndex, 'category', value)}
                    categories={categories}
                  />
                ) : (
                  row.category
                )}
              </td>
              {isEditable && <td>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton onClick={() => handleSplit(rowIndex)}>
                    <FontAwesomeIcon icon={faCut} />
                  </IconButton>
                  <IconButton onClick={() => removeRow(rowIndex)}>
                    <FontAwesomeIcon icon={faTrashCan} />
                  </IconButton>
                </div>
              </td>}
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
    </Container>
  );
};

export default EditableTable;
