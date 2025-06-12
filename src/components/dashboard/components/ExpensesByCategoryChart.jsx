import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#06b6d4'  // cyan
].map(color => color + '80'); // Adding 50% opacity

const ExpensesByCategoryChart = ({ expensesByCategory }) => {
  const filteredData = expensesByCategory.filter(category => category.value > 0);
  
  const labels = filteredData.map(item => item.category);
  const values = filteredData.map(item => item.value);
  
  const data = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: COLORS.slice(0, filteredData.length),
        borderColor: COLORS.slice(0, filteredData.length),
        borderWidth: 1,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += `$${context.parsed.toFixed(2)}`;
            }
            return label;
          }
        }
      }
    },
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle>Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <Pie data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpensesByCategoryChart; 