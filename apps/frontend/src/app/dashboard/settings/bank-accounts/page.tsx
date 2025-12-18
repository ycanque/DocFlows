'use client';

import { useEffect, useState } from 'react';
import { BankAccount } from '@docflows/shared';
import {
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  CreateBankAccountDto,
  UpdateBankAccountDto,
} from '@/services/bankAccountService';
import { Plus, Pencil, Trash2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { format } from 'date-fns';

export default function BankAccountsManagementPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    isActive: true,
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    try {
      setLoading(true);
      setError(null);
      const data = await getBankAccounts();
      setAccounts(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load bank accounts');
      console.error('Error loading bank accounts:', err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingAccount(null);
    setFormData({
      accountName: '',
      accountNumber: '',
      bankName: '',
      isActive: true,
    });
    setShowModal(true);
  }

  function openEditModal(account: BankAccount) {
    setEditingAccount(account);
    setFormData({
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      isActive: account.isActive,
    });
    setShowModal(true);
  }

  async function handleSubmit() {
    if (!formData.accountName.trim() || !formData.accountNumber.trim() || !formData.bankName.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setActionLoading(true);
      if (editingAccount) {
        const dto: UpdateBankAccountDto = {
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
          bankName: formData.bankName,
          isActive: formData.isActive,
        };
        await updateBankAccount(editingAccount.id, dto);
      } else {
        const dto: CreateBankAccountDto = {
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
          bankName: formData.bankName,
          isActive: formData.isActive,
        };
        await createBankAccount(dto);
      }
      await loadAccounts();
      setShowModal(false);
      setFormData({
        accountName: '',
        accountNumber: '',
        bankName: '',
        isActive: true,
      });
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save bank account');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(account: BankAccount) {
    if (!window.confirm(`Delete bank account "${account.accountName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(true);
      await deleteBankAccount(account.id);
      await loadAccounts();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete bank account');
    } finally {
      setActionLoading(false);
    }
  }

  const stats = {
    total: accounts.length,
    active: accounts.filter((a) => a.isActive).length,
    inactive: accounts.filter((a) => !a.isActive).length,
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Bank Accounts Management
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Manage bank accounts for check disbursements
              </p>
            </div>
            <Button onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" />
              Add Bank Account
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Accounts
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-300 font-semibold text-sm">
                      {stats.active}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                      Active
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.active}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-300 font-semibold text-sm">
                      {stats.inactive}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                      Inactive
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.inactive}
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center text-red-600 dark:text-red-400">
              <p>{error}</p>
              <Button onClick={loadAccounts} className="mt-4">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No bank accounts
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by adding your first bank account
              </p>
              <div className="mt-6">
                <Button onClick={openCreateModal}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Bank Account
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <Card key={account.id} className={!account.isActive ? 'opacity-60' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>{account.accountName}</span>
                    {account.isActive ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-200">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200">
                        Inactive
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <dt className="text-xs text-gray-500 dark:text-gray-400">Bank Name</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-white">
                        {account.bankName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 dark:text-gray-400">Account Number</dt>
                      <dd className="text-sm font-mono text-gray-900 dark:text-white">
                        {account.accountNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 dark:text-gray-400">Created</dt>
                      <dd className="text-xs text-gray-600 dark:text-gray-400">
                        {format(new Date(account.createdAt), 'MMM d, yyyy')}
                      </dd>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(account)}
                        disabled={actionLoading}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(account)}
                        disabled={actionLoading}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Edit Bank Account' : 'Add Bank Account'}
              </DialogTitle>
              <DialogDescription>
                {editingAccount
                  ? 'Update the bank account information below.'
                  : 'Enter the details for the new bank account.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                  placeholder="e.g., Main Operating Account"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                  placeholder="e.g., BDO, BPI, Metrobank"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                  placeholder="e.g., 1001-2345-6789"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                  Active (available for check issuance)
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={actionLoading}>
                {actionLoading ? 'Saving...' : editingAccount ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
