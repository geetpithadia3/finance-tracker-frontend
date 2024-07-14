import React, { useEffect, useState } from 'react';
import EditableTable from './EditableTable';
import styled from 'styled-components';
import Papa from 'papaparse';
import { CommonContainer, StyledButton, StyledButtonLabel } from '../styles/CommonStyles';

const RowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;



const AccountContainer = styled.div`
  display: flex;
  align-items: center;
`;

const SaveButton = styled.button`
  padding: 10px 20px;
  color: #000000;
  background-color: #ffffff;
  border: 1px solid #000000;
  border-radius: 0;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #cccccc;
  }

  &:disabled {
    background-color: #e0e0e0;
    cursor: not-allowed;
  }
`;


const SyncTransactions = () => {
    const [data, setData] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [inputKey, setInputKey] = useState(Date.now());
    const [accountId, setAccountId] = useState('');

    const syncSplitwiseTransactions = () => {
        let account = accountId
        fetch('http://localhost:8080/sync-splitwise', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({  account }),
        })
        .then(response => {
            let data = response.json()
            const camelCase = s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
            data.then(dataArray => {
                dataArray.forEach(item => {
                    item.type = camelCase(item.type);
                    item.category = camelCase(item.category);
                });
            });
            console.log(data)
            return data
        })
        .then(data => setData(data))
          .catch((error) => console.error('Error syncing transactions:', error));
      };

    useEffect(() => {
        fetch('http://localhost:8080/account')
            .then(response => response.json())
            .then(data => {
                const accountIds = data.map(account => account.accountId);
                setAccounts(accountIds);
            })
            .catch(error => console.error('Error fetching accounts:', error));
    }, []);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                complete: (results) => {
                    const processedData = results.data.map((row) => ({
                        date: row.Date,
                        description: row.Description,
                        type: row['Type of Transaction'],
                        amount: row.Amount,
                        category: 'General' // Add default category value
                    }));
                    setData(processedData);
                    setInputKey(Date.now()); // Reset the file input by changing the key
                },
            });
        }
    };

    const isAccountSelected = accountId;

    return (
        <CommonContainer>
            <RowContainer>
                <StyledButtonLabel disabled={!isAccountSelected}>
                    Sync With CSV
                    <input key={inputKey} type="file" accept=".csv" onChange={handleFileChange} disabled={!isAccountSelected} />
                </StyledButtonLabel>
                <AccountContainer>
                    Account:
                    <select
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        style={{
                            padding: '10px 20px',
                            color: '#000000',
                            backgroundColor: '#ffffff',
                            border: '1px solid #000000',
                            borderRadius: '0',
                            cursor: 'pointer',
                            flexGrow: 1,
                            marginLeft: '10px',
                            marginRight: '10px',
                        }}
                    >
                        <option value="" disabled>Select Account</option>
                        {accounts.map((accountId) => (
                            <option key={accountId} value={accountId}>
                                {accountId}
                            </option>
                        ))}
                    </select>
                </AccountContainer>
                <StyledButtonLabel disabled={!isAccountSelected}>
                    Sync Splitwise
                    <StyledButton disabled={!isAccountSelected} onClick={syncSplitwiseTransactions}/>
                </StyledButtonLabel>
            </RowContainer>
            {data.length > 0 && (
                <EditableTable
                    data={data}
                    setData={setData}
                    accounts={accounts}
                    forAccount={accountId}
                />
            )}
        </CommonContainer>
    );
};

export default SyncTransactions;
