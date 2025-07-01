import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Filter, Repeat, Upload, Plus } from 'lucide-react';
import { useTransactionListManager } from '../hooks/useTransactionListManager';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { EmptyState } from './EmptyState';
import { TransactionDialog } from './TransactionDialog';
import { TransactionTable } from './table';
import { formatCurrency } from '../utils/transactionHelpers';
import RecurringTransactionsList from './RecurringTransactionsList';
import { TransactionImportDialog } from './TransactionImportDialog';
import SectionHeader from "@/components/ui/SectionHeader";
import HelpButton from "@/components/ui/HelpButton";
import TransactionsHowItWorks from './TransactionsHowItWorks';

const TransactionsList = () => {
  const inputRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showRecurring, setShowRecurring] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const {
    transactions,
    categories,
    selectedDate,
    editMode,
    selectedTransaction,
    transactionModalOpen,
    sortConfig,
    setTransactionModalOpen,
    setSelectedTransaction,
    setEditMode,
    handleMonthChange,
    handleEdit,
    handleSaveChanges,
    fetchTransactions,
    handleRequestSort,
  } = useTransactionListManager();


  const handleTransactionClick = (transaction) => {
    if (!editMode) {
      setSelectedTransaction(transaction);
      setTransactionModalOpen(true);
    }
  };

  // Helper function to get category name from a transaction
  const getCategoryName = (transaction) => {
    if (!transaction.category) return '';
    return typeof transaction.category === 'string' 
      ? transaction.category 
      : transaction.category.name || '';
  };

  const filteredTransactions = selectedCategory && selectedCategory !== 'all'
    ? transactions.filter(transaction => {
        const categoryName = getCategoryName(transaction);
        return categoryName === selectedCategory;
      })
    : transactions;

  if (showRecurring) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 text-foreground p-4 sm:p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Sumi Header for Recurring */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">墨</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Repeating Patterns</h1>
                <p className="text-sm text-muted-foreground">
                  Life's rhythms reflected in mindful repetition
                </p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={() => setShowRecurring(false)}
              className="rounded-full"
            >
              ← Return to Current Month
            </Button>
          </div>
          
          <RecurringTransactionsList onBack={() => setShowRecurring(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 text-foreground p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Sumi Header - Philosophy-Inspired */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">墨</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Financial Brushstrokes</h1>
              <p className="text-sm text-muted-foreground">
                {selectedDate.format('MMMM YYYY')} • Every transaction tells your story
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <MonthSelector
              value={selectedDate.format('YYYY-MM')}
              onChange={(yearMonth) => {
                const [year, month] = yearMonth.split('-');
                const newDate = selectedDate.clone().year(parseInt(year)).month(parseInt(month) - 1);
                handleMonthChange(newDate.diff(selectedDate, 'months'));
              }}
              size="default"
            />
            <HelpButton title="The Art of Mindful Spending" buttonText="Philosophy" size="sm">
              <TransactionsHowItWorks />
            </HelpButton>
          </div>
        </div>

        {/* Intentional Actions - Simplified */}
        <div className="flex justify-center">
          <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-full px-6 py-3 border border-muted/30">
            <Button 
              variant={showFilters ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Focus
            </Button>
            <div className="w-px h-6 bg-border"></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRecurring(true)}
              className="rounded-full"
            >
              <Repeat className="h-4 w-4 mr-2" />
              Patterns
            </Button>
            <div className="w-px h-6 bg-border"></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImportDialog(true)}
              className="rounded-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        {/* Mindful Focus - Category Filter */}
        {showFilters && (
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl p-6 border border-muted/30">
              <div className="text-center space-y-4">
                <h3 className="text-sm font-medium text-foreground">Focus Your Intention</h3>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full rounded-full bg-background/50 border-muted/50">
                    <SelectValue placeholder="All Spending Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground italic">
                  "Focus reveals patterns, patterns reveal wisdom"
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Your Financial Story */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">Your Financial Journey</h2>
            <p className="text-sm text-muted-foreground">
              {filteredTransactions.length === 0 
                ? "Awaiting your first intentional brushstroke"
                : `${filteredTransactions.length} mindful actions${selectedCategory && selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}`
              }
            </p>
          </div>

          {filteredTransactions.length === 0 ? (
            <EmptyState selectedDate={selectedDate} />
          ) : (
            <div className="relative rounded-xl border border-muted/30 overflow-hidden bg-card/30 backdrop-blur-sm">
              {editMode && (
                <div className="p-4 bg-primary/5 flex justify-between items-center border-b border-primary/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-sm text-foreground font-medium">Refining Your Story</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditMode(false)} className="rounded-full">
                      Cancel
                    </Button>
                    <Button size="sm" variant="default" onClick={handleSaveChanges} className="rounded-full">
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
              
              <TransactionTable
                transactions={filteredTransactions}
                categories={categories}
                editMode={editMode}
                sortConfig={sortConfig}
                inputRef={inputRef}
                onEdit={handleEdit}
                onTransactionClick={handleTransactionClick}
                onRequestSort={handleRequestSort}
              />
              
              {!editMode && (
                <div className="p-4 flex justify-center border-t border-muted/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditMode(true)}
                    className="rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Refine Your Story
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dialogs */}
        <TransactionDialog
          open={transactionModalOpen}
          transaction={selectedTransaction}
          categories={categories}
          onClose={() => {
            setTransactionModalOpen(false);
            setSelectedTransaction(null);
          }}
          onRefresh={() => fetchTransactions(selectedDate)}
        />

        {showImportDialog && (
          <TransactionImportDialog
            onClose={() => {
              setShowImportDialog(false);
              fetchTransactions(selectedDate);
            }}
          />
        )}

        {/* Mindful Action - Add New Brushstroke */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end space-y-3">
          <div className="text-right">
            <p className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border border-muted/30">
              Add a mindful action
            </p>
          </div>
          <Button
            variant="default"
            size="icon"
            className="shadow-lg rounded-full w-16 h-16 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 border border-primary/20"
            onClick={() => {
              const generalCategory = categories.find(cat => cat.name === 'General') || categories[0] || { id: '', name: 'General' };
              setSelectedTransaction({
                id: `new-${Date.now()}`,
                description: '',
                amount: '',
                type: 'DEBIT',
                occurredOn: selectedDate.clone().startOf('month').format('YYYY-MM-DD'),
                category: generalCategory,
                categoryId: generalCategory.id,
                personalShare: 0,
                owedShare: 0,
                shareMetadata: '',
                isNew: true
              });
              setTransactionModalOpen(true);
            }}
            title="Record Mindful Transaction"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </div>

        {/* Sumi Wisdom Footer */}
        <div className="text-center py-8 border-t border-muted/30 mt-16">
          <p className="text-sm text-muted-foreground italic">
            "Each transaction is a brushstroke. What story are you painting with your money?"
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransactionsList;