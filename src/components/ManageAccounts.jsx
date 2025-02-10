import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus,
  Trash2, 
  Upload,
  RefreshCw,
  Wallet,
  DollarSign,
  Building2
} from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';
import { SyncResultComponent } from './SyncResultComponent';
import { accountsApi } from '../api/accounts';

const ManageAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [syncAccount, setSyncAccount] = useState(null);
  const [externalKey, setExternalKey] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await accountsApi.getAll();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleSync = (account, type) => {
      setSyncAccount(account);
      setSyncModalVisible(true);
  };

  const handleSyncClose = () => {
    fetchAccounts();
    setSyncModalVisible(false);
    setSyncAccount(null);
  };

  const handleAddAccount = () => {
    setSelectedAccount({
      name: '',
      initialBalance: '',
      currency: 'CAD',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      await accountsApi.create(selectedAccount);
      
      fetchAccounts();
      setIsModalOpen(false);
      setExternalKey('');
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await accountsApi.delete(accountToDelete.accountId);
      fetchAccounts();
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
        <Button onClick={handleAddAccount}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {accounts.map(account => (
          <Card key={account.accountId}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                {account.name}
              </CardTitle>
              <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSync(account, 'csv')}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setAccountToDelete(account);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${account.balance.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Account Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Account</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name">Name</label>
              <Input
                id="name"
                value={selectedAccount?.name}
                onChange={(e) => setSelectedAccount(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label>Initial Balance</label>
              <Input
                type="number"
                value={selectedAccount?.initialBalance}
                onChange={(e) => setSelectedAccount(prev => ({ ...prev, initialBalance: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label>Currency</label>
              <Input
                value={selectedAccount?.currency}
                disabled
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the account "{accountToDelete?.name}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {syncModalVisible && (
        <SyncResultComponent
          selectedAccount={syncAccount?.accountId}
          onClose={handleSyncClose}
        />
      )}
    </div>
  );
};

export default ManageAccounts;