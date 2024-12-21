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

const ManageAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [syncType, setSyncType] = useState(null);
  const [syncAccount, setSyncAccount] = useState(null);
  const [externalKey, setExternalKey] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('http://localhost:8080/account', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleSync = (account, type) => {
    if (type === 'splitwise') {
      syncSplitwiseTransactions(account.accountId);
    } else {
      setSyncAccount(account);
      setSyncType(type);
      setSyncModalVisible(true);
    }
  };

  const syncSplitwiseTransactions = async (accountId) => {
    try {
      await fetch('http://localhost:8080/sync-transactions', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ accountId }),
      });
      fetchAccounts();
    } catch (error) {
      console.error('Error syncing Splitwise transactions:', error);
    }
  };

  const handleSyncClose = () => {
    fetchAccounts();
    setSyncModalVisible(false);
    setSyncAccount(null);
    setSyncType(null);
  };

  const handleAddAccount = () => {
    setSelectedAccount({
      name: '',
      type: 'Savings',
      org: 'Scotia',
      initialBalance: '',
      currency: 'CAD',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const accountResponse = await fetch('http://localhost:8080/account', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(selectedAccount)
      });

      if (!accountResponse.ok) {
        throw new Error('Failed to save account');
      }

      if (selectedAccount.org === 'Splitwise') {
        const externalResponse = await fetch('http://localhost:8080/user/external-credentials', {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ externalKey })
        });

        if (!externalResponse.ok) {
          throw new Error('Failed to save Splitwise credentials');
        }
      }

      fetchAccounts();
      setIsModalOpen(false);
      setExternalKey('');
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8080/account/${accountToDelete.accountId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

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
                {account.org !== 'Splitwise' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSync(account, 'csv')}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                )}
                {account.org === 'Splitwise' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSync(account, 'splitwise')}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
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
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Wallet className="mr-2 h-4 w-4" />
                  {account.type}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building2 className="mr-2 h-4 w-4" />
                  {account.org}
                </div>
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
              <label>Type</label>
              <Select
                value={selectedAccount?.type}
                onValueChange={(value) => setSelectedAccount(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Savings">Savings</SelectItem>
                  <SelectItem value="Checking">Checking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>Organization</label>
              <Select
                value={selectedAccount?.org}
                onValueChange={(value) => setSelectedAccount(prev => ({ ...prev, org: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scotia">Scotia</SelectItem>
                  <SelectItem value="WealthSimple">WealthSimple</SelectItem>
                  <SelectItem value="Splitwise">Splitwise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedAccount?.org === 'Splitwise' && (
              <div className="space-y-2">
                <label>Splitwise Secret</label>
                <Input
                  type="password"
                  value={externalKey}
                  onChange={(e) => setExternalKey(e.target.value)}
                />
              </div>
            )}
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

      {/* Sync Modal */}
      {syncModalVisible && (
        <SyncResultComponent
          syncType={syncType}
          selectedAccount={syncAccount?.accountId}
          onClose={handleSyncClose}
        />
      )}
    </div>
  );
};

export default ManageAccounts;