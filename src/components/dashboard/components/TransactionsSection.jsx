import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionTable } from './TransactionTable';

const TransactionsSection = ({
  transactions,
  incomeTransactions,
  savingsTransactions,
  expenseColumns,
  incomeAndSavingsColumns
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expenses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses">
            <TransactionTable 
              data={transactions} 
              columns={expenseColumns} 
            />
          </TabsContent>

          <TabsContent value="income">
            <TransactionTable 
              data={incomeTransactions} 
              columns={incomeAndSavingsColumns} 
            />
          </TabsContent>

          <TabsContent value="savings">
            <TransactionTable 
              data={savingsTransactions} 
              columns={incomeAndSavingsColumns} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TransactionsSection; 