import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const StatCard = ({ title, value, icon: Icon }) => (
  <Card className="w-full max-w-full">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-2 sm:px-4">
      <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent className="px-2 sm:px-4 py-1 sm:py-2">
      <div className="text-lg sm:text-2xl font-semibold">${parseFloat(value).toFixed(2)}</div>
    </CardContent>
  </Card>
); 