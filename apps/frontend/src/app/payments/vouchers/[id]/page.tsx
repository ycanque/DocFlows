'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckVoucher, CheckVoucherStatus, UserRole } from '@docflows/shared';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  getCheckVoucher,
  verifyCheckVoucher,
  approveCheckVoucher,
} from '@/services/checkVoucherService';
import { issueCheck, IssueCheckDto } from '@/services/checkService';
import { ArrowLeft, CheckCircle, FileCheck, Printer } from 'lucide-react';
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
import StatusBadge from '@/components/requisitions/StatusBadge';
import BankSelector from '@/components/payments/BankSelector';
import PaymentStatusTimeline from '@/components/payments/PaymentStatusTimeline';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { format, parseISO } from 'date-fns';

export default function CheckVoucherDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const voucherId = params?.id as string;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [voucher, setVoucher] = useState<CheckVoucher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showIssueCheckModal, setShowIssueCheckModal] = useState(false);
  const [checkNumber, setCheckNumber] = useState('');
  const [selectedBankAccount, setSelectedBankAccount] = useState('');

  useEffect(() => {
    if (voucherId) {
      loadVoucher();
    }
  }, [voucherId]);

  async function loadVoucher() {
    try {
      setLoading(true);
      setError(null);
      const data = await getCheckVoucher(voucherId);
      setVoucher(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load check voucher');
      console.error('Error loading check voucher:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (!window.confirm('Verify this check voucher?')) return;

    try {
      setActionLoading(true);
      await verifyCheckVoucher(voucherId);
      await loadVoucher();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to verify check voucher');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleApprove() {
    if (!window.confirm('Approve this check voucher?')) return;

    try {
      setActionLoading(true);
      await approveCheckVoucher(voucherId);
      await loadVoucher();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to approve check voucher');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleIssueCheck() {
    if (!checkNumber.trim() || !selectedBankAccount) {
      alert('Please provide check number and select bank account');
      return;
    }

    try {
      setActionLoading(true);
      const dto: IssueCheckDto = {
        checkNumber: checkNumber.trim(),
        bankAccountId: selectedBankAccount,
      };
      const check = await issueCheck(voucherId, dto);
      await loadVoucher();
      setShowIssueCheckModal(false);
      router.push(`/payments/checks/${check.id}`);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to issue check');
      setActionLoading(false);
    }
  }

  const canVerify = 
    voucher?.status === CheckVoucherStatus.DRAFT &&
    (user?.role === UserRole.FINANCE || user?.role === UserRole.ADMIN);
  const canApprove = 
    voucher?.status === CheckVoucherStatus.VERIFIED &&
    (user?.role === UserRole.ADMIN);
  const canIssueCheck = 
    voucher?.status === CheckVoucherStatus.APPROVED &&
    (user?.role === UserRole.FINANCE || user?.role === UserRole.ADMIN);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900">
          <Sidebar currentView="payments" isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopBar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
            <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900">
              <div className="flex h-96 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !voucher) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900">
          <Sidebar currentView="payments" isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopBar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
            <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900">
              <div className="p-6 space-y-6">
                <Card>
                  <CardContent className="p-6 text-center text-red-600 dark:text-red-400">
                    <p>{error || 'Check voucher not found'}</p>
                    <Button onClick={() => router.push('/payments/vouchers')} className="mt-4">
                      Back to Check Vouchers
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900">
        <Sidebar currentView="payments" isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900">
            <div className="p-6 sm:p-8 space-y-8">
              <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/payments/vouchers')}
            className="mb-4 flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Check Vouchers</span>
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {voucher.cvNumber}
                </h1>
                <StatusBadge status={voucher.status} />
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Check Voucher Details
              </p>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              {canVerify && (
                <Button onClick={handleVerify} disabled={actionLoading}>
                  <FileCheck className="mr-2 h-4 w-4" />
                  Verify
                </Button>
              )}
              {canApprove && (
                <Button onClick={handleApprove} disabled={actionLoading}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              )}
              {canIssueCheck && (
                <Button onClick={() => setShowIssueCheckModal(true)} disabled={actionLoading}>
                  Issue Check
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Voucher Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">CV Number</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                      {voucher.cvNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">RFP Number</dt>
                    <dd className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                      <button
                        onClick={() => router.push(`/payments/${voucher.requisitionForPaymentId}`)}
                        className="hover:underline"
                      >
                        {voucher.requisitionForPayment?.rfpNumber || 'N/A'}
                      </button>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Payee</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">
                      {voucher.requisitionForPayment?.payee}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</dt>
                    <dd className="mt-1 text-lg text-gray-900 dark:text-white font-bold">
                      {voucher.requisitionForPayment?.currency || 'PHP'} {voucher.requisitionForPayment?.amount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Particulars</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                      {voucher.requisitionForPayment?.particulars}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {voucher.check && (
              <Card>
                <CardHeader>
                  <CardTitle>Check Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Check has been issued</p>
                      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                        Check Number: {voucher.check.checkNumber}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Status: <StatusBadge status={voucher.check.status} className="ml-2" />
                      </p>
                    </div>
                    <Button onClick={() => router.push(`/payments/checks/${voucher.check?.id}`)}>
                      View Check
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Created</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {voucher.createdAt ? format(parseISO(voucher.createdAt), 'MMM d, yyyy h:mm a') : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Last Updated</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {voucher.updatedAt ? format(parseISO(voucher.updatedAt), 'MMM d, yyyy h:mm a') : 'N/A'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Issue Check Modal */}
        <Dialog open={showIssueCheckModal} onOpenChange={setShowIssueCheckModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue Check</DialogTitle>
              <DialogDescription>
                Enter check details to issue a check for this voucher.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Check Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={checkNumber}
                  onChange={(e) => setCheckNumber(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                  placeholder="Enter check number"
                />
              </div>
              <BankSelector
                value={selectedBankAccount}
                onChange={setSelectedBankAccount}
                label="Bank Account"
                required
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowIssueCheckModal(false);
                  setCheckNumber('');
                  setSelectedBankAccount('');
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleIssueCheck}
                disabled={actionLoading || !checkNumber.trim() || !selectedBankAccount}
              >
                {actionLoading ? 'Issuing...' : 'Issue Check'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
