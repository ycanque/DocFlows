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
import { ArrowLeft, CheckCircle, XCircle, Printer, Building2, FileText, CreditCard, Receipt, User } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';
import { format, parseISO } from 'date-fns';

export default function CheckDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const checkId = params?.id as string;

  const [check, setCheck] = useState<Check | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [recipientName, setRecipientName] = useState('');
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
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.message || 'Failed to load check');
      console.error('Error loading check:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDisburse() {
    if (!recipientName.trim()) {
      alert('Please enter the recipient name');
      return;
    }

    try {
      setActionLoading(true);
      await clearCheck(checkId, recipientName);
      await loadCheck();
      setShowDisburseModal(false);
      setRecipientName('');
    } catch (err: unknown) {
      alert((err as any)?.response?.data?.message || 'Failed to disburse check');
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
    } catch (err: unknown) {
      alert((err as any)?.response?.data?.message || 'Failed to void check');
    } finally {
      setActionLoading(false);
    }
  }

  const canClear = 
    check?.status === CheckStatus.ISSUED &&
    (user?.role === UserRole.FINANCE || user?.role === UserRole.ADMIN);
  const canVoid = 
    check?.status === CheckStatus.ISSUED &&
    (user?.role === UserRole.FINANCE || user?.role === UserRole.ADMIN);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !check) {
    return (
      <ProtectedRoute>
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/checks')}
            className="w-fit text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Checks
          </Button>
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error || 'Check not found'}</p>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header with Back Button and Title */}
        <div className="flex flex-col gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/checks')}
            className="w-fit text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Checks
          </Button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Check #{check.checkNumber}
              </h1>
              <StatusBadge status={check.status} />
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Check Details and Disbursement
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap items-center justify-between">
            {/* Workflow Action Buttons (Left) */}
            <div className="flex gap-2 flex-wrap">
              {canClear && (
                <Button 
                  onClick={() => setShowDisburseModal(true)} 
                  disabled={actionLoading} 
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
                >
                  <CheckCircle className="h-4 w-4" />
                  Disburse Check
                </Button>
              )}
              {canVoid && (
                <Button
                  variant="destructive"
                  onClick={() => setShowVoidModal(true)}
                  disabled={actionLoading}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Void Check
                </Button>
              )}
              {check.checkVoucher && (
                <Button
                  onClick={() => router.push(`/vouchers/${check.checkVoucherId}`)}
                  disabled={actionLoading}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white"
                >
                  <Receipt className="h-4 w-4" />
                  View Check Voucher
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
            {/* Check Information Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Check Information</CardTitle>
                  <StatusBadge status={check.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Key Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-700">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        Check Number
                      </label>
                      <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mt-2">
                        {check.checkNumber}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        Amount
                      </label>
                      <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mt-2">
                        ₱ {Number(check.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      </p>
                    </div>
                  </div>

                  {/* Payee */}
                  <div className="pb-6 border-b border-zinc-200 dark:border-zinc-700">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                      Payee
                    </label>
                    <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-2">
                      {check.payee}
                    </p>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-700">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        Check Date
                      </label>
                      <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-2">
                        {check.checkDate ? format(parseISO(check.checkDate), 'MMMM dd, yyyy') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        Disbursement Date
                      </label>
                      <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-2">
                        {check.disbursementDate ? format(parseISO(check.disbursementDate), 'MMMM dd, yyyy') : 'Not disbursed'}
                      </p>
                    </div>
                  </div>

                  {/* Received By */}
                  {check.receivedBy && (
                    <div className="pb-6 border-b border-zinc-200 dark:border-zinc-700">
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        Received By
                      </label>
                      <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-2">
                        {check.receivedBy}
                      </p>
                    </div>
                  )}

                  {/* Bank Account Information */}
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                      Bank Account
                    </label>
                    <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-md border border-zinc-100 dark:border-zinc-800">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{check.bankAccount?.bankName}</p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{check.bankAccount?.accountNumber}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{check.bankAccount?.accountName}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Check Voucher Reference */}
            {check.checkVoucher && (
              <Card>
                <CardHeader>
                  <CardTitle>Check Voucher</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-100 dark:border-purple-800 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    onClick={() => router.push(`/vouchers/${check.checkVoucherId}`)}
                  >
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <p className="font-medium text-purple-700 dark:text-purple-300">{check.checkVoucher.cvNumber}</p>
                    </div>
                    <p className="text-xs text-purple-600/80 dark:text-purple-400/80 mt-1 pl-6">
                      Click to view voucher details
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    Created
                  </label>
                  <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-1">
                    {check.createdAt ? format(parseISO(check.createdAt), 'MMM d, yyyy h:mm a') : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    Last Updated
                  </label>
                  <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-1">
                    {check.updatedAt ? format(parseISO(check.updatedAt), 'MMM d, yyyy h:mm a') : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Disburse Check Dialog */}
        <Dialog open={showDisburseModal} onOpenChange={setShowDisburseModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disburse Check</DialogTitle>
              <DialogDescription>
                Confirm check disbursement by entering the recipient&apos;s name.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium mb-2 block">Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Enter recipient name..."
                className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDisburseModal(false);
                  setRecipientName('');
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDisburse} 
                disabled={actionLoading || !recipientName.trim()}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
              >
                {actionLoading ? 'Disbursing...' : 'Disburse Check'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Void Dialog */}
        <Dialog open={showVoidModal} onOpenChange={setShowVoidModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Void Check</DialogTitle>
              <DialogDescription>
                Are you sure you want to void this check? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium mb-2 block">Reason for Voiding</label>
              <Textarea
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Enter reason..."
                className="w-full"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowVoidModal(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleVoid} disabled={actionLoading}>
                Void Check
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
