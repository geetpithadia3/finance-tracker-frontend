import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Upload, Form, Input, DatePicker, message } from 'antd';
import { UploadOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import moment from 'moment';
import { width } from '@fortawesome/free-solid-svg-icons/fa0';

const { Option } = Select;

const SyncTransactions = () => {
    const [data, setData] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [accountId, setAccountId] = useState('');
    const [form] = Form.useForm();
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
                const camelCase = s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
                const formattedData = data.map(item => ({
                    ...item,
                    key: item.id.toString(),
                    type: camelCase(item.type),
                    category: camelCase(item.category),
                    date: moment(item.date),
                }));
                setData(formattedData);
                form.setFieldsValue(formattedData.reduce((acc, item) => {
                    acc[item.key] = item;
                    return acc;
                }, {}));
            })
            .catch(error => console.error('Error syncing transactions:', error));
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
                form.setFieldsValue(processedData.reduce((acc, item) => {
                    acc[item.key] = item;
                    return acc;
                }, {}));
            },
        });
        return false;
    };

    const handleSaveAll = async () => {
        try {
            const values = await form.validateFields();
            const formattedData = Object.keys(values).map(key => ({
                ...values[key],
                occurredOn: values[key].date.format('YYYY-MM-DD'),
                accountId: accountId,
            }));

            fetch('http://localhost:8080/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formattedData)
            })
                .then(response => {
                    if (response.ok) {
                        message.success('Transactions saved successfully');
                        setEditMode(false);
                    } else {
                        message.error('Failed to save transactions');
                    }
                })
                .catch(error => {
                    message.error('Error saving transactions');
                    console.error('Error:', error);
                });
        } catch (errorInfo) {
            console.error('Validate Failed:', errorInfo);
        }
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',

            render: (_, record) => (
                <Form.Item
                    name={[record.key, 'date']}
                    rules={[{ required: true, message: 'Date is required' }]}
                >
                    {editMode ? (
                        <DatePicker format="YYYY-MM-DD" />
                    ) : (
                        moment(record.date).format('YYYY-MM-DD')
                    )}
                </Form.Item>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',

            render: (_, record) => (
                <Form.Item
                    name={[record.key, 'description']}
                    rules={[{ required: true, message: 'Description is required' }]}
                >
                    {editMode ? <Input /> : record.description}
                </Form.Item>
            ),
        },
        {
            title: 'Type of Transaction',
            dataIndex: 'type',
            key: 'type',

            render: (_, record) => (
                <Form.Item
                    name={[record.key, 'type']}
                    rules={[{ required: true, message: 'Type is required' }]}
                >
                    {editMode ? (
                        <Select>
                            {["Debit", "Credit", "Transfer"].map(type => (
                                <Option key={type} value={type}>
                                    {type}
                                </Option>
                            ))}
                        </Select>
                    ) : (
                        record.type
                    )}
                    {/* {editMode ? <Input /> : record.type} */}
                </Form.Item>
            ),
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',

            render: (_, record) => (
                <Form.Item
                    name={[record.key, 'amount']}
                    rules={[{ required: true, message: 'Amount is required' }]}
                >
                    {editMode ? <Input type="number" /> : record.amount}
                </Form.Item>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',

            render: (_, record) => (
                <Form.Item
                    name={[record.key, 'category']}
                    rules={[{ required: true, message: 'Category is required' }]}
                >
                    {editMode ? (
                        <Select>
                            {categories.map(category => (
                                <Option key={category} value={category}>
                                    {category}
                                </Option>
                            ))}
                        </Select>
                    ) : (
                        record.category
                    )}
                </Form.Item>
            ),
        }
    ];

    const isAccountSelected = accountId !== '';

    return (

        <div >
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
            <Form form={form} component={false}>
                <Table
                    bordered
                    dataSource={data}
                    columns={columns}
                    rowClassName="editable-row"
                    pagination={false}
                    scroll={{ y: 800 }}
                />
            </Form>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <Button
                    onClick={() => setEditMode(!editMode)}
                    style={{ marginRight: '10px' }}
                    icon={editMode ? <SaveOutlined /> : <EditOutlined />}
                >
                    {editMode ? 'Cancel Edit' : 'Edit All'}
                </Button>
                <Button
                    type="primary"
                    onClick={handleSaveAll}
                    disabled={!isAccountSelected || !editMode}
                    icon={<SaveOutlined />}
                >
                    Save All
                </Button>
            </div>
        </div>

    );
};

export default SyncTransactions;