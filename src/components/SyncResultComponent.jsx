import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Upload, Form, Input, DatePicker, message, Popconfirm, Modal } from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined, SaveOutlined, InboxOutlined } from '@ant-design/icons';
import Papa from 'papaparse';
import moment from 'moment';
import { getAuthHeaders } from '../utils/auth';

const { Option } = Select;

export const SyncResultComponent = ({ syncType, selectedAccount, onClose }) => {
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [form] = Form.useForm();
    const [editMode, setEditMode] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(syncType === 'csv');

    useEffect(() => {
        fetchCategories();
        if (syncType === 'splitwise') {
            fetchSplitwiseTransactions();
        }
    }, [syncType, selectedAccount]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:8080/categories', {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSplitwiseTransactions = () => {
        fetch('http://localhost:8080/sync-transactions', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ accountId: selectedAccount }),
        })
            .then(response => response.json())
            .catch(error => console.error('Error syncing transactions:', error));
    };

    const handleFileChange = (file) => {
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                const formattedData = formatTransactions(results.data);
                setData(formattedData);
                form.setFieldsValue(formattedData.reduce((acc, item) => {
                    acc[item.key] = item;
                    return acc;
                }, {}));
            },
        });
        return false;
    };

    const formatTransactions = (transactions) => {
        return transactions.map((item, index) => ({
            key: index.toString(),
            date: moment(item.date || item.Date),
            description: item.description || item.Description,
            type: item.type || item['Type of Transaction'],
            amount: item.amount || item.Amount,
            category: item.category || 'General',
        }));
    };

    const handleSaveAll = async () => {
        try {
            const values = await form.validateFields();
            const formattedData = Object.keys(values).map(key => {
                const item = values[key];
                return {
                    ...item,
                    occurredOn: item.date.format('YYYY-MM-DD'),
                    accountId: selectedAccount,
                    category: item.type === 'Transfer' ? 'Transfer' : item.category,
                    toAccount: item.type === 'Transfer' ? item.toAccount : undefined,
                };
            });
            console.log(formattedData)
            fetch('http://localhost:8080/transactions', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formattedData)
            })
                .then(response => {
                    if (response.ok) {
                        message.success('Transactions saved successfully');
                        onClose();
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
            width:'1',
            render: (_, record) => (
                <Form.Item
                    name={[record.key, 'date']}
                    rules={[{ required: true, message: 'Date is required' }]}
                >
                    
                        {moment(record.date).format('YYYY-MM-DD')}
                    
                </Form.Item>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width:'1',
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
            width:'1',
            render: (_, record) => (
                <Form.Item
                    name={[record.key, 'type']}
                    rules={[{ required: true, message: 'Type is required' }]}
                >
                    {editMode ? (
                        <Select>
                            {["Debit", "Credit"].map(type => (
                                <Option key={type} value={type}>
                                    {type}
                                </Option>
                            ))}
                        </Select>
                    ) : (
                        record.type
                    )}
                </Form.Item>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width:'1',
            render: (_, record) => (
                <Form.Item
                    name={[record.key, 'category']}
                    rules={[{ required: true, message: 'Category is required' }]}
                >
                    {editMode ? (
                        (
                            <Select>
                                {categories.map(category => (
                                    <Option key={category} value={category}>
                                        {category}
                                    </Option>
                                ))}
                            </Select>
                        )
                    ) : (
                        record.category
                    )}
                </Form.Item>
            ),
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            width:'1',
            render: (_, record) => (
                <Form.Item
                    name={[record.key, 'amount']}
                    rules={[{ required: true, message: 'Amount is required' }]}
                >
                    {editMode ? <Input type="number" /> : record.amount}
                </Form.Item>
            ),
        }
    ];

    const handleClose = () => {
        setIsModalVisible(false);
        onClose();
    };

    return (
        <Modal
            open={isModalVisible}
            onCancel={handleClose}
            footer={null}
            width="1000px"
            destroyOnClose={true}
        >
            {syncType === 'csv' && (
                <div>
                    <Upload.Dragger
                        beforeUpload={handleFileChange}
                        showUploadList={false}
                        accept='.csv'
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    </Upload.Dragger>
                    <Form form={form} component={false}>
                        <Table
                            bordered
                            dataSource={data}
                            columns={columns}
                            rowClassName="editable-row"
                            pagination={false}
                            scroll={{  y: 400 }}

                        />
                    </Form>
                    <div style={{ marginTop: '20px', textAlign: 'right' }}>
                        <Button
                            onClick={() => setEditMode(!editMode)}
                            style={{ marginRight: '10px' }}
                            disabled={!data.length}
                            icon={editMode ? <SaveOutlined /> : <EditOutlined />}
                        >
                            {editMode ? 'Cancel Edit' : 'Edit All'}
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleSaveAll}
                            disabled={!data.length}
                            icon={<SaveOutlined />}
                        >
                            Save All
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};
