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
    <Card className="w-full max-w-full">
      <CardHeader className="px-2 sm:px-4 py-2">
        <CardTitle className="text-xs sm:text-base">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-4 py-2 overflow-x-auto">
        <Tabs defaultValue="expenses" className="space-y-2 sm:space-y-4 w-full max-w-full">
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