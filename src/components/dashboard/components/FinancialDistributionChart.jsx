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
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle>Financial Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <Pie data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialDistributionChart; 