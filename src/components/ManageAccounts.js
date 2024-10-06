import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Button, Modal, Form, Input, Select, Upload, message, Tooltip, Space } from 'antd';
import { AccountBookOutlined, WalletOutlined, UploadOutlined, SyncOutlined, PlusSquareOutlined, BankOutlined, DollarCircleOutlined, } from '@ant-design/icons';
import { SyncResultComponent } from './SyncResultComponent';
import { getAuthHeaders } from '../utils/auth';
import styled from 'styled-components';

const { Option } = Select;
const { Text } = Typography;

const StyledCard = styled(Card)`
  .ant-card-head {
    background-color: #f0f2f5;
  }
  .ant-card-body {
    padding: 20px;
  }
`;

const AccountBalance = styled(Text)`
  font-size: 24px;
  font-weight: bold;
  display: block;
  margin-bottom: 16px;
`;

const AccountDetail = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const DetailIcon = styled.span`
  margin-right: 8px;
  color: #1890ff;
`;

const ManageAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [syncModalVisible, setSyncModalVisible] = useState(false);
    const [syncType, setSyncType] = useState(null);
    const [syncAccount, setSyncAccount] = useState(null);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await fetch('http://localhost:8080/account', {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            setAccounts(data);
        } catch (error) {
            console.error('Error fetching accounts:', error);
            message.error('Failed to fetch accounts');
        }
    };

    const handleSyncOpen = (account, type) => {
        setSyncAccount(account);
        setSyncType(type);
        setSyncModalVisible(true);
        
    };

    const handleSyncClose = () => {
        fetchAccounts()
        setSyncModalVisible(false);
        setSyncAccount(null);
        setSyncType(null);
    };

    const handleOpen = () => {
        setSelectedAccount({
            name: '',
            type: 'Savings',
            org: 'Scotia',
            initialBalance: '',
            currency: 'CAD',
        });
        setIsModalVisible(true);
    };

    const handleClose = () => {
        setIsModalVisible(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedAccount({ ...selectedAccount, [name]: value });
    };

    const handleSave = async () => {
        const url = 'http://localhost:8080/account';
        const method = 'POST';

        try {
            await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(selectedAccount)
            });
            message.success('Account saved successfully');
            setTimeout(fetchAccounts, 500);
            setIsModalVisible(false);
        } catch (error) {
            console.error('Error saving account:', error);
            message.error('Failed to save account');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
                <Col>
                    
                </Col>
                <Col>
                    <Tooltip title="Add Account">
                        <Button onClick={handleOpen} icon={<PlusSquareOutlined />} type="primary">
                            Add Account
                        </Button>
                    </Tooltip>
                </Col>
            </Row>
            <Row gutter={[16, 16]}>
                {accounts.map(account => (
                    <Col xs={24} sm={12} md={8} lg={6} key={account.id}>
                        <StyledCard
                            title={account.name}
                            extra={
                                <Space>
                                   
                                    {account.org !== 'SPLITWISE' && (
                                        <Tooltip title="Upload CSV">
                                            <Button onClick={() => handleSyncOpen(account, 'csv')} icon={<UploadOutlined />} />
                                        </Tooltip>
                                    )}
                                    {account.org === 'SPLITWISE' && (
                                        <Tooltip title="Sync with Splitwise">
                                            <Button onClick={() => handleSyncOpen(account, 'splitwise')} icon={<SyncOutlined />} />
                                        </Tooltip>
                                    )}
                                </Space>
                            }
                        >
                             <AccountBalance>${account.balance.toFixed(2)}</AccountBalance>
                                <Space direction="vertical" size="small">
                                <AccountDetail>
                                    <DetailIcon><DollarCircleOutlined /></DetailIcon>
                                    <Text><strong>Type:</strong> {account.type}</Text>
                                </AccountDetail>
                                <AccountDetail>
                                    <DetailIcon><BankOutlined /></DetailIcon>
                                    <Text><strong>{account.org}</strong></Text>
                                </AccountDetail>
                            </Space>
                        </StyledCard>
                    </Col>
                ))}
            </Row>
            
            <Modal
                title="Add Account"
                open={isModalVisible}
                onCancel={handleClose}
                onOk={handleSave}
            >
                <Form layout="vertical">
                    <Form.Item label="Name">
                        <Input
                            type="text"
                            name="name"
                            value={selectedAccount?.name}
                            onChange={handleChange}
                        />
                    </Form.Item>
                    <Form.Item label="Type">
                        <Select
                            name="type"
                            value={selectedAccount?.type}
                            onChange={(value) => handleChange({ target: { name: 'type', value } })}
                        >
                            <Option value="Savings">Savings</Option>
                            <Option value="Checking">Checking</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Organization">
                        <Select
                            name="org"
                            value={selectedAccount?.org}
                            onChange={(value) => handleChange({ target: { name: 'org', value } })}
                        >
                            <Option value="Scotia">Scotia</Option>
                            <Option value="WealthSimple">WealthSimple</Option>
                            <Option value="Splitwise">Splitwise</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Initial Balance">
                        <Input
                            type="number"
                            name="initialBalance"
                            value={selectedAccount?.initialBalance}
                            onChange={handleChange}
                        />
                    </Form.Item>
                    <Form.Item label="Currency">
                        <Input
                            name="currency"
                            value={selectedAccount?.currency}
                            onChange={handleChange}
                            disabled
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                open={syncModalVisible}
                onCancel={handleSyncClose}
                footer={null}
                width="1000px"
                destroyOnClose={true}
            >
                <SyncResultComponent
                    syncType={syncType}
                    selectedAccount={syncAccount?.accountId}
                    onClose={handleSyncClose}
                />
            </Modal>
        </div>
    );
};

export default ManageAccounts;