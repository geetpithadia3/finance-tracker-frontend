import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Tabs, Button } from 'antd';
import { DollarOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import moment from 'moment';
import { getAuthHeaders } from '../utils/auth';

const { Title } = Typography;
const { TabPane } = Tabs;

const Dashboard = () => {
    const [expenses, setExpenses] = useState(0);
    const [savings, setSavings] = useState(0);
    const [income, setIncome] = useState(0);
    const [selectedDate, setSelectedDate] = useState(moment());
    const [transactions, setTransactions] = useState([]);
    const [incomeTransactions, setIncomeTransactions] = useState([]);
    const [savingsTransactions, setSavingsTransactions] = useState([]);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchDashboardData(); 
    }, [selectedDate]);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch(`http://localhost:8080/dashboard?yearMonth=${selectedDate.format('YYYY-MM')}`, {
                method: "GET",
                headers: getAuthHeaders()
            });
            const data = await response.json();
            
            const formattedExpenses = (Array.isArray(data.expenses) ? data.expenses : []).map((item) => ({
                ...item,
                key: item.id.toString(),
                deleted: false,
            }));
            console.log(formattedExpenses)
            setTransactions(formattedExpenses);
            const totalExpenses = formattedExpenses.reduce((acc, item) => acc + parseFloat(item.amount), 0);
            setExpenses(totalExpenses.toFixed(2));

            const formattedIncome = (Array.isArray(data.income) ? data.income : []).map((item) => ({
                ...item,
                key: item.id.toString(),
                deleted: false,
            }));
            console.log(formattedIncome)
            setIncomeTransactions(formattedIncome);
            const totalIncome = formattedIncome.reduce((acc, item) => acc + parseFloat(item.amount), 0);
            setIncome(totalIncome.toFixed(2));

            const formattedSavings = (Array.isArray(data.savings) ? data.savings : []).map((item) => ({
                ...item,
                key: item.id.toString(),
                deleted: false,
            }));
            console.log(formattedSavings)
            setSavingsTransactions(formattedSavings);
            const totalSavings = formattedSavings.reduce((acc, item) => acc + parseFloat(item.amount), 0);
            setSavings(totalSavings.toFixed(2));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const handleDateChange = (year, month) => {
        setSelectedDate(moment().year(year).month(month));
    };

    const scrollYearMonth = (direction) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: direction * 200, behavior: 'smooth' });
        }
    };

    const generateYearMonthButtons = () => {
        const buttons = [];
        const currentYear = selectedDate.year();
        
        for (let year = currentYear ; year <= currentYear + 1; year++) {
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

    const expenseColumns = [
        {
            title: 'Date',
            dataIndex: 'occurredOn',
            key: 'occurredOn',
            render: (occurredOn) => moment(occurredOn).format('YYYY-MM-DD'),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `$${parseFloat(amount).toFixed(2)}`,
        },
    ];

    const incomeAndSavingsColumns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (occurredOn) => moment(occurredOn).format('YYYY-MM-DD'),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `$${parseFloat(amount).toFixed(2)}`,
        },
    ];

    return (
        <div style={{ padding: '20px' }}>
            <Row gutter={[16, 16]} style={{ marginTop: '20px' }} align="middle" wrap={false}>
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

            <Row gutter={16} style={{ marginTop: '20px' }}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Expenses"
                            value={expenses}
                            precision={2}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<DollarOutlined />}

                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Income"
                            value={income}
                            precision={2}
                            valueStyle={{ color: '#096dd9' }}
                            prefix={<DollarOutlined />}

                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Savings"
                            value={savings}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarOutlined />}

                        />
                    </Card>
                </Col>
                
            </Row>

            <Title level={4} style={{ marginTop: '20px' }}>
                {selectedDate.format('MMMM YYYY')} Transactions
            </Title>
            <Tabs defaultActiveKey="1">
                <TabPane tab="Expenses" key="1">
                    <Table
                        columns={expenseColumns}
                        dataSource={transactions}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                </TabPane>
                <TabPane tab="Income" key="2">
                    <Table
                        columns={incomeAndSavingsColumns}
                        dataSource={incomeTransactions}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                </TabPane>
                <TabPane tab="Savings" key="3">
                    <Table
                        columns={incomeAndSavingsColumns}
                        dataSource={savingsTransactions}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                </TabPane>
            </Tabs>
        </div>
    );
};

export default Dashboard;
