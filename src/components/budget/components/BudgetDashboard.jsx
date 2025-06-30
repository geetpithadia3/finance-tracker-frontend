import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Plus, Copy, Edit, Trash2, Calendar, FolderOpen, TrendingUp } from 'lucide-react';
import { useBudget } from '../hooks/useBudget';
import { BudgetForm } from './BudgetForm';
import { MonthSelector } from './MonthSelector';
import { BudgetSpendingCard } from './BudgetSpendingCard';
import { ProjectBudgetForm } from './ProjectBudgetForm';
import { ProjectBudgetCard } from './ProjectBudgetCard';
import { BudgetOverlapDialog } from './BudgetOverlapDialog';
import { BudgetAlerts } from './BudgetAlerts';
import { budgetAPI } from '../../../api/budgets';
import { useToast } from '../../../hooks/use-toast';

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
  const [activeTab, setActiveTab] = useState('overview');
  
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
    setProjectBudgets(prev => prev.filter(pb => pb.id !== projectBudgetId));
  };

  const handleCreateBudget = async (budgetData) => {
    try {
      await createBudget({ ...budgetData, year_month: selectedMonth });
      setShowCreateDialog(false);
      fetchBudgetByMonth(selectedMonth);
      fetchBudgetSpending(selectedMonth);
      toast({ title: "Success", description: "Budget created successfully" });
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.detail?.overlapping_categories) {
        setOverlapConflictData(err.response.data.detail);
        setPendingBudgetData({ ...budgetData, year_month: selectedMonth });
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
      await updateBudget(currentBudget.id, budgetData);
      setShowEditDialog(false);
      fetchBudgetByMonth(selectedMonth);
      fetchBudgetSpending(selectedMonth);
      toast({ title: "Success", description: "Budget updated successfully" });
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
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(currentBudget.id);
        fetchBudgetByMonth(selectedMonth);
        fetchBudgetSpending(selectedMonth);
      } catch (err) {
        console.error('Failed to delete budget:', err);
      }
    }
  };

  const handleCopyBudget = async () => {
    if (!copyFromMonth) return;
    try {
      await copyBudget(copyFromMonth, selectedMonth);
      setShowCopyDialog(false);
      setCopyFromMonth('');
      fetchBudgetByMonth(selectedMonth);
      fetchBudgetSpending(selectedMonth);
    } catch (err) {
      console.error('Failed to copy budget:', err);
    }
  };

  const availableMonths = budgets.map(b => b.year_month).filter(m => m !== selectedMonth);

  // Overlap dialog handlers
  const handleEditExisting = (conflict) => {
    // Close overlap dialog
    setShowOverlapDialog(false);
    setOverlapConflictData(null);
    setPendingBudgetData(null);
    
    // Navigate to edit the conflicting budget
    if (conflict.type === 'monthly') {
      // For monthly budgets, we need to select the correct month and open edit
      const [year, month] = conflict.period.split('-');
      setSelectedMonth(conflict.period);
      setShowEditDialog(true);
    } else {
      // For project budgets, find and edit the project
      const projectBudget = projectBudgets.find(pb => pb.id === conflict.budget_id);
      if (projectBudget) {
        setEditingProjectBudget(projectBudget);
        setShowEditProjectDialog(true);
      }
    }
    
    toast({
      title: "Redirected to Edit",
      description: `Opened ${conflict.budget_name} for editing`,
    });
  };

  const handleCloseOverlapDialog = () => {
    setShowOverlapDialog(false);
    setOverlapConflictData(null);
    setPendingBudgetData(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Budget Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Monthly Budgets
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Project Budgets
          </TabsTrigger>
        </TabsList>


        <TabsContent value="overview" className="space-y-4">
          {/* Budget Alerts */}
          <BudgetAlerts yearMonth={selectedMonth} />
          
          {/* Compact Stats Overview */}
          <div className="space-y-4">
            {/* Monthly Budget Stats */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Monthly Budget ({selectedMonth})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="text-xl font-bold text-blue-600">{budgets.length}</div>
                    <p className="text-xs text-gray-600">Total Budgets</p>
                  </CardContent>
                </Card>
                {budgetSpending && (
                  <>
                    <Card>
                      <CardContent className="p-3">
                        <div className="text-xl font-bold text-green-600">
                          ${budgetSpending.total_budgeted?.toFixed(0) || '0'}
                        </div>
                        <p className="text-xs text-gray-600">Budgeted</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3">
                        <div className="text-xl font-bold text-red-600">
                          ${budgetSpending.total_spent?.toFixed(0) || '0'}
                        </div>
                        <p className="text-xs text-gray-600">Spent</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3">
                        <div className={`text-xl font-bold ${
                          budgetSpending.total_remaining < 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          ${budgetSpending.total_remaining?.toFixed(0) || '0'}
                        </div>
                        <p className="text-xs text-gray-600">Remaining</p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>

            {/* Project Budget Stats */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Project Budgets</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-3">
                    <div className="text-xl font-bold text-purple-600">{projectBudgets.length}</div>
                    <p className="text-xs text-gray-600">Active Projects</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="text-xl font-bold text-green-600">
                      ${projectBudgets.reduce((sum, p) => sum + (p.total_amount || 0), 0).toFixed(0)}
                    </div>
                    <p className="text-xs text-gray-600">Total Budget</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="text-xl font-bold text-blue-600">
                      {projectBudgets.filter(p => {
                        const endDate = new Date(p.end_date);
                        const now = new Date();
                        return endDate > now;
                      }).length}
                    </div>
                    <p className="text-xs text-gray-600">Active</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3">
                    <div className="text-xl font-bold text-yellow-600">
                      {projectBudgets.filter(p => {
                        const endDate = new Date(p.end_date);
                        const now = new Date();
                        const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
                        return daysRemaining <= 30 && daysRemaining > 0;
                      }).length}
                    </div>
                    <p className="text-xs text-gray-600">Ending Soon</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <div className="flex items-center justify-between">
            <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
          </div>

      {/* Current Budget Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Budget for {selectedMonth}</CardTitle>
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
                      <Button>
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
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading budget data...</p>
            </div>
          ) : currentBudget ? (
            <div className="space-y-4">
              {/* Rollover Status Warning */}
              {rolloverStatus && rolloverStatus.rollover_needs_recalc && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-yellow-800">
                        Rollover amounts may be outdated
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRecalculateRollover}
                      disabled={rolloverRecalculating}
                      className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                    >
                      {rolloverRecalculating ? 'Updating...' : 'Update Now'}
                    </Button>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">
                    Recent transaction changes may have affected rollover calculations.
                  </p>
                </div>
              )}

              {/* Rollover Summary */}
              {budgetSpending && budgetSpending.categories && (
                (() => {
                  const totalRollover = Object.values(budgetSpending.categories)
                    .reduce((sum, cat) => sum + (cat.rollover_amount || 0), 0);
                  const hasRollover = totalRollover !== 0;
                  
                  return hasRollover ? (
                    <div className={`p-3 rounded-lg border ${
                      totalRollover > 0 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Rollover from last month:
                        </span>
                        <span className={`font-bold ${
                          totalRollover > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {totalRollover > 0 ? '+' : ''}${totalRollover.toFixed(0)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {totalRollover > 0 
                          ? 'Extra budget from unused funds last month'
                          : 'Reduced budget due to overspending last month'
                        }
                      </p>
                    </div>
                  ) : null;
                })()
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {budgetSpending && Object.entries(budgetSpending.categories).map(([categoryId, data]) => (
                  <BudgetSpendingCard
                    key={categoryId}
                    categoryData={data}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Budget Found</h3>
              <p className="text-gray-600 mb-4">
                You haven't created a budget for {selectedMonth} yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {/* Project Budgets Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Project Budgets</h2>
              <p className="text-sm text-gray-600">Manage multi-month project budgets</p>
            </div>
            <Dialog open={showCreateProjectDialog} onOpenChange={setShowCreateProjectDialog}>
              <DialogTrigger asChild>
                <Button>
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

          {/* Project Budgets List */}
          {projectBudgetsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-1.5 bg-gray-200 rounded"></div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projectBudgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
            <Card>
              <CardContent className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Project Budgets</h3>
                <p className="text-gray-600 mb-4">
                  Create your first project budget to track spending across multiple months.
                </p>
                <Button onClick={() => setShowCreateProjectDialog(true)}>
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
        </TabsContent>
      </Tabs>

      {/* Budget Overlap Conflict Dialog */}
      <BudgetOverlapDialog
        isOpen={showOverlapDialog}
        onClose={handleCloseOverlapDialog}
        conflictData={overlapConflictData}
        onEditExisting={handleEditExisting}
      />
    </div>
  );
}