import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
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
  
  // Project budget state
  const [projectBudgets, setProjectBudgets] = useState([]);
  const [showCreateProjectDialog, setShowCreateProjectDialog] = useState(false);
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false);
  const [editingProjectBudget, setEditingProjectBudget] = useState(null);
  const [projectBudgetsLoading, setProjectBudgetsLoading] = useState(false);
  
  // Overlap conflict state  
  const [showOverlapDialog, setShowOverlapDialog] = useState(false);
  const [overlapConflictData, setOverlapConflictData] = useState(null);
  const [pendingBudgetData, setPendingBudgetData] = useState(null);
  
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
  } = useBudget();

  useEffect(() => {
    fetchBudgets();
    fetchProjectBudgets();
  }, [fetchBudgets]);

  useEffect(() => {
    fetchBudgetByMonth(selectedMonth);
    fetchBudgetSpending(selectedMonth);
  }, [selectedMonth, fetchBudgetByMonth, fetchBudgetSpending]);

  // Project budget functions
  const fetchProjectBudgets = async () => {
    try {
      console.log('Dashboard: Starting to fetch project budgets...');
      setProjectBudgetsLoading(true);
      const data = await budgetAPI.getProjectBudgets(0, 100, true);
      console.log('Dashboard: Project budgets fetched successfully:', data);
      console.log('Dashboard: Setting project budgets state with', Array.isArray(data) ? data.length : 'non-array', 'items');
      setProjectBudgets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Dashboard: Failed to fetch project budgets:', err);
      console.error('Dashboard: Error details:', {
        response: err.response?.data,
        status: err.response?.status,
        message: err.message
      });
      
      let errorMessage = "Failed to fetch project budgets";
      if (err.response?.status === 404) {
        errorMessage = "Project budgets endpoint not found. Make sure the backend is running and updated.";
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProjectBudgetsLoading(false);
    }
  };

  const handleCreateProjectBudget = async (projectBudgetData) => {
    try {
      console.log('Creating project budget with data:', projectBudgetData);
      const result = await budgetAPI.createProjectBudget(projectBudgetData);
      console.log('Project budget created successfully:', result);
      setShowCreateProjectDialog(false);
      fetchProjectBudgets();
      toast({
        title: "Success",
        description: "Project budget created successfully",
      });
    } catch (err) {
      console.error('Failed to create project budget:', err);
      console.error('Error details:', {
        response: err.response?.data,
        status: err.response?.status,
        message: err.message
      });
      
      if (err.response?.status === 409 && err.response?.data?.detail?.overlapping_categories) {
        // Handle project budget overlap conflict
        setOverlapConflictData(err.response.data.detail);
        setPendingBudgetData(projectBudgetData);
        setShowOverlapDialog(true);
        setShowCreateProjectDialog(false);
      } else {
        let errorMessage = "Failed to create project budget";
        if (err.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        toast({
          title: "Error",
          description: errorMessage,
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
      console.error('Failed to update project budget:', err);
      
      if (err.response?.status === 409 && err.response?.data?.detail?.overlapping_categories) {
        // Handle project budget overlap conflict
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
      await createBudget({
        ...budgetData,
        year_month: selectedMonth
      });
      setShowCreateDialog(false);
      fetchBudgetByMonth(selectedMonth);
      fetchBudgetSpending(selectedMonth);
      toast({
        title: "Success",
        description: "Budget created successfully",
      });
    } catch (err) {
      console.error('Failed to create budget:', err);
      
      if (err.response?.status === 409 && err.response?.data?.detail?.overlapping_categories) {
        // Handle budget overlap conflict
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
      toast({
        title: "Success",
        description: "Budget updated successfully",
      });
    } catch (err) {
      console.error('Failed to update budget:', err);
      
      if (err.response?.status === 409 && err.response?.data?.detail?.overlapping_categories) {
        // Handle budget overlap conflict
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

      {/* REQ-006 & REQ-008: Budget Alerts Section */}
      <BudgetAlerts compact={true} />

      <Tabs defaultValue="overview" className="space-y-6">
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

        {/* REQ-008: Budget Overview Tab - Unified view of all budgets */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Budget Alerts - Full View */}
            <div className="lg:col-span-2">
              <BudgetAlerts yearMonth={selectedMonth} />
            </div>
            
            {/* Quick Stats */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{budgets.length}</div>
                      <div className="text-xs text-blue-600">Monthly Budgets</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{projectBudgets.length}</div>
                      <div className="text-xs text-purple-600">Project Budgets</div>
                    </div>
                  </div>
                  
                  {budgetSpending && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Current Month</span>
                        <Badge variant="outline">{selectedMonth}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Budgeted:</span>
                          <span className="font-medium">${budgetSpending.total_budgeted?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total Spent:</span>
                          <span className="font-medium">${budgetSpending.total_spent?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold border-t pt-2">
                          <span>Remaining:</span>
                          <span className={`${
                            budgetSpending.total_remaining < 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            ${budgetSpending.total_remaining?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Active Project Budgets Summary */}
          {projectBudgets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Active Project Budgets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projectBudgets.slice(0, 6).map(project => (
                    <Card key={project.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm truncate">{project.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {Math.ceil((new Date(project.end_date) - new Date()) / (1000 * 60 * 60 * 24))} days
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Budget:</span>
                          <span className="font-medium">${project.total_amount.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {projectBudgets.length > 6 && (
                  <div className="text-center mt-4">
                    <Button variant="outline" size="sm">
                      View All {projectBudgets.length} Project Budgets
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Current Month Spending Overview */}
          {budgetSpending && budgetSpending.categories && Object.keys(budgetSpending.categories).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Current Month Spending ({selectedMonth})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.values(budgetSpending.categories).slice(0, 6).map((categoryData, index) => (
                    <BudgetSpendingCard key={index} categoryData={categoryData} />
                  ))}
                </div>
                {Object.keys(budgetSpending.categories).length > 6 && (
                  <div className="text-center mt-4">
                    <Button variant="outline" size="sm">
                      View All {Object.keys(budgetSpending.categories).length} Categories
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
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
              {budgetSpending && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        ${budgetSpending.total_budgeted.toFixed(2)}
                      </div>
                      <p className="text-sm text-gray-600">Total Budgeted</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-red-600">
                        ${budgetSpending.total_spent.toFixed(2)}
                      </div>
                      <p className="text-sm text-gray-600">Total Spent</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">
                        ${budgetSpending.total_remaining.toFixed(2)}
                      </div>
                      <p className="text-sm text-gray-600">Remaining</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* All Budgets List */}
      <Card>
        <CardHeader>
          <CardTitle>All Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          {budgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgets.map(budget => (
                <Card key={budget.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedMonth(budget.year_month)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{budget.year_month}</h3>
                      <Badge variant={budget.year_month === selectedMonth ? "default" : "secondary"}>
                        {budget.year_month === selectedMonth ? "Current" : "Archived"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {budget.category_limits.length} categories
                    </p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(budget.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No budgets created yet.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projectBudgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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