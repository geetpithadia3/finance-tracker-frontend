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
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Navigation */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-1">Budget Management</h1>
              <p className="text-muted-foreground">Plan, track, and optimize your spending</p>
            </div>
            <div className="flex items-center gap-3">
              <div onClick={() => setAlertsExpanded(!alertsExpanded)} className="cursor-pointer">
                <BudgetAlerts yearMonth={selectedMonth} badge={true} />
              </div>
              <HelpButton title="How Budget Management Works" buttonText="How It Works">
                <BudgetHowItWorks />
              </HelpButton>
              <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
            </div>
          </div>
          
          {/* Expandable Detailed Alerts */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-4 justify-between text-xs"
            onClick={() => setAlertsExpanded(!alertsExpanded)}
          >
            <span>Budget Alert Details</span>
            {alertsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          {alertsExpanded && (
            <div className="mt-2 border-t pt-4">
              <BudgetAlerts yearMonth={selectedMonth} compact={true} />
            </div>
          )}
        </div>

        {/* Section Navigation */}
        <div className="flex items-center justify-center">
          <div className="bg-card rounded-lg border p-1 inline-flex">
            <button
              onClick={() => setActiveSection('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeSection === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Monthly Budgets
              </div>
            </button>
            <button
              onClick={() => setActiveSection('projects')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeSection === 'projects'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Project Budgets
              </div>
            </button>
          </div>
        </div>

        {/* Monthly Budgets Section */}
        {activeSection === 'monthly' && (
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <Card className="bg-card border">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Budget for {selectedMonth}</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentBudget ? 'Manage your current budget' : 'Create a new budget to start tracking'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentBudget ? (
                      <>
                        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Budget for {selectedMonth}</DialogTitle>
                            </DialogHeader>
                            <BudgetForm
                              initialData={currentBudget}
                              onSubmit={handleUpdateBudget}
                              onCancel={() => setShowEditDialog(false)}
                              isEditing={true}
                            />
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="outline" size="sm" onClick={handleDeleteBudget}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                          <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90">
                              <Plus className="h-4 w-4 mr-2" />
                              Create Budget
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Create Budget for {selectedMonth}</DialogTitle>
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
                              <Button variant="outline">
                                <Copy className="h-4 w-4 mr-2" />
                                Copy from Previous
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Copy Budget</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Copy from month:</label>
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
                                  >
                                    Copy Budget
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
              <Card className="bg-card border">
                <CardContent className="text-center py-12">
                  <div className="p-3 bg-muted rounded-full w-fit mx-auto mb-4">
                    <Target className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No Budget Found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    You haven't created a budget for {selectedMonth} yet. Create your first budget to start tracking your spending goals.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                      <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Budget
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create Budget for {selectedMonth}</DialogTitle>
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
                          <Button variant="outline">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy from Previous
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Copy Budget</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Copy from month:</label>
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
                              >
                                Copy Budget
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Project Budgets Section */}
        {activeSection === 'projects' && (
          <div className="space-y-6">
            {/* Project Budgets Header */}
            <Card className="bg-card border">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FolderOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Project Budgets</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage multi-month project budgets and track long-term goals
                      </p>
                    </div>
                  </div>
                  <Dialog open={showCreateProjectDialog} onOpenChange={setShowCreateProjectDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Project Budget
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Project Budget</DialogTitle>
                      </DialogHeader>
                      <ProjectBudgetForm
                        onSubmit={handleCreateProjectBudget}
                        onCancel={() => setShowCreateProjectDialog(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

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
              <Card className="bg-card border">
                <CardContent className="text-center py-12">
                  <div className="p-3 bg-muted rounded-full w-fit mx-auto mb-4">
                    <FolderOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No Project Budgets</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Create your first project budget to track spending across multiple months and achieve long-term financial goals.
                  </p>
                  <Button 
                    onClick={() => setShowCreateProjectDialog(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project Budget
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Edit Project Budget Dialog */}
            <Dialog open={showEditProjectDialog} onOpenChange={setShowEditProjectDialog}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Project Budget</DialogTitle>
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
      </div>
    </div>
  );
}