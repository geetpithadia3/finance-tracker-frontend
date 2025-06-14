import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ['#3b82f6', '#ef4444', '#10b981'].map(color => color + '80'); // Adding 50% opacity

const FinancialDistributionChart = ({ income, expenses, savings }) => {
  // Filter out any items with zero value
  const filteredItems = [
    { name: 'Income', value: parseFloat(income) },
    { name: 'Expenses', value: parseFloat(expenses) },
    { name: 'Savings', value: parseFloat(savings) }
  ].filter(item => item.value > 0);

  const labels = filteredItems.map(item => item.name);
  const values = filteredItems.map(item => item.value);

  const data = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: COLORS,
        borderColor: COLORS,
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
    <Card className="w-full max-w-full h-full">
      <CardHeader className="pb-1 sm:pb-2 px-2 sm:px-4">
        <CardTitle className="text-xs sm:text-base">Financial Distribution</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-4 py-1 sm:py-2 overflow-x-auto">
        <div className="h-[200px] sm:h-[280px] w-full min-w-[220px]">
          <Pie data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialDistributionChart; 