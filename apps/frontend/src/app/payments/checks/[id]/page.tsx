'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Check, CheckStatus, UserRole } from '@docflows/shared';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  getCheck,
  clearCheck,
  voidCheck,
} from '@/services/checkService';
import { ArrowLeft, CheckCircle, XCircle, Printer } from 'lucide-react';
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
import PaymentStatusTimeline from '@/components/payments/PaymentStatusTimeline';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { format, parseISO } from 'date-fns';

export default function CheckDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const checkId = params?.id as string;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [check, setCheck] = useState<Check | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidReason, setVoidReason] = useState('');

  useEffect(() => {
    if (checkId) {
      loadCheck();
    }
  }, [checkId]);

  async function loadCheck() {
    try {
      setLoading(true);
      setError(null);
      const data = await getCheck(checkId);
      setCheck(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load check');
      console.error('Error loading check:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    if (!window.confirm('Mark this check as cleared/disbursed?')) return;

    try {
      setActionLoading(true);
      await clearCheck(checkId);
      await loadCheck();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to clear check');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleVoid() {
    if (!voidReason.trim()) {
      alert('Please provide a reason for voiding this check');
      return;
    }

    try {
      setActionLoading(true);
      await voidCheck(checkId, { reason: voidReason });
      await loadCheck();
      setShowVoidModal(false);
      setVoidReason('');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to void check');
    } finally {
      setActionLoading(false);
    }
  }

  const canClear = 
    check?.status === CheckStatus.ISSUED &&
    (user?.role === UserRole.FINANCE || user?.role === UserRole.ADMIN);
  const canVoid = 
    (check?.status === CheckStatus.ISSUED || check?.status === CheckStatus.CLEARED) &&
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

  if (error || !check) {
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
                    <p>{error || 'Check not found'}</p>
                    <Button onClick={() => router.push('/payments/checks')} className="mt-4">
                      Back to Checks
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
            onClick={() => router.push('/payments/checks')}
            className="mb-4 flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Checks</span>
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Check #{check.checkNumber}
                </h1>
                <StatusBadge status={check.status} />
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Check Details and Status
              </p>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              {canClear && (
                <Button onClick={handleClear} disabled={actionLoading}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Cleared
                </Button>
              )}
              {canVoid && (
                <Button
                  variant="destructive"
                  onClick={() => setShowVoidModal(true)}
                  disabled={actionLoading}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Void Check
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Check Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Check Number</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                      {check.checkNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">CV Number</dt>
                    <dd className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                      <button
                        onClick={() => router.push(`/payments/vouchers/${check.checkVoucherId}`)}
                        className="hover:underline"
                      >
                        {check.checkVoucher?.cvNumber || 'N/A'}
                      </button>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Bank Account</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {check.bankAccount?.accountNumber} - {check.bankAccount?.bankName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {check.bankAccount?.accountName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Issue Date</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {check.issueDate ? format(parseISO(check.issueDate), 'MMMM d, yyyy') : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Disbursement Date</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                      {check.disbursementDate ? format(parseISO(check.disbursementDate), 'MMMM d, yyyy') : 'Not yet disbursed'}
                    </dd>
                  </div>
                  {check.voidReason && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Void Reason</dt>
                      <dd className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {check.voidReason}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* Payment Request Info */}
            {check.checkVoucher?.requisitionForPayment && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Request Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">RFP Number</dt>
                      <dd className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                        <button
                          onClick={() => router.push(`/payments/${check.checkVoucher?.requisitionForPayment?.id}`)}
                          className="hover:underline"
                        >
                          {check.checkVoucher.requisitionForPayment.rfpNumber}
                        </button>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Payee</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white font-semibold">
                        {check.checkVoucher.requisitionForPayment.payee}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</dt>
                      <dd className="mt-1 text-lg text-gray-900 dark:text-white font-bold">
                        {check.checkVoucher.requisitionForPayment.currency || 'PHP'} {check.checkVoucher.requisitionForPayment.amount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Particulars</dt>
                      <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                        {check.checkVoucher.requisitionForPayment.particulars}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Approval History</CardTitle>
              </CardHeader>
              <CardContent>
                {check.approvalRecords && check.approvalRecords.length > 0 ? (
                  <PaymentStatusTimeline approvalRecords={check.approvalRecords} />
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No approval history yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Created</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {check.createdAt ? format(parseISO(check.createdAt), 'MMM d, yyyy h:mm a') : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Last Updated</dt>
                    <dd className="mt-1 text-gray-900 dark:text-white">
                      {check.updatedAt ? format(parseISO(check.updatedAt), 'MMM d, yyyy h:mm a') : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 dark:text-gray-400">Check ID</dt>
                    <dd className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-mono">
                      {check.id}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Void Modal */}
        <Dialog open={showVoidModal} onOpenChange={setShowVoidModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Void Check</DialogTitle>
              <DialogDescription>
                Please provide a reason for voiding this check. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <textarea
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                placeholder="Enter void reason..."
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowVoidModal(false);
                  setVoidReason('');
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleVoid}
                disabled={actionLoading || !voidReason.trim()}
              >
                {actionLoading ? 'Voiding...' : 'Void Check'}
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
