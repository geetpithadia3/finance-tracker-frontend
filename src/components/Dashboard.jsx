import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAuthHeaders } from '../utils/auth';
import { ChevronLeft, ChevronRight, DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import moment from 'moment';
import { Progress } from "@/components/ui/progress";
import { budgetsApi } from '../api/budgets';

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(moment().subtract(1, 'months'));
  const [expenses, setExpenses] = useState(0);
  const [savings, setSavings] = useState(0);
  const [income, setIncome] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [incomeTransactions, setIncomeTransactions] = useState([]);
  const [savingsTransactions, setSavingsTransactions] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [budgets, setBudgets] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate]);

  const fetchDashboardData = async () => {
    try {
      const data = await budgetsApi.getDashboardData(selectedDate.format('YYYY-MM'));

      const formattedExpenses = (Array.isArray(data.expenses) ? data.expenses : [])
        .map(item => ({
          ...item,
          key: item.id.toString(),
          deleted: false,
        }));
      setTransactions(formattedExpenses);
      setExpenses(formattedExpenses.reduce((acc, item) => acc + parseFloat(item.amount), 0).toFixed(2));

      const formattedIncome = (Array.isArray(data.income) ? data.income : [])
        .map(item => ({
          ...item,
          key: item.id.toString(),
          deleted: false,
        }));
      setIncomeTransactions(formattedIncome);
      setIncome(formattedIncome.reduce((acc, item) => acc + parseFloat(item.amount), 0).toFixed(2));

      const formattedSavings = (Array.isArray(data.savings) ? data.savings : [])
        .map(item => ({
          ...item,
          key: item.id.toString(),
          deleted: false,
        }));
      setSavingsTransactions(formattedSavings);
      setSavings(formattedSavings.reduce((acc, item) => acc + parseFloat(item.amount), 0).toFixed(2));

      // Calculate expenses by category
      const categoryTotals = formattedExpenses.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + parseFloat(item.amount);
        return acc;
      }, {});

      setExpensesByCategory(
        Object.entries(categoryTotals).map(([category, total]) => ({
          category,
          value: parseFloat(total.toFixed(2)),
        }))
      );

      if (Array.isArray(data.budgets)) {
        const budgetProgress = data.budgets.map(budget => ({
          ...budget,
          spent: formattedExpenses
            .filter(expense => expense.category === budget.category)
            .reduce((acc, expense) => acc + parseFloat(expense.amount), 0),
        }));
        setBudgets(budgetProgress);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleMonthChange = (direction) => {
    setSelectedDate(prev => prev.clone().add(direction, 'months'));
  };

  const StatCard = ({ title, value, trend, icon: Icon }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${parseFloat(value).toFixed(2)}</div>
      </CardContent>
    </Card>
  );

  const renderTransactionTable = (data, columns) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>{column.title}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.key}>
                {columns.map((column, index) => (
                  <TableCell key={index}>
                    {column.render ? column.render(item[column.dataIndex]) : item[column.dataIndex]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const expenseColumns = [
    {
      title: 'Date',
      dataIndex: 'occurredOn',
      render: (date) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'Category',
      dataIndex: 'category',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (amount) => `$${parseFloat(amount).toFixed(2)}`,
    },
  ];

  const incomeAndSavingsColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      render: (date) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (amount) => `$${parseFloat(amount).toFixed(2)}`,
    },
  ];

  const BudgetProgressCard = ({ budget }) => {
    const percentage = (budget.spent / budget.amount) * 100;
    const isOverBudget = percentage > 100;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">{budget.category}</span>
          <span className={`text-sm ${isOverBudget ? 'text-red-500' : ''}`}>
            ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
          </span>
        </div>
        <Progress
          value={Math.min(percentage, 100)}
          className={isOverBudget ? "bg-red-200" : ""}
          indicatorClassName={isOverBudget ? "bg-red-500" : ""}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleMonthChange(-1)}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[120px] text-center font-medium">
            {selectedDate.format('MMM YYYY')}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleMonthChange(1)}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Income"
          value={income}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Expenses"
          value={expenses}
          icon={TrendingDown}
        />
        <StatCard
          title="Total Savings"
          value={savings}
          icon={Wallet}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Financial Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {parseFloat(income) === 0 && parseFloat(expenses) === 0 && parseFloat(savings) === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Income', value: parseFloat(income) },
                        { name: 'Expenses', value: parseFloat(expenses) },
                        { name: 'Savings', value: parseFloat(savings) },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="80%"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {expensesByCategory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="80%"
                      dataKey="value"
                      nameKey="category"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="expenses" className="space-y-4">
            <TabsList>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="savings">Savings</TabsTrigger>
            </TabsList>
            <TabsContent value="expenses">
              <ScrollArea className="h-[400px]">
                {renderTransactionTable(transactions, expenseColumns)}
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="income">
              <ScrollArea className="h-[400px]">
                {renderTransactionTable(incomeTransactions, incomeAndSavingsColumns)}
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="savings">
              <ScrollArea className="h-[400px]">
                {renderTransactionTable(savingsTransactions, incomeAndSavingsColumns)}
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;