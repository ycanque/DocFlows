'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckVoucher, CheckVoucherStatus, UserRole } from '@docflows/shared';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  getCheckVoucher,
  verifyCheckVoucher,
  approveCheckVoucher,
  rejectCheckVoucher,
} from '@/services/checkVoucherService';
import { issueCheck, IssueCheckDto } from '@/services/checkService';
import { ArrowLeft, CheckCircle, FileCheck, Printer, XCircle } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import StatusBadge from '@/components/requisitions/StatusBadge';
import BankSelector from '@/components/payments/BankSelector';
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';

export default function CheckVoucherDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const voucherId = params?.id as string;

  const [voucher, setVoucher] = useState<CheckVoucher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showIssueCheckModal, setShowIssueCheckModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [nextCheckNumber, setNextCheckNumber] = useState<string>('');

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
      console.log('Loaded voucher:', data);
      console.log('Has check?', !!data.check);
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

  async function handleReject() {
    if (!rejectReason.trim()) {
      alert('Please enter a reason for rejection');
      return;
    }

    try {
      setActionLoading(true);
      await rejectCheckVoucher(voucherId, rejectReason);
      await loadVoucher();
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reject check voucher');
    } finally {
      setActionLoading(false);
    }
  }

  function handleBankAccountChange(bankAccountId: string) {
    setSelectedBankAccount(bankAccountId);
    if (bankAccountId) {
      // Generate check number based on bank account and timestamp
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const checkNum = `CHK-${timestamp}-${randomSuffix}`;
      setNextCheckNumber(checkNum);
    } else {
      setNextCheckNumber('');
    }
  }

  async function handleIssueCheck() {
    if (!selectedBankAccount || !nextCheckNumber) {
      alert('Please select a bank account');
      return;
    }

    try {
      setActionLoading(true);
      const dto: IssueCheckDto = {
        checkNumber: nextCheckNumber,
        bankAccountId: selectedBankAccount,
      };
      await issueCheck(voucherId, dto);
      await loadVoucher();
      setShowIssueCheckModal(false);
      setSelectedBankAccount('');
      setNextCheckNumber('');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to issue check');
    } finally {
      setActionLoading(false);
    }
  }

  const canVerify = 
    voucher?.status === CheckVoucherStatus.DRAFT &&
    (user?.role === UserRole.FINANCE || user?.role === UserRole.ADMIN);
  const canApprove = 
    voucher?.status === CheckVoucherStatus.VERIFIED &&
    (user?.role === UserRole.ADMIN);
  const canReject = 
    voucher?.status === CheckVoucherStatus.VERIFIED &&
    (user?.role === UserRole.FINANCE || user?.role === UserRole.ADMIN);
  const canIssueCheck = 
    voucher?.status === CheckVoucherStatus.APPROVED &&
    (user?.role === UserRole.FINANCE || user?.role === UserRole.ADMIN);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-96 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !voucher) {
    return (
      <ProtectedRoute>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 text-center text-red-600 dark:text-red-400">
              <p>{error || 'Check voucher not found'}</p>
              <Button onClick={() => router.push('/vouchers')} className="mt-4">
                Back to Check Vouchers
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/vouchers')}
            className="w-fit text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Check Vouchers
          </Button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {voucher.cvNumber}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Check Voucher Details
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap items-center justify-between">
            {/* Workflow Action Buttons (Left) */}
            <div className="flex gap-2 flex-wrap">
              {canVerify && (
                <Button onClick={handleVerify} disabled={actionLoading} className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Verify
                </Button>
              )}
              {canApprove && (
                <Button onClick={handleApprove} disabled={actionLoading} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white">
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
              )}
              {canReject && (
                <Button 
                  variant="destructive" 
                  onClick={() => setShowRejectModal(true)} 
                  disabled={actionLoading} 
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              )}
              {canIssueCheck && (
                <Button onClick={() => setShowIssueCheckModal(true)} disabled={actionLoading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white">
                  Issue Check
                </Button>
              )}
              {voucher.check && (
                <Button 
                  onClick={() => router.push(`/checks/${voucher.check?.id}`)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold"
                >
                  <FileCheck className="h-4 w-4" />
                  View Check
                </Button>
              )}
            </div>

            {/* Print Button (Right) */}
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Voucher Information</CardTitle>
                  <StatusBadge status={voucher.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Key Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-700">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        CV Number
                      </label>
                      <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mt-2">
                        {voucher.cvNumber}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        RFP Number
                      </label>
                      <div className="mt-2">
                        <button
                          onClick={() => router.push(`/payments/${voucher.requisitionForPaymentId}`)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-950 border border-blue-200 dark:border-blue-800 transition-colors group"
                        >
                          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                            {voucher.requisitionForPayment?.rfpNumber || 'N/A'}
                          </span>
                          <ArrowLeft className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payee and Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-700">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        Payee
                      </label>
                      <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-2">
                        {voucher.requisitionForPayment?.payee}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        Amount
                      </label>
                      <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mt-2">
                        {voucher.requisitionForPayment?.currency === 'PHP' ? '₱' : voucher.requisitionForPayment?.currency} {Number(voucher.requisitionForPayment?.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      </p>
                    </div>
                  </div>

                  {/* Particulars */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                      Particulars
                    </label>
                    <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-2 leading-relaxed whitespace-pre-wrap">
                      {voucher.requisitionForPayment?.particulars}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {voucher.check && (
              <Card>
                <CardHeader>
                  <CardTitle>Issued Check</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    onClick={() => router.push(`/checks/${voucher.check?.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                          Check Number
                        </label>
                        <p className="mt-1 text-lg font-bold text-blue-700 dark:text-blue-300">
                          {voucher.check.checkNumber}
                        </p>
                      </div>
                      <StatusBadge status={voucher.check.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-xs font-medium text-blue-600/80 dark:text-blue-400/80">
                          Amount
                        </label>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                          ₱ {Number(voucher.check.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-blue-600/80 dark:text-blue-400/80">
                          Check Date
                        </label>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                          {voucher.check.checkDate ? format(parseISO(voucher.check.checkDate), 'MMM dd, yyyy') : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 flex items-center gap-1">
                      <ArrowLeft className="h-3 w-3 rotate-180" />
                      Click to view check details
                    </p>
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
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                      Created
                    </label>
                    <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-1">
                      {voucher.createdAt ? format(parseISO(voucher.createdAt), 'MMM d, yyyy h:mm a') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                      Last Updated
                    </label>
                    <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-1">
                      {voucher.updatedAt ? format(parseISO(voucher.updatedAt), 'MMM d, yyyy h:mm a') : 'N/A'}
                    </p>
                  </div>
                </div>
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
              <BankSelector
                value={selectedBankAccount}
                onChange={handleBankAccountChange}
                label="Bank Account"
                required
              />
              {nextCheckNumber && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Check Number (Auto-generated)
                  </label>
                  <p className="text-base font-mono font-semibold text-gray-900 dark:text-gray-100">
                    {nextCheckNumber}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    This check number will be assigned when issued
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowIssueCheckModal(false);
                  setSelectedBankAccount('');
                  setNextCheckNumber('');
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleIssueCheck}
                disabled={actionLoading || !selectedBankAccount || !nextCheckNumber}
              >
                {actionLoading ? 'Issuing...' : 'Issue Check'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Modal */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Check Voucher</DialogTitle>
              <DialogDescription>
                Are you sure you want to reject this check voucher? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium mb-2 block">Reason for Rejection</label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full"
              />
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject} 
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? 'Rejecting...' : 'Reject Voucher'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
