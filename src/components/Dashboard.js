import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Tabs, Button } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import moment from 'moment';
import { getAuthHeaders } from '../lib/utils';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { text } from '@fortawesome/fontawesome-svg-core';

const { Title } = Typography;
const { TabPane } = Tabs;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const Dashboard = () => {
    const [expenses, setExpenses] = useState(0);
    const [savings, setSavings] = useState(0);
    const [income, setIncome] = useState(0);
    const [selectedDate, setSelectedDate] = useState(moment().subtract(1, 'months'));
    const [transactions, setTransactions] = useState([]);
    const [incomeTransactions, setIncomeTransactions] = useState([]);
    const [savingsTransactions, setSavingsTransactions] = useState([]);
    const [expensesByCategory, setExpensesByCategory] = useState([]);
    const scrollRef = useRef(null);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);

    useEffect(() => {
        fetchDashboardData(); 
    }, [selectedDate]);

    useEffect(() => {
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const tableHeight = windowHeight - 500;

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
            
            setTransactions(formattedExpenses);
            const totalExpenses = formattedExpenses.reduce((acc, item) => acc + parseFloat(item.amount), 0);
            setExpenses(totalExpenses.toFixed(2));

            const formattedIncome = (Array.isArray(data.income) ? data.income : []).map((item) => ({
                ...item,
                key: item.id.toString(),
                deleted: false,
            }));
            setIncomeTransactions(formattedIncome);
            const totalIncome = formattedIncome.reduce((acc, item) => acc + parseFloat(item.amount), 0);
            setIncome(totalIncome.toFixed(2));

            const formattedSavings = (Array.isArray(data.savings) ? data.savings : []).map((item) => ({
                ...item,
                key: item.id.toString(),
                deleted: false,
            }));
            setSavingsTransactions(formattedSavings);
            const totalSavings = formattedSavings.reduce((acc, item) => acc + parseFloat(item.amount), 0);
            setSavings(totalSavings.toFixed(2));

            // Calculate expenses by category
            const categoryTotals = formattedExpenses.reduce((acc, item) => {
                acc[item.category] = (acc[item.category] || 0) + parseFloat(item.amount);
                return acc;
            }, {});

            const expensesByCategoryData = Object.entries(categoryTotals).map(([category, total]) => ({
                category,
                value: parseFloat(total.toFixed(2)),
            }));

            console.log(expensesByCategory)

            setExpensesByCategory(expensesByCategoryData);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const handleDateChange = (year, month) => {
        setSelectedDate(moment().year(year).month(month));
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
                        style={{ margin: '0 5px', minWidth: '120px', borderColor: '#000000' }}
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
            sorter: (a, b) => moment(a.occurredOn).unix() - moment(b.occurredOn).unix(),
            defaultSortOrder: 'descend'
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => a.description.localeCompare(b.description)
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            sorter: (a, b) => a.category.localeCompare(b.category)
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `$${parseFloat(amount).toFixed(2)}`,
            sorter: (a, b) => parseFloat(a.amount) - parseFloat(b.amount)
        },
    ];

    const incomeAndSavingsColumns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (occurredOn) => moment(occurredOn).format('YYYY-MM-DD'),
            sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
            defaultSortOrder: 'descend'
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            sorter: (a, b) => a.description.localeCompare(b.description)
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `$${parseFloat(amount).toFixed(2)}`,
            sorter: (a, b) => parseFloat(a.amount) - parseFloat(b.amount)
        },
    ];

    const categoryTableColumns = [
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (text) => <span style={{ fontWeight: 'bold' }}>{text}</span>
        },
        {
            title: 'Amount',
            dataIndex: 'value',
            key: 'value',
            render: (value) => `$${value.toFixed(2)}`,
            sorter: (a, b) => a.value - b.value,
            sortDirections: ['descend', 'ascend'],
            defaultSortOrder: 'descend',
        }
    ];

    const totalDistributionData = [
        { name: 'Expenses', value: parseFloat(expenses) },
        { name: 'Income', value: parseFloat(income) },
        { name: 'Savings', value: parseFloat(savings) }
    ];

    // Add these helper functions
    const formatCurrency = (value) => `$${parseFloat(value).toFixed(2)}`;

    const calculateTotal = (data) => {
        return data.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    };

    return (
        <div style={{ padding: '20px' }}>
            <Row gutter={[16, 16]} style={{ marginTop: '20px' }} align="middle" justify="space-between">
                
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
                
            </Row>

            <Card title="Financial Distribution" style={{ marginTop: '20px' }}>
            <Row gutter={[16, 16]} >
                <Col xs={24} md={8}>
                    
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={totalDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="60%"
                                    outerRadius="80%"
                                    dataKey="value"
                                    nameKey="name"
                                    label={false}
                                >
                                    {totalDistributionData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value) => `$${value.toFixed(2)}`}
                                />
                                <Legend 
                                    layout="vertical" 
                                    verticalAlign="middle" 
                                    align="right"
                                    formatter={(value, entry) => `${value} ($${entry.payload.value.toFixed(2)})`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    
                </Col>
                <Col xs={24} md={16}>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
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
                    </Row>
                    <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                        <Col span={12}>
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
                        <Col span={12}>
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
                </Col>
            </Row>
            </Card>

            <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
                <Col span={24}>
                    <Card title="Expenses by Category">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <ResponsiveContainer width="100%" height={500}>
                                    <PieChart>
                                        <Pie
                                            data={expensesByCategory}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius="55%"
                                            outerRadius="75%"
                                            dataKey="value"
                                            nameKey="category"
                                            label={false}
                                        >
                                            {
                                                expensesByCategory.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))
                                            }
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value) => `$${value.toFixed(2)}`}
                                        />
                                        <Legend 
                                            layout="horizontal" 
                                            verticalAlign="bottom" 
                                            align="center"
                                            wrapperStyle={{ fontSize: '12px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Col>
                            <Col span={12}>
                                <div style={{ maxHeight: '500px', overflow: 'auto' }}>
                                    <Table
                                        columns={categoryTableColumns}
                                        dataSource={expensesByCategory}
                                        pagination={false}
                                        size="middle"
                                        scroll={{ y: 400 }}
                                        summary={(pageData) => {
                                            const total = pageData.reduce((acc, curr) => acc + curr.value, 0);
                                            return (
                                                <Table.Summary.Row>
                                                    <Table.Summary.Cell>Total</Table.Summary.Cell>
                                                    <Table.Summary.Cell>
                                                        ${total.toFixed(2)}
                                                    </Table.Summary.Cell>
                                                </Table.Summary.Row>
                                            );
                                        }}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            <Title level={4} style={{ marginTop: '20px' }}>
                {selectedDate.format('MMMM YYYY')} Transactions
            </Title>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Expenses" key="1">
                            <Table
                                columns={expenseColumns}
                                dataSource={transactions}
                                rowKey="id"
                                pagination={false}
                                scroll={{ x: 'max-content', y: tableHeight }}
                                summary={() => (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
                                        <Table.Summary.Cell index={1}></Table.Summary.Cell>
                                        <Table.Summary.Cell index={2}></Table.Summary.Cell>
                                        <Table.Summary.Cell index={3}>
                                            <strong>{formatCurrency(calculateTotal(transactions))}</strong>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                )}
                            />
                        </TabPane>
                        <TabPane tab="Income" key="2">
                            <Table
                                columns={incomeAndSavingsColumns}
                                dataSource={incomeTransactions}
                                rowKey="id"
                                pagination={false}
                                scroll={{ x: 'max-content', y: tableHeight }}
                                summary={() => (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
                                        <Table.Summary.Cell index={1}></Table.Summary.Cell>
                                        <Table.Summary.Cell index={2}>
                                            <strong>{formatCurrency(calculateTotal(incomeTransactions))}</strong>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                )}
                            />
                        </TabPane>
                        <TabPane tab="Savings" key="3">
                            <Table
                                columns={incomeAndSavingsColumns}
                                dataSource={savingsTransactions}
                                rowKey="id"
                                pagination={false}
                                scroll={{ x: 'max-content', y: tableHeight }}
                                summary={() => (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
                                        <Table.Summary.Cell index={1}></Table.Summary.Cell>
                                        <Table.Summary.Cell index={2}>
                                            <strong>{formatCurrency(calculateTotal(savingsTransactions))}</strong>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                )}
                            />
                        </TabPane>
                    </Tabs>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
