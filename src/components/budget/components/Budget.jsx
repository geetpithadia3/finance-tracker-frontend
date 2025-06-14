import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { useBudget } from '../hooks/useBudget';
import { BudgetCategory } from './BudgetCategory';
import { EmptyState } from './EmptyState';
import { ChevronLeft, ChevronRight, FileText, FileDown } from 'lucide-react';
import { budgetsApi } from '@/api/budgets';

const Budget = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    budgets,
    selectedDate,
    setSelectedDate
  } = useBudget();

  const handleMonthChange = (direction) => {
    setSelectedDate(prev => prev.clone().add(direction, 'months'));
  };

  const handleConfigureClick = () => {
    toast({
      title: "Budget Workshop Time! 🛠️",
      description: "Let's craft the perfect budget for your money goals!",
    });
    navigate('/budget/configure');
  };

  const handleDownloadReport = async (format) => {
    try {
      console.log(`Requesting ${format} report...`);
      const response = await budgetsApi.getReport(selectedDate.format('YYYY-MM'), format);
      
      // Debug response
      console.log('Response:', response);
      
      // Extract the blob from axios response
      const blob = new Blob([response.data], { 
        type: format === 'PDF' ? 'application/pdf' : 'text/csv' 
      });
      
      // Debug blob
      console.log('Blob size:', blob.size);
      console.log('Blob type:', blob.type);

      const url = window.URL.createObjectURL(blob);
      console.log('Created URL:', url);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `budget-${selectedDate.format('MMMM YYYY')}.${format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: `Your ${format} report has been downloaded.`,
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      toast({
        title: "Error",
        description: "Failed to download the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (budgets.length === 0) {
    return <EmptyState selectedDate={selectedDate} />;
  }

  return (
    <div className="w-full max-w-full h-[calc(100vh-4rem)] flex flex-col bg-background overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-2 sm:mb-4 w-full max-w-full">
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => handleMonthChange(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm sm:text-lg font-medium min-w-[120px] sm:min-w-[160px] text-center">
            {selectedDate.format('MMMM YYYY')}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => handleMonthChange(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            onClick={() => handleDownloadReport('CSV')}
          >
            <FileDown className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">CSV</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            onClick={() => handleDownloadReport('PDF')}
          >
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
        </div>
        <Button
          variant="outline"
          className="text-xs sm:text-sm w-full sm:w-auto h-8 sm:h-9 px-2 sm:px-3"
          onClick={handleConfigureClick}
        >
          <span className="hidden sm:inline">Configure Budget</span>
          <span className="sm:hidden">Configure</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 overflow-y-auto pb-2 sm:pb-4 w-full max-w-full">
        {budgets.map((budget) => (
          <BudgetCategory
            key={budget.categoryId}
            categoryName={budget.categoryName}
            limit={budget.limit}
            spent={budget.spent}
          />
        ))}
      </div>
    </div>
  );
};

export default Budget;