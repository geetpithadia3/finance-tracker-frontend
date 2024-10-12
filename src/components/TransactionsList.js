import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Table, DatePicker, Row, Col, Form, Input, Select, Button, message, Modal, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, SaveOutlined, ShareAltOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import moment from 'moment';
import { getAuthHeaders } from '../utils/auth';
import styled from 'styled-components';

const { Option } = Select;

const StyledTable = styled(Table)`
  .ant-table-tbody > tr:nth-child(even) {
    background-color: #f8f8f8;
  }
  .ant-table-cell {
    vertical-align: top;
  }
  .amount-cell {
    text-align: right;
  }
  .edited-row {
    background-color: #e6f7ff;
  }
  .deleted-row {
    background-color: #ffcccb;
    text-decoration: line-through;
  }
`;

const ActionButton = styled(Button)`
  margin-right: 8px;
`;

const ControlsContainer = styled(Row)`
  margin-bottom: 20px;
`;


const ShareModal = ({ visible, onCancel, onOk, transaction, friends }) => {
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [shares, setShares] = useState({});

  const handleFriendSelect = (friendIds) => {
    setSelectedFriends(friendIds);
    const newShares = friendIds.reduce((acc, id) => {
      acc[id] = shares[id] || { owedShare: 0 };
      return acc;
    }, {});
    setShares(newShares);
  };

  const handleShareChange = (friendId, value) => {
    setShares(prev => ({
      ...prev,
      [friendId]: { ...prev[friendId], owedShare: parseFloat(value) || 0 }
    }));
  };

  const handleOk = () => {
    const splitShares = Object.entries(shares).map(([userId, share]) => ({
      userId,
      owedShare: share.owedShare
    }));
    onOk(transaction.id, splitShares);
  };

  return (
    <Modal
      title="Share Expense"
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
    >
      <Select
        style={{ width: '100%', marginBottom: 16 }}
        placeholder="Select friends to share with"
        mode="multiple"
        onChange={handleFriendSelect}
        value={selectedFriends}
      >
        {friends.map(friend => (
          <Option key={friend.id} value={friend.id}>{friend.firstName} {friend.lastName}</Option>
        ))}
      </Select>
      {selectedFriends.map(friendId => {
        const friend = friends.find(f => f.id === friendId);
        return (
          <div key={friendId} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
            <Typography.Text style={{ width: '50%', paddingRight: '8px' }}>
              {friend ? `${friend.firstName}` : ''}
            </Typography.Text>
            <Input
              style={{ width: '50%' }}
              placeholder="Owed Share"
              type="number"
              value={shares[friendId]?.owedShare || ''}
              onChange={(e) => handleShareChange(friendId, e.target.value)}
            />
          </div>
        );
      })}
    </Modal>
  );
};



