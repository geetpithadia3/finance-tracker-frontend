import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Plus, Copy, Edit, Trash2, Calendar, FolderOpen, TrendingUp, Target, DollarSign, Clock, AlertTriangle, CheckCircle, XCircle, InfoIcon, Sparkles, Zap, ArrowUpDown } from 'lucide-react';
import { useBudget } from '../hooks/useBudget';
import { BudgetForm } from './BudgetForm';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { BudgetSpendingCard } from './BudgetSpendingCard';
import { ProjectBudgetForm } from './ProjectBudgetForm';
import { ProjectBudgetCard } from './ProjectBudgetCard';
import { BudgetOverlapDialog } from './BudgetOverlapDialog';
import { BudgetAlerts } from './BudgetAlerts';
import { budgetAPI } from '../../../api/budgets';
import { useToast } from '../../../hooks/use-toast';
import HelpButton from '../../ui/HelpButton';
import BudgetHowItWorks from './BudgetHowItWorks';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function BudgetDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [copyFromMonth, setCopyFromMonth] = useState('');
  const [activeSection, setActiveSection] = useState('monthly'); // 'monthly' or 'projects'
  
  // Project budget state
  const [projectBudgets, setProjectBudgets] = useState([]);
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false);
  const [editingProjectBudget, setEditingProjectBudget] = useState(null);
  const [projectBudgetsLoading, setProjectBudgetsLoading] = useState(false);

  console.log('BudgetDashboard render - projectBudgets:', projectBudgets.length, 'loading:', projectBudgetsLoading);
  
  // Overlap conflict state  
  const [showOverlapDialog, setShowOverlapDialog] = useState(false);
  const [overlapConflictData, setOverlapConflictData] = useState(null);
  const [pendingBudgetData, setPendingBudgetData] = useState(null);
  
  // Rollover status state
  const [rolloverStatus, setRolloverStatus] = useState(null);
  const [rolloverRecalculating, setRolloverRecalculating] = useState(false);
  
  // Alerts expansion state
  const [alertsExpanded, setAlertsExpanded] = useState(false);
  
  const { toast } = useToast();

  const {
    budgets,
    currentBudget,
    budgetSpending,
    loading,
    fetchBudgets,
    fetchBudgetByMonth,
    fetchBudgetSpending,
    createBudget,
    updateBudget,
    deleteBudget,
    copyBudget,
    clearBudgetData,
  } = useBudget();

  // Project budget functions
  const fetchProjectBudgets = useCallback(async () => {
    try {
      setProjectBudgetsLoading(true);
      const data = await budgetAPI.getProjectBudgets(0, 100, true);
      console.log('Project budgets fetched:', data);
      setProjectBudgets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch project budgets:', err);
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Failed to fetch project budgets",
        variant: "destructive",
      });
      setProjectBudgets([]);
    } finally {
      setProjectBudgetsLoading(false);
    }
  }, [toast]);

  const fetchRolloverStatus = useCallback(async (yearMonth) => {
    try {
      const status = await budgetAPI.getRolloverStatus(yearMonth);
      setRolloverStatus(status);
    } catch (err) {
      // Don't show error toast for rollover status - it's not critical
      console.warn('Failed to fetch rollover status:', err);
      setRolloverStatus(null);
    }
  }, []);

  const handleRecalculateRollover = async () => {
    if (rolloverRecalculating) return;
    
    try {
      setRolloverRecalculating(true);
      const result = await budgetAPI.recalculateRollover(selectedMonth);
      
      toast({
        title: "Rollover Recalculated",
        description: `Updated ${result.updated_categories} categories`,
      });
      
      // Refresh budget data and rollover status
      fetchBudgetByMonth(selectedMonth);
      fetchBudgetSpending(selectedMonth);
      fetchRolloverStatus(selectedMonth);
      
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to recalculate rollover",
        variant: "destructive",
      });
    } finally {
      setRolloverRecalculating(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
    fetchProjectBudgets();
  }, [fetchBudgets, fetchProjectBudgets]);

  useEffect(() => {
    // Clear current budget and spending data immediately when month changes
    clearBudgetData();
    
    // Fetch new data for the selected month
    fetchBudgetByMonth(selectedMonth);
    fetchBudgetSpending(selectedMonth);
    fetchRolloverStatus(selectedMonth);
  }, [selectedMonth, fetchBudgetByMonth, fetchBudgetSpending, clearBudgetData, fetchRolloverStatus]);

  // --- WebSocket for real-time rollover updates ---
  useEffect(() => {
    const ws = new window.WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/rollover-updates`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.month === selectedMonth) {
          // Refresh budget and rollover status for the updated month
          fetchBudgetByMonth(selectedMonth);
          fetchBudgetSpending(selectedMonth);
          fetchRolloverStatus(selectedMonth);
        }
      } catch (e) {
        // Ignore parse errors
      }
    };
    return () => {
      ws.close();
    };
  }, [selectedMonth, fetchBudgetByMonth, fetchBudgetSpending, fetchRolloverStatus]);

  const handleCreateProjectBudget = async (projectBudgetData) => {
    try {
      await budgetAPI.createProjectBudget(projectBudgetData);
      setShowCreateProjectDialog(false);
      fetchProjectBudgets();
      toast({
        title: "Success",
        description: "Project budget created successfully",
      });
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.detail?.overlapping_categories) {
        setOverlapConflictData(err.response.data.detail);
        setPendingBudgetData(projectBudgetData);
        setShowOverlapDialog(true);
        setShowCreateProjectDialog(false);
      } else {
        toast({
          title: "Error",
          description: err.response?.data?.detail || "Failed to create project budget",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditProjectBudget = (projectBudget) => {
    setEditingProjectBudget(projectBudget);
    setShowEditProjectDialog(true);
  };

  const handleUpdateProjectBudget = async (projectBudgetData) => {
    try {
      await budgetAPI.updateProjectBudget(editingProjectBudget.id, projectBudgetData);
      setShowEditProjectDialog(false);
      setEditingProjectBudget(null);
      fetchProjectBudgets();
      toast({
        title: "Success",
        description: "Project budget updated successfully",
      });
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.detail?.overlapping_categories) {
        setOverlapConflictData(err.response.data.detail);
        setPendingBudgetData(projectBudgetData);
        setShowOverlapDialog(true);
        setShowEditProjectDialog(false);
      } else {
        toast({
          title: "Error",
          description: err.response?.data?.detail || "Failed to update project budget",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteProjectBudget = (projectBudgetId) => {
    setProjectBudgets(prev => prev.filter(p => p.id !== projectBudgetId));
  };

  const handleCreateBudget = async (budgetData) => {
    try {
      await createBudget(budgetData);
      setShowCreateDialog(false);
      toast({
        title: "Success",
        description: "Budget created successfully",
      });
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.detail?.overlapping_categories) {
        setOverlapConflictData(err.response.data.detail);
        setPendingBudgetData(budgetData);
        setShowOverlapDialog(true);
        setShowCreateDialog(false);
      } else {
        toast({
          title: "Error",
          description: err.response?.data?.detail || "Failed to create budget",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdateBudget = async (budgetData) => {
    try {
      await updateBudget(budgetData);
      setShowEditDialog(false);
      toast({
        title: "Success",
        description: "Budget updated successfully",
      });
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.detail?.overlapping_categories) {
        setOverlapConflictData(err.response.data.detail);
        setPendingBudgetData(budgetData);
        setShowOverlapDialog(true);
        setShowEditDialog(false);
      } else {
        toast({
          title: "Error",
          description: err.response?.data?.detail || "Failed to update budget",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteBudget = async () => {
    try {
      await deleteBudget();
      toast({
        title: "Success",
        description: "Budget deleted successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive",
      });
    }
  };

  const handleCopyBudget = async () => {
    try {
      await copyBudget(copyFromMonth);
      setShowCopyDialog(false);
      setCopyFromMonth('');
      toast({
        title: "Success",
        description: "Budget copied successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy budget",
        variant: "destructive",
      });
    }
  };

  const handleEditExisting = (conflict) => {
    setShowOverlapDialog(false);
    setOverlapConflictData(null);
    setPendingBudgetData(null);
    
    // Navigate to the conflicting budget for editing
    setSelectedMonth(conflict.month);
    setShowEditDialog(true);
  };

  const handleCloseOverlapDialog = () => {
    setShowOverlapDialog(false);
    setOverlapConflictData(null);
    setPendingBudgetData(null);
  };

  const availableMonths = budgets.map(b => b.month).filter(m => m !== selectedMonth);

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
              <h1 className="text-2xl font-bold text-foreground">Mindful Boundaries</h1>
              <p className="text-sm text-muted-foreground">
                Creating purposeful limits for intentional living
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
            <HelpButton title="The Art of Conscious Limits" buttonText="Philosophy" size="sm">
              <BudgetHowItWorks />
            </HelpButton>
            <div onClick={() => setAlertsExpanded(!alertsExpanded)} className="cursor-pointer">
              <BudgetAlerts yearMonth={selectedMonth} badge={true} />
            </div>
          </div>
        </div>

        {/* Mindful Insights - Expandable Alerts */}
        {alertsExpanded && (
          <Card className="bg-gradient-to-r from-muted/50 to-muted/20 border-muted/50">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Budget Mindfulness</h3>
                <BudgetAlerts yearMonth={selectedMonth} compact={true} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mindful Navigation */}
        <div className="flex items-center justify-center">
          <div className="bg-card/50 backdrop-blur-sm rounded-full border border-muted/30 p-1 inline-flex">
            <button
              onClick={() => setActiveSection('monthly')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                activeSection === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Monthly Rhythms
              </div>
            </button>
            <button
              onClick={() => setActiveSection('projects')}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                activeSection === 'projects'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Extended Visions
              </div>
            </button>
          </div>
        </div>

        {/* Monthly Rhythms Section */}
        {activeSection === 'monthly' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground mb-2">Monthly Rhythms</h2>
              <p className="text-sm text-muted-foreground">
                Setting mindful boundaries for the current cycle
              </p>
            </div>
            
            {/* Current Boundary Card */}
            <Card className="bg-gradient-to-r from-muted/50 to-muted/20 border-muted/50">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Boundaries for {selectedMonth}</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentBudget ? 'Refine your mindful limits' : 'Set intentional spending boundaries to begin your practice'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentBudget ? (
                      <>
                        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="rounded-full">
                              <Edit className="h-4 w-4 mr-2" />
                              Refine
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Refine Boundaries for {selectedMonth}</DialogTitle>
                            </DialogHeader>
                            <BudgetForm
                              initialData={currentBudget}
                              onSubmit={handleUpdateBudget}
                              onCancel={() => setShowEditDialog(false)}
                              isEditing={true}
                            />
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="outline" size="sm" onClick={handleDeleteBudget} className="rounded-full">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Release
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                          <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 rounded-full">
                              <Plus className="h-4 w-4 mr-2" />
                              Set Boundaries
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Set Mindful Boundaries for {selectedMonth}</DialogTitle>
                            </DialogHeader>
                            <BudgetForm
                              onSubmit={handleCreateBudget}
                              onCancel={() => setShowCreateDialog(false)}
                              yearMonth={selectedMonth}
                            />
                          </DialogContent>
                        </Dialog>

                        {availableMonths.length > 0 && (
                          <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="rounded-full">
                                <Copy className="h-4 w-4 mr-2" />
                                Adapt from Previous
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Adapt Previous Boundaries</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Adapt from month:</label>
                                  <select
                                    value={copyFromMonth}
                                    onChange={(e) => setCopyFromMonth(e.target.value)}
                                    className="w-full mt-1 p-2 border rounded-md"
                                  >
                                    <option value="">Select month</option>
                                    {availableMonths.map(month => (
                                      <option key={month} value={month}>{month}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setShowCopyDialog(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleCopyBudget}
                                    disabled={!copyFromMonth}
                                    className="rounded-full"
                                  >
                                    Adapt Boundaries
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Budget Content */}
            {loading ? (
              <Card className="bg-card">
                <CardContent className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading budget data...</p>
                  </div>
                </CardContent>
              </Card>
            ) : currentBudget ? (
              <div className="space-y-4">
                {/* Rollover Status Warning */}
                {rolloverStatus && rolloverStatus.rollover_needs_recalc && (
                  <Card className="bg-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-200 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-700" />
                          </div>
                          <div>
                            <h4 className="font-medium text-yellow-900">Rollover amounts may be outdated</h4>
                            <p className="text-sm text-yellow-800">
                              Recent transaction changes may have affected rollover calculations.
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleRecalculateRollover}
                          disabled={rolloverRecalculating}
                          className="text-yellow-800 border-yellow-400 hover:bg-yellow-200"
                        >
                          {rolloverRecalculating ? 'Updating...' : 'Update Now'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Rollover Summary */}
                {budgetSpending && budgetSpending.categories && (
                  (() => {
                    const totalRollover = Object.values(budgetSpending.categories)
                      .reduce((sum, cat) => sum + (cat.rollover_amount || 0), 0);
                    const hasRollover = totalRollover !== 0;
                    
                    return hasRollover ? (
                      <Card className={`bg-card border ${
                        totalRollover > 0 
                          ? 'border-green-200' 
                          : 'border-red-200'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              totalRollover > 0 ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              <ArrowUpDown className={`h-5 w-5 ${
                                totalRollover > 0 ? 'text-green-600' : 'text-red-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">Rollover from last month</h4>
                              <p className="text-sm text-muted-foreground">
                                {totalRollover > 0 
                                  ? 'Extra budget from unused funds last month'
                                  : 'Reduced budget due to overspending last month'
                                }
                              </p>
                            </div>
                            <div className={`text-lg font-bold ${
                              totalRollover > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {totalRollover > 0 ? '+' : ''}${totalRollover.toFixed(0)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : null;
                  })()
                )}

                {/* Budget Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {budgetSpending && Object.entries(budgetSpending.categories).map(([categoryId, data]) => (
                    <BudgetSpendingCard
                      key={categoryId}
                      categoryData={data}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Card className="bg-gradient-to-br from-muted/30 to-muted/10 border-muted/50">
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-primary">墨</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Begin Your Mindful Practice</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                    Like setting the boundaries of your canvas, establish mindful spending limits for {selectedMonth} 
                    to create space for intentional choices.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                      <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 rounded-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Set First Boundaries
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Set Mindful Boundaries for {selectedMonth}</DialogTitle>
                        </DialogHeader>
                        <BudgetForm
                          onSubmit={handleCreateBudget}
                          onCancel={() => setShowCreateDialog(false)}
                          yearMonth={selectedMonth}
                        />
                      </DialogContent>
                    </Dialog>
                    {availableMonths.length > 0 && (
                      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="rounded-full">
                            <Copy className="h-4 w-4 mr-2" />
                            Adapt from Previous
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Adapt Previous Boundaries</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Adapt from month:</label>
                              <select
                                value={copyFromMonth}
                                onChange={(e) => setCopyFromMonth(e.target.value)}
                                className="w-full mt-1 p-2 border rounded-md"
                              >
                                <option value="">Select month</option>
                                {availableMonths.map(month => (
                                  <option key={month} value={month}>{month}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setShowCopyDialog(false)}
                                className="rounded-full"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleCopyBudget}
                                disabled={!copyFromMonth}
                                className="rounded-full"
                              >
                                Adapt Boundaries
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <p className="text-xs text-muted-foreground italic mt-6 border-t border-muted pt-4">
                      "Boundaries create freedom. Within limits, infinite possibility exists."
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Extended Visions Section */}
        {activeSection === 'projects' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground mb-2">Extended Visions</h2>
              <p className="text-sm text-muted-foreground">
                Long-term aspirations that span multiple cycles
              </p>
            </div>
            
            {/* Simple Action Card */}
            <div className="flex justify-center">
              <Dialog open={showCreateProjectDialog} onOpenChange={setShowCreateProjectDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 rounded-full shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Extended Vision
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Extended Vision</DialogTitle>
                  </DialogHeader>
                  <ProjectBudgetForm
                    onSubmit={handleCreateProjectBudget}
                    onCancel={() => setShowCreateProjectDialog(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Project Budgets List */}
            {projectBudgetsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="animate-pulse bg-card">
                    <CardHeader className="pb-2">
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-1.5 bg-muted rounded"></div>
                        <div className="h-2 bg-muted rounded"></div>
                        <div className="h-2 bg-muted rounded w-1/2 mx-auto"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : projectBudgets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {projectBudgets.map(projectBudget => (
                  <ProjectBudgetCard
                    key={projectBudget.id}
                    projectBudget={projectBudget}
                    onEdit={handleEditProjectBudget}
                    onDelete={handleDeleteProjectBudget}
                    onRefresh={fetchProjectBudgets}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-gradient-to-br from-muted/30 to-muted/10 border-muted/50">
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-primary">墨</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Envision Extended Aspirations</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                    Like planning a multi-panel painting, create boundaries that span multiple months 
                    to support your most meaningful aspirations.
                  </p>
                  <Button 
                    onClick={() => setShowCreateProjectDialog(true)}
                    className="bg-primary hover:bg-primary/90 rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Paint Extended Vision
                  </Button>
                  <p className="text-xs text-muted-foreground italic mt-6 border-t border-muted pt-4">
                    "Great works require sustained intention across time"
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Edit Project Budget Dialog */}
            <Dialog open={showEditProjectDialog} onOpenChange={setShowEditProjectDialog}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Refine Extended Vision</DialogTitle>
                </DialogHeader>
                <ProjectBudgetForm
                  initialData={editingProjectBudget}
                  onSubmit={handleUpdateProjectBudget}
                  onCancel={() => {
                    setShowEditProjectDialog(false);
                    setEditingProjectBudget(null);
                  }}
                  isEditing={true}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Overlap Conflict Dialog */}
        <BudgetOverlapDialog
          open={showOverlapDialog}
          onClose={handleCloseOverlapDialog}
          overlapData={overlapConflictData}
          pendingData={pendingBudgetData}
          onEditExisting={handleEditExisting}
        />

        {/* Sumi Wisdom Footer */}
        <div className="text-center py-8 border-t border-muted/30 mt-16">
          <p className="text-sm text-muted-foreground italic">
            "True freedom comes not from unlimited choice, but from conscious boundaries that guide our intentions."
          </p>
        </div>
      </div>
    </div>
  );
}