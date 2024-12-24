import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Wallet, Calendar, PiggyBank, Settings, ListChecks } from "lucide-react";
import IncomeConfiguration from './IncomeConfiguration';
import CategoryConfiguration from './CategoryConfiguration';

const Configuration = () => {
  const [openDialog, setOpenDialog] = useState('');
  
  const configurationWidgets = [
    {
      id: 'income',
      title: 'Income Settings',
      icon: <Wallet className="h-6 w-6" />,
      description: 'Configure your income sources and payment schedules',
      component: <IncomeConfiguration />
    },
    {
      id: 'expenses',
      title: 'Expense Categories',
      icon: <PiggyBank className="h-6 w-6" />,
      description: 'Set up your expense categories and budgets',
      component: <ExpenseConfiguration />
    },
    {
      id: 'categories',
      title: 'Categories',
      icon: <ListChecks className="h-6 w-6" />,
      description: 'Manage your expense categories',
      component: <CategoryConfiguration />
    },
    // Add more configuration widgets as needed
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {configurationWidgets.map((widget) => (
        <Dialog key={widget.id} open={openDialog === widget.id} onOpenChange={(open) => setOpenDialog(open ? widget.id : '')}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  {widget.icon}
                  <h3 className="font-semibold text-lg">{widget.title}</h3>
                  <p className="text-sm text-muted-foreground">{widget.description}</p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{widget.title}</DialogTitle>
              <DialogDescription>
                {widget.description}
              </DialogDescription>
            </DialogHeader>
            {widget.component}
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
};



const ExpenseConfiguration = () => {
  return (
    <div className="space-y-4">
      {/* Expense configuration UI */}
    </div>
  );
};

export default Configuration;