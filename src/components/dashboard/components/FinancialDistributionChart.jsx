import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#3b82f6']; // Green, Red, Blue

const FinancialDistributionChart = ({ income, expenses, savings }) => {
  // Filter out any items with zero value
  const filteredItems = [
    { name: 'Income', value: parseFloat(income) || 0, color: COLORS[0] },
    { name: 'Expenses', value: parseFloat(expenses) || 0, color: COLORS[1] },
    { name: 'Savings', value: parseFloat(savings) || 0, color: COLORS[2] }
  ].filter(item => item.value > 0);

  const total = filteredItems.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-gray-900 font-bold">${data.value.toFixed(2)}</p>
          <p className="text-gray-500 text-sm">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="w-full max-w-full h-full bg-white border border-gray-200">
      <CardHeader className="pb-2 px-4 pt-4">
        <CardTitle className="text-lg font-semibold text-gray-800">Financial Distribution</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {filteredItems.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">💰</div>
              <div className="text-sm">No financial data available</div>
            </div>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredItems}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {filteredItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialDistributionChart; 