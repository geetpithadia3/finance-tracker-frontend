import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Upload, Input, DatePicker } from "@/components/ui";
import { UploadOutlined, Edit, Save } from 'lucide-react';
import Papa from 'papaparse';
import moment from 'moment';
import { toast } from "@/components/ui/use-toast";

const { Option } = Select;

const SyncTransactions = () => {
    const [data, setData] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [accountId, setAccountId] = useState('');
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        fetch('http://localhost:8080/account')
            .then(response => response.json())
            .then(data => {
                setAccounts(data);
            })
            .catch(error => console.error('Error fetching accounts:', error));

        fetch('http://localhost:8080/categories')
            .then(response => response.json())
            .then(data => {
                setCategories(data);
            })
            .catch(error => console.error('Error fetching categories:', error));
    }, []);

    const syncSplitwiseTransactions = () => {
        fetch('http://localhost:8080/sync-splitwise', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ account: accountId }),
        })
            .then(response => response.json())
            .then(data => {
                const formattedData = data.map(item => ({
                    key: item.id.toString(),
                    type: item.type.charAt(0).toUpperCase() + item.type.slice(1).toLowerCase(),
                    category: item.category.charAt(0).toUpperCase() + item.category.slice(1).toLowerCase(),
                    date: moment(item.date),
                    amount: item.amount,
                    description: item.description,
                }));
                setData(formattedData);
                toast({ title: 'Success', description: 'Transactions synced successfully' });
            })
            .catch(error => {
                console.error('Error syncing transactions:', error);
                toast({ title: 'Error', description: 'Failed to sync transactions' });
            });
    };

    const handleFileChange = (file) => {
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                const processedData = results.data.map((row, index) => ({
                    key: index.toString(),
                    date: moment(row.Date),
                    description: row.Description,
                    type: row['Type of Transaction'],
                    amount: row.Amount,
                    category: 'General',
                }));
                setData(processedData);
            },
        });
        return false;
    };

    const handleSaveAll = async () => {
        try {
            const formattedData = data.map(item => ({
                ...item,
                occurredOn: item.date.format('YYYY-MM-DD'),
                accountId: accountId,
            }));

            await fetch('http://localhost:8080/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formattedData)
            });
            toast({ title: 'Success', description: 'Transactions saved successfully' });
            setEditMode(false);
        } catch (error) {
            console.error('Error saving transactions:', error);
            toast({ title: 'Error', description: 'Failed to save transactions' });
        }
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (_, record) => (
                <div>
                    {editMode ? (
                        <DatePicker defaultValue={record.date} format="YYYY-MM-DD" />
                    ) : (
                        moment(record.date).format('YYYY-MM-DD')
                    )}
                </div>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (_, record) => (
                <div>
                    {editMode ? <Input defaultValue={record.description} /> : record.description}
                </div>
            ),
        },
        {
            title: 'Type of Transaction',
            dataIndex: 'type',
            key: 'type',
            render: (_, record) => (
                <div>
                    {editMode ? (
                        <Select defaultValue={record.type}>
                            {["Debit", "Credit", "Transfer"].map(type => (
                                <Option key={type} value={type}>
                                    {type}
                                </Option>
                            ))}
                        </Select>
                    ) : (
                        record.type
                    )}
                </div>
            ),
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (_, record) => (
                <div>
                    {editMode ? <Input type="number" defaultValue={record.amount} /> : record.amount}
                </div>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (_, record) => (
                <div>
                    {editMode ? (
                        <Select defaultValue={record.category}>
                            {categories.map(category => (
                                <Option key={category} value={category}>
                                    {category}
                                </Option>
                            ))}
                        </Select>
                    ) : (
                        record.category
                    )}
                </div>
            ),
        }
    ];

    const isAccountSelected = accountId !== '';

    return (
        <div>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <Select
                    style={{ width: '200px' }}
                    placeholder="Select Account"
                    onChange={setAccountId}
                    value={accountId}
                >
                    {accounts.map(account => (
                        <Option key={account.accountId} value={account.accountId}>
                            {account.accountId}
                        </Option>
                    ))}
                </Select>
                <Upload
                    beforeUpload={handleFileChange}
                    showUploadList={false}
                    disabled={!isAccountSelected}
                    accept='.csv'
                >
                    <Button icon={<UploadOutlined />} disabled={!isAccountSelected}>
                        Sync With CSV
                    </Button>
                </Upload>
                <Button type="primary" onClick={syncSplitwiseTransactions} disabled={!isAccountSelected}>
                    Sync Splitwise
                </Button>
            </div>
            <Table
                bordered
                dataSource={data}
                columns={columns}
                rowClassName="editable-row"
                pagination={false}
                scroll={{ y: 800 }}
            />
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <Button
                    onClick={() => setEditMode(!editMode)}
                    style={{ marginRight: '10px' }}
                    icon={editMode ? <Save /> : <Edit />}
                >
                    {editMode ? 'Cancel Edit' : 'Edit All'}
                </Button>
                <Button
                    type="primary"
                    onClick={handleSaveAll}
                    disabled={!isAccountSelected || !editMode}
                    icon={<Save />}
                >
                    Save All
                </Button>
            </div>
        </div>
    );
};

export default SyncTransactions;