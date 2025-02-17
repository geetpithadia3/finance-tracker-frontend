import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { TransactionImportDialog } from './components/TransactionImportDialog';
import { useAccounts } from './hooks/useAccounts';
import { AccountCard } from './components/AccountCard';
import { AddAccountDialog } from './components/AddAccountDialog';
import { DeleteAccountDialog } from './components/DeleteAccountDialog';
import { EmptyAccountsMessage } from './components/EmptyAccountsMessage';

const ManageAccounts = () => {
  const { accounts, createAccount, deleteAccount, fetchAccounts } = useAccounts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [syncAccount, setSyncAccount] = useState(null);

  const handleAddAccount = () => {
    setSelectedAccount({
      name: '',
      initialBalance: '',
      currency: 'CAD',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const success = await createAccount(selectedAccount);
    if (success) {
      setIsModalOpen(false);
    }
  };

  const handleSync = (account) => {
    setSyncAccount(account);
    setSyncModalVisible(true);
  };

  const handleSyncClose = () => {
    fetchAccounts();
    setSyncModalVisible(false);
    setSyncAccount(null);
  };

  const handleDelete = async () => {
    const success = await deleteAccount(accountToDelete.accountId);
    if (success) {
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={handleAddAccount}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {accounts.map(account => (
          <AccountCard
            key={account.accountId}
            account={account}
            onSync={handleSync}
            onDelete={(account) => {
              setAccountToDelete(account);
              setDeleteDialogOpen(true);
            }}
          />
        ))}
      </div>

      <AddAccountDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        account={selectedAccount}
        onAccountChange={setSelectedAccount}
      />

      <DeleteAccountDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        accountName={accountToDelete?.name}
      />

      {syncModalVisible && (
        <TransactionImportDialog
          selectedAccount={syncAccount?.accountId}
          onClose={handleSyncClose}
        />
      )}

      {accounts.length === 0 && (
        <EmptyAccountsMessage onAddAccount={handleAddAccount} />
      )}
    </div>
  );
};

export default ManageAccounts;