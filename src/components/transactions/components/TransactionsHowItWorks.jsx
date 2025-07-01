import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Upload, Tag, CreditCard, Search, FileText, Repeat, Share } from 'lucide-react';

const TransactionsHowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your Bank Statements",
      description: "Import your financial data by uploading CSV files from your bank or credit card statements.",
      details: [
        "Download CSV statements from your bank's website",
        "Drag and drop files or click to browse and select",
        "System automatically detects column formats (date, amount, description)",
        "Supports most major bank CSV formats with intelligent mapping",
        "Upload multiple files at once for different accounts"
      ]
    },
    {
      icon: Tag,
      title: "Categorize Your Transactions",
      description: "Assign meaningful categories to your transactions to track spending patterns and create budgets.",
      details: [
        "Click on any transaction to assign a category",
        "Choose from predefined categories or create custom ones",
        "System learns your preferences and suggests categories",
        "Use bulk actions to categorize multiple similar transactions",
        "Categories enable budget tracking and spending analysis"
      ]
    },
    {
      icon: CreditCard,
      title: "Set Up Recurring Transactions",
      description: "Convert regular income and expenses into recurring transactions for better financial planning.",
      details: [
        "Click 'Make Recurring' on any transaction",
        "Set frequency: weekly, bi-weekly, monthly, quarterly, yearly",
        "Configure date flexibility (±1-3 days) for irregular timing",
        "Enable variable amounts for transactions that change",
        "Perfect for paychecks, rent, utilities, and subscriptions"
      ]
    },
    {
      icon: Search,
      title: "Advanced Transaction Features",
      description: "Use powerful features to manage complex financial situations and maintain accurate records.",
      details: [
        "Split transactions between multiple categories",
        "Process refunds and link them to original purchases",
        "Share transaction costs with roommates or family",
        "Use filters to find specific transactions quickly",
        "Edit transaction details for accuracy"
      ]
    },
    {
      icon: Repeat,
      title: "Manage Recurring Patterns",
      description: "Track and adjust your recurring income and expenses for accurate financial forecasting.",
      details: [
        "View all recurring transactions in one place",
        "Modify frequency or amounts as needed",
        "Temporarily pause recurring items",
        "Delete recurring patterns that no longer apply",
        "Use for Smart Allocation planning"
      ]
    },
    {
      icon: FileText,
      title: "Export and Backup",
      description: "Export your transaction data for external analysis or record keeping.",
      details: [
        "Export filtered transactions to CSV format",
        "Create backups of your financial data",
        "Share data with accountants or financial advisors",
        "Maintain records for tax purposes",
        "Generate reports for specific date ranges"
      ]
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          How Transaction Management Works
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="flex gap-4 p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="flex-shrink-0">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm lg:text-base mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
        
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-purple-800 dark:text-purple-200">
              💡 Transaction Management Best Practices
            </h4>
            <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
              <li>• Upload statements regularly (weekly or monthly) to stay current</li>
              <li>• Categorize transactions immediately after upload</li>
              <li>• Set up recurring transactions for all regular income and expenses</li>
              <li>• Use descriptive category names that make sense to you</li>
              <li>• Review and clean up transactions monthly for accuracy</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-blue-800 dark:text-blue-200">
              📋 Supported File Formats
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• <strong>CSV files</strong> from most major banks and credit unions</li>
              <li>• <strong>Common formats:</strong> Chase, Bank of America, Wells Fargo, etc.</li>
              <li>• <strong>Required columns:</strong> Date, Amount, Description (minimum)</li>
              <li>• <strong>Optional columns:</strong> Category, Account, Reference Number</li>
              <li>• <strong>Auto-detection:</strong> System intelligently maps columns</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsHowItWorks;