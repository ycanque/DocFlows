'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { RequisitionForPayment, RFPStatus, UserRole, CheckVoucher } from '@docflows/shared';
import {
  getRequisitionForPayment,
  submitRequisitionForPayment,
  approveRequisitionForPayment,
  rejectRequisitionForPayment,
  cancelRequisitionForPayment,
  deleteRequisitionForPayment,
} from '@/services/paymentService';
import { generateCheckVoucher } from '@/services/checkVoucherService';
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
import PaymentStatusTimeline from '@/components/payments/PaymentStatusTimeline';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, FileText, CheckCircle, XCircle, Ban, Trash2, Receipt, Edit, ArrowRight, CreditCard } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const paymentId = params?.id as string;

  const [payment, setPayment] = useState<RequisitionForPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (paymentId) {
      loadPayment();
    }
  }, [paymentId]);

  async function loadPayment() {
    try {
      setLoading(true);
      setError(null);
      const data = await getRequisitionForPayment(paymentId);
      setPayment(data);
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.message || 'Failed to load payment request');
      console.error('Error loading payment:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!payment) return;
    try {
      setActionLoading(true);
      setError(null);
      await submitRequisitionForPayment(payment.id);
      setSuccess('Payment request submitted successfully!');
      await loadPayment();
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.message || 'Failed to submit payment request');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleApprove() {
    if (!payment) return;
    try {
      setActionLoading(true);
      setError(null);
      await approveRequisitionForPayment(payment.id);
      setSuccess('Payment request approved successfully!');
      await loadPayment();
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.message || 'Failed to approve payment request');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!payment || !rejectReason.trim()) {
      setError('Please enter a reason for rejection');
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      await rejectRequisitionForPayment(payment.id, { reason: rejectReason });
      setSuccess('Payment request rejected');
      setShowRejectModal(false);
      setRejectReason('');
      await loadPayment();
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.message || 'Failed to reject payment request');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!payment) return;
    try {
      setActionLoading(true);
      setError(null);
      await cancelRequisitionForPayment(payment.id);
      setSuccess('Payment request cancelled');
      await loadPayment();
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.message || 'Failed to cancel payment request');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!payment || !confirm('Are you sure you want to delete this payment request?')) return;
    try {
      setActionLoading(true);
      setError(null);
      await deleteRequisitionForPayment(payment.id);
      setSuccess('Payment request deleted');
      router.push('/payments');
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.message || 'Failed to delete payment request');
      setActionLoading(false);
    }
  }

  async function handleGenerateCV() {
    if (!payment) return;
    try {
      setActionLoading(true);
      setError(null);
      const cv = await generateCheckVoucher(payment.id);
      setSuccess('Check voucher generated successfully!');
      await loadPayment();
    } catch (err: unknown) {
      setError((err as any)?.response?.data?.message || 'Failed to generate check voucher');
    } finally {
      setActionLoading(false);
    }
  }

  function canSubmit() {
    return payment?.status === RFPStatus.DRAFT && 
           (user?.role === UserRole.USER || user?.role === UserRole.ADMIN);
  }

  function canApprove() {
    return payment?.status === RFPStatus.SUBMITTED &&
           (user?.role === UserRole.APPROVER || user?.role === UserRole.FINANCE || user?.role === UserRole.ADMIN);
  }

  function canReject() {
    return payment?.status === RFPStatus.SUBMITTED &&
           (user?.role === UserRole.APPROVER || user?.role === UserRole.FINANCE || user?.role === UserRole.ADMIN);
  }

  function canCancel() {
    return ![RFPStatus.APPROVED, RFPStatus.CV_GENERATED, RFPStatus.CHECK_ISSUED, RFPStatus.DISBURSED, RFPStatus.CANCELLED, RFPStatus.REJECTED].includes(payment?.status as RFPStatus) &&
           user?.role === UserRole.ADMIN;
  }

  function canDelete() {
    return payment?.status === RFPStatus.DRAFT && user?.role === UserRole.ADMIN;
  }

  function canEdit() {
    return payment?.status === RFPStatus.DRAFT &&
           (payment?.requesterId === user?.id || user?.role === UserRole.ADMIN);
  }

  function canGenerateCV() {
    return payment?.status === RFPStatus.APPROVED &&
           !payment?.checkVoucher &&
           (user?.role === UserRole.FINANCE || user?.role === UserRole.ADMIN);
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !payment) {
    return (
      <ProtectedRoute>
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/payments')}
            className="w-fit text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payments
          </Button>
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                {error || 'Payment request not found'}
              </p>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  if (!payment) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/payments')}
                  className="w-fit text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800 -ml-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Payment Requests
                </Button>
                
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {payment.rfpNumber || payment.seriesCode || `RFP #${payment.id}`}
                  </h1>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Payment Request Details
                  </p>
                </div>

                {/* All Action Buttons (Workflow left, CRUD right) */}
                <div className="flex gap-2 flex-wrap items-center justify-between">
                  {/* Workflow Action Buttons (Left) */}
                  <div className="flex gap-2 flex-wrap">
                    {canSubmit() && (
                      <Button
                        onClick={handleSubmit}
                        disabled={actionLoading}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Submit for Approval
                      </Button>
                    )}
                    {canApprove() && (
                      <Button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                    )}
                    {canReject() && (
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
                    {canGenerateCV() && (
                      <Button
                        onClick={handleGenerateCV}
                        disabled={actionLoading}
                        className="flex items-center gap-2"
                      >
                        <Receipt className="h-4 w-4" />
                        Generate Check Voucher
                      </Button>
                    )}
                    {canCancel() && (
                      <Button
                        onClick={handleCancel}
                        disabled={actionLoading}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Ban className="h-4 w-4" />
                        Cancel
                      </Button>
                    )}
                    {payment.checkVoucher && (
                      <Button
                        onClick={() => router.push(`/vouchers/${payment.checkVoucher?.id}`)}
                        disabled={actionLoading}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white"
                      >
                        <Receipt className="h-4 w-4" />
                        View Check Voucher
                      </Button>
                    )}
                    {payment.checkVoucher?.check && (
                      <Button
                        onClick={() => router.push(`/checks/${payment.checkVoucher?.check?.id}`)}
                        disabled={actionLoading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                      >
                        <CreditCard className="h-4 w-4" />
                        View Check
                      </Button>
                    )}
                  </div>

                  {/* CRUD Action Buttons (Right) */}
                  <div className="flex gap-2 flex-wrap">
                    {canEdit() && (
                      <Button
                        onClick={() => router.push(`/payments/${paymentId}/edit`)}
                        disabled={actionLoading}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                    {canDelete() && (
                      <Button
                        onClick={handleDelete}
                        disabled={actionLoading}
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                  <CardContent className="p-4">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </CardContent>
                </Card>
              )}

              {/* Success Message */}
              {success && (
                <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                  <CardContent className="p-4">
                    <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
                  </CardContent>
                </Card>
              )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Payment Information</CardTitle>
                  <StatusBadge status={payment.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Key Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-700">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        RFP #
                      </label>
                      <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mt-2">
                        {payment.rfpNumber}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        Approval Level
                      </label>
                      <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mt-2">
                        {payment.currentApprovalLevel}
                      </p>
                    </div>
                  </div>

                  {/* Requester and Department */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-700">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        Requester
                      </label>
                      <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-2">
                        {payment.requester
                          ? `${payment.requester.firstName} ${payment.requester.lastName}`
                          : 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        Department
                      </label>
                      <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-2">
                        {payment.department?.name || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Payee and Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-700">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        Payee
                      </label>
                      <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-2">
                        {payment.payee}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        Amount
                      </label>
                      <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mt-2">
                        {payment.currency === 'PHP' ? '₱' : payment.currency} {Number(payment.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-700">
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        Date Requested
                      </label>
                      <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-2">
                        {payment.dateRequested ? format(parseISO(payment.dateRequested), 'MMM dd, yyyy') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        Date Needed
                      </label>
                      <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-2">
                        {payment.dateNeeded ? format(parseISO(payment.dateNeeded), 'MMM dd, yyyy') : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Series Code */}
                  <div className="pb-6 border-b border-zinc-200 dark:border-zinc-700">
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                      Series Code
                    </label>
                    <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-2">
                      {payment.seriesCode || 'N/A'}
                      {payment.seriesCode && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-2">
                          ({payment.seriesCode === 'S' ? 'Standard' : payment.seriesCode === 'U' ? 'Urgent' : payment.seriesCode === 'G' ? 'General' : ''})
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Particulars */}
                  {payment.particulars && (
                    <div>
                      <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        Particulars
                      </label>
                      <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-2 leading-relaxed">
                        {payment.particulars}
                      </p>
                    </div>
                  )}
                </div>
                

              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Approval History</CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentStatusTimeline 
                  approvalRecords={payment.approvalRecords || []} 
                  createdAt={payment.createdAt}
                  requester={payment.requester}
                  checkVoucher={payment.checkVoucher}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reject Modal */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Payment Request</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting this payment request. This will be recorded in the approval history.
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
                {actionLoading ? 'Rejecting...' : 'Reject Request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