const TransactionsList = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [sortedInfo, setSortedInfo] = useState({});
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [friends, setFriends] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch('http://localhost:8080/user/friends', {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setFriends(data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const handleChange = (pagination, filters, sorter) => {
    console.log(sorter)
    setSortedInfo(sorter);
  };

  const fetchTransactions = useCallback((date) => {
    const month = date.format('MM').toUpperCase();
    const year = date.year();

    fetch('http://localhost:8080/expenses', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({"yearMonth":year+"-"+month}),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        const formattedData = (Array.isArray(data) ? data : []).map((item) => ({
          ...item,
          key: item.id.toString(),
          date: moment(item.date),
          deleted: false,
        }));
        setTransactions(formattedData);
        form.setFieldsValue(
          formattedData.reduce((acc, item) => {
            acc[item.key] = item;
            return acc;
          }, {})
        );
      })
      .catch((error) => console.error('Error fetching transactions:', error));
  }, [form]);

  useEffect(() => {
    fetchTransactions(selectedDate);
    fetchCategories();
  }, [selectedDate, fetchTransactions]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/categories',{
        method:'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const columns = useMemo(() => [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => a.date - b.date,
      sortOrder: sortedInfo.columnKey === 'date' && sortedInfo.order,
      render: (_, record) => (
        <Form.Item
          name={[record.key, 'date']}
          rules={[{ required: true, message: 'Date is required' }]}
        >
          {moment(record.occurredOn).format('YYYY-MM-DD')}
        </Form.Item>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      sorter: (a, b) => a.category.localeCompare(b.category),
      sortOrder: sortedInfo.columnKey === 'category' && sortedInfo.order,
      render: (_, record) => (
        <Form.Item
          name={[record.key, 'category']}
          rules={[{ required: true, message: 'Category is required' }]}
        >
          {editMode ? (
            <Select>
              {categories.map(category => (
                <Option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()}
                </Option>
              ))}
            </Select>
          ) : (
            record.category.charAt(0).toUpperCase() + record.category.slice(1).toLowerCase()
          )}
        </Form.Item>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      sorter: (a, b) => a.description.localeCompare(b.description),
      sortOrder: sortedInfo.columnKey === 'description' && sortedInfo.order,
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
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a, b) => a.amount - b.amount,
      sortOrder: sortedInfo.columnKey === 'amount' && sortedInfo.order,
      render: (_, record) => (
        <Form.Item
          name={[record.key, 'amount']}
          rules={[{ required: true, message: 'Amount is required' }]}
        >
          {
            `$${parseFloat(record.amount).toFixed(2)}`
          }
        </Form.Item>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
        <Button
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.key)}
          danger={record.deleted}
          disabled={!editMode}
        />
        {record.shareable && (
          <Button
            icon={<ShareAltOutlined />}
            onClick={() => handleShareClick(record)}
          />
        )}
        </>
      ),
    },
  ], [editMode, categories]);

  const handleShareClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShareModalVisible(true);
  };

  const handleShareModalOk = async (transactionId, splitShares) => {
    try {
      const response = await fetch('http://localhost:8080/transactions/share', {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: transactionId,
          description: selectedTransaction.description,
          amount: selectedTransaction.amount,
          category: selectedTransaction.category,
          occurredOn: selectedTransaction.occurredOn,
          account: selectedTransaction.account,
          splitShares: splitShares
        })
      });

      if (response.ok) {
        message.success('Transaction shared successfully');
        setShareModalVisible(false);
        fetchTransactions(selectedDate); // Refresh the transactions list
      } else {
        throw new Error('Failed to share transaction');
      }
    } catch (error) {
      console.error('Error sharing transaction:', error);
      message.error('Failed to share transaction');
    }
  };

  const handleDelete = (key) => {
    setTransactions(prevTransactions =>
      prevTransactions.map(transaction =>
        transaction.key === key
          ? { ...transaction, deleted: !transaction.deleted }
          : transaction
      )
    );
  };

  const handleDateChange = (year, month) => {
    setSelectedDate(moment().year(year).month(month));
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const updatedTransactions = Object.keys(values).map(key => {
        const transaction = transactions.find(t => t.key === key);
        return {
          id: transaction.id, // Include the ID in the payload
          ...values[key],
          account: transaction.account,
          occurredOn: transaction.occurredOn,
          deleted: transaction.deleted,
        };
      });
      console.log(updatedTransactions)

      // Send updated transactions to the backend
      const response = await fetch('http://localhost:8080/transactions', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedTransactions),
      });

      if (response.ok) {
        message.success('Transactions updated successfully');
        setEditMode(false);
        fetchTransactions(selectedDate);
      } else {
        message.error('Failed to update transactions');
      }
    } catch (error) {
      console.error('Error updating transactions:', error);
      message.error('Error updating transactions');
    }
  };

  const totalAmount = useMemo(() => transactions.reduce((sum, transaction) => 
    transaction.deleted ? sum : sum + parseFloat(transaction.amount), 0
  ), [transactions]);

  const scrollYearMonth = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction * 200, behavior: 'smooth' });
    }
  };

  const generateYearMonthButtons = () => {
    const buttons = [];
    const currentYear = selectedDate.year();
    
    for (let year = currentYear; year <= currentYear + 1; year++) {
      moment.months().forEach((month, index) => {
        buttons.push(
          <Button 
            key={`${year}-${month}`}
            type={selectedDate.year() === year && selectedDate.month() === index ? 'primary' : 'default'}
            onClick={() => handleDateChange(year, index)}
            style={{ margin: '0 5px', minWidth: '150px', borderColor: '#000000' }}
          >
            {`${month} ${year}`}
          </Button>
        );
      });
    }
    return buttons;
  };

  return (
    <div>
      <ControlsContainer gutter={[16, 16]}>
        <Col span={24}>
          <Row gutter={[16, 16]} align="middle" wrap={false}>
            <Col>
              <Button icon={<LeftOutlined />} onClick={() => scrollYearMonth(-1)} />
            </Col>
            <Col flex="1">
              <div 
                ref={scrollRef} 
                style={{ 
                  display: 'flex', 
                  overflowX: 'auto', 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  '&::-webkit-scrollbar': { display: 'none' }
                }}
              >
                {generateYearMonthButtons()}
              </div>
            </Col>
            <Col>
              <Button icon={<RightOutlined />} onClick={() => scrollYearMonth(1)} />
            </Col>
          </Row>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          {transactions.length != 0 && <ActionButton
            onClick={() => setEditMode(!editMode)}
            icon={editMode ? <SaveOutlined /> : <EditOutlined />}
          >
            {editMode ? 'Cancel Edit' : 'Edit Transactions'}
          </ActionButton>}
        </Col>
        {editMode && (
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button type="primary" onClick={handleSave} icon={<SaveOutlined />}>
              Save Changes
            </Button>
          </Col>
        )}
      </ControlsContainer>
      <Form form={form} component={false}>
        <StyledTable
          columns={columns}
          dataSource={transactions}
          rowKey={(record) => record.key}
          pagination={false}
          onChange={handleChange}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4}>Total</Table.Summary.Cell>
              <Table.Summary.Cell index={1} className="amount-cell">
                <strong>${totalAmount.toFixed(2)}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} />
            </Table.Summary.Row>
          )}
          scroll={{ x: 'max-content' }}
          rowClassName={(record) => (record.deleted ? 'deleted-row' : '')}
        />
      </Form>
      <ShareModal
        visible={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        onOk={handleShareModalOk}
        transaction={selectedTransaction}
        friends={friends}
      />
    </div>
  );
};

export default React.memo(TransactionsList);
