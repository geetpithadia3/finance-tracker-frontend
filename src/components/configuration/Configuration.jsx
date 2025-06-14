import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Wallet, Calendar, PiggyBank, Settings, ListChecks, Calculator } from "lucide-react";
import IncomeConfiguration from './IncomeConfiguration';
import CategoryConfiguration from './CategoryConfiguration';

const Configuration = () => {
  const [openDialog, setOpenDialog] = useState('');
  
  const configurationWidgets = [
    // {
    //   id: 'income',
    //   title: 'Income Settings',
    //   icon: <Wallet className="h-6 w-6" />,
    //   description: 'Configure your income sources and payment schedules',
    //   component: <IncomeConfiguration />
    // },
    {
      id: 'categories',
      title: 'Categories',
      icon: <ListChecks className="h-6 w-6" />,
      description: 'Manage your expense categories',
      component: <CategoryConfiguration />
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-1 sm:px-0">
      {configurationWidgets.map((widget) => (
        <Dialog key={widget.id} open={openDialog === widget.id} onOpenChange={(open) => setOpenDialog(open ? widget.id : '')}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                  <div className="h-5 w-5 sm:h-6 sm:w-6">
                    {React.cloneElement(widget.icon, { className: "h-5 w-5 sm:h-6 sm:w-6" })}
                  </div>
                  <h3 className="font-semibold text-sm sm:text-lg">{widget.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{widget.description}</p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sm sm:text-base">{widget.title}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
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