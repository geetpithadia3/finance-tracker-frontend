import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, Typography, Progress, Row, Col, Button, Tooltip, Modal, Form, Input, DatePicker, message } from 'antd';
import { CalendarOutlined, DollarOutlined, MoneyCollectOutlined, EditOutlined, StockOutlined, PlusSquareOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;

const GoalCard = React.memo(({ goal, onEdit }) => {
    return (
      <Card
        title={goal.name}
        extra={<Button icon={<EditOutlined />} onClick={() => onEdit(goal)} />}
      >
        <Text type="secondary">{goal.description}</Text>
        <Progress
          type="line"
          percent={((goal.amountProgress / goal.amountTarget) * 100).toFixed(2)}
          format={percent => `${percent}%`}
        />
        <Row gutter={[8, 8]} style={{ marginTop: '20px' }}>
          <Col span={24}>
            <Tooltip title="Target Date">
              <CalendarOutlined /> {moment(goal.targetDate).format('MMM DD, YYYY')}
            </Tooltip>
          </Col>
          <Col span={24}>
            <Tooltip title="To Save">
              <DollarOutlined /> ${goal.amountTarget.toFixed(2)}
            </Tooltip>
          </Col>
          <Col span={24}>
            <Tooltip title="Until Now">
              <StockOutlined /> ${goal.amountProgress.toFixed(2)}
            </Tooltip>
          </Col>
          <Col span={24}>
            <Tooltip title="To Save Per Pay Period">
              <MoneyCollectOutlined /> ${goal.amountPerPayPeriod.toFixed(2)}
            </Tooltip>
          </Col>
        </Row>
      </Card>
    );
  });

const GoalsList = () => {
  const [goals, setGoals] = useState([]);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedGoal, setSelectedGoal] = useState(null);

  const fetchGoals = useCallback(() => {
    fetch('http://localhost:8080/goal')
      .then(response => response.json())
      .then(data => setGoals(data))
      .catch(error => console.error('Error fetching goals:', error));
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const showModal = useCallback((mode, goal = null) => {
    setModalMode(mode);
    setSelectedGoal(goal);
    if (mode === 'add') {
      form.resetFields();
    } else {
      form.setFieldsValue({
        ...goal,
        targetDate: moment(goal.targetDate),
        updatedOn: moment()
      });
    }
    setIsModalVisible(true);
  }, [form]);

  const handleOk = useCallback(() => {
    form.validateFields().then(values => {
      const url = modalMode === 'add' ? 'http://localhost:8080/goal' : 'http://localhost:8080/goal/update';
      const method = 'POST';
      const body = modalMode === 'add' ? values : {
        goalId: selectedGoal.id,
        amount: values.amount,
        updatedOn: values.updatedOn.format('YYYY-MM-DD')
      };

      fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(response => {
          if (response.ok) {
            message.success(`Goal ${modalMode === 'add' ? 'added' : 'updated'} successfully`);
            setIsModalVisible(false);
            fetchGoals();
          } else {
            throw new Error('Network response was not ok');
          }
        })
        .catch(error => {
          console.error('Error saving goal:', error);
          message.error(`Failed to ${modalMode === 'add' ? 'add' : 'update'} goal`);
        });
    });
  }, [form, modalMode, selectedGoal, fetchGoals]);

  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const memoizedGoals = useMemo(() => goals.map(goal => (
    <Col xs={24} sm={24} md={12} lg={8} xl={6} key={goal.id}>
      <GoalCard goal={goal} onEdit={(goal) => showModal('update', goal)} />
    </Col>
  )), [goals, showModal]);

  return (
    <div>
      <Button type="primary" onClick={() => showModal('add')}>New Goal</Button>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        {memoizedGoals}
      </Row>
      
      <Modal
        title={modalMode === 'add' ? 'Add New Goal' : 'Update Goal'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
                <Form form={form} layout="vertical">
                    {modalMode === 'add' && (
                        <>
                            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="description" label="Description">
                                <Input.TextArea />
                            </Form.Item>
                            <Form.Item name="targetDate" label="Target Date" rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="amountTarget" label="Target Amount" rules={[{ required: true }]}>
                                <Input type="number" defaultValue="0" />
                            </Form.Item>
                        </>
                    )}
                    <Form.Item name="amount" label="Amount Progress" rules={[{ required: true }]}>
                        <Input type="number" defaultValue="0" />
                    </Form.Item>
                    {modalMode === 'update' && (
                        <Form.Item name="updatedOn" label="Updated On" rules={[{ required: true }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default React.memo(GoalsList);