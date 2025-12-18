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
import StatusBadge from '@/components/requisitions/StatusBadge';
import PaymentStatusTimeline from '@/components/payments/PaymentStatusTimeline';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, FileText, CheckCircle, XCircle, Ban, Trash2, Receipt } from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load payment request');
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
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit payment request');
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
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to approve payment request');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!payment) return;
    try {
      setActionLoading(true);
      setError(null);
      await rejectRequisitionForPayment(payment.id, 'Rejected by approver');
      setSuccess('Payment request rejected');
      await loadPayment();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to reject payment request');
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
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to cancel payment request');
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
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete payment request');
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
      router.push(`/payments/vouchers/${cv.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to generate check voucher');
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
    return [RFPStatus.SUBMITTED, RFPStatus.APPROVED].includes(payment?.status as RFPStatus) &&
           (user?.role === UserRole.APPROVER || user?.role === UserRole.FINANCE || user?.role === UserRole.ADMIN);
  }

  function canCancel() {
    return ![RFPStatus.DISBURSED, RFPStatus.CANCELLED, RFPStatus.REJECTED].includes(payment?.status as RFPStatus) &&
           user?.role === UserRole.ADMIN;
  }

  function canDelete() {
    return payment?.status === RFPStatus.DRAFT && user?.role === UserRole.ADMIN;
  }

  function canGenerateCV() {
    return payment?.status === RFPStatus.APPROVED &&
           !payment?.checkVoucher &&
           (user?.role === UserRole.FINANCE || user?.role === UserRole.ADMIN);
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900">
          <Sidebar 
            currentView="payments"
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopBar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
            <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900" role="main">
              <div className="p-6">
                <div className="text-center py-12">
                  <p className="text-zinc-600 dark:text-zinc-400">Loading payment request...</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !payment) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900">
          <Sidebar 
            currentView="payments"
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopBar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
            <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900" role="main">
              <div className="p-6">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={() => router.push('/payments')} className="mt-4">
                      Back to Payments
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

  if (!payment) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900">
        <Sidebar 
          currentView="payments"
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900" role="main">
            <div className="p-6 sm:p-8 space-y-8">
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

                {/* Action Buttons */}
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
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                  )}
                  {canReject() && (
                    <Button
                      variant="destructive"
                      onClick={handleReject}
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Payee</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{payment.payee}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Amount</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {payment.currency} {payment.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Date</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {payment.date ? format(parseISO(payment.date), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Series Code</p>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {payment.seriesCode || 'N/A'}
                    </p>
                  </div>
                </div>
                {payment.particulars && (
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Particulars</p>
                    <p className="text-zinc-900 dark:text-zinc-100">{payment.particulars}</p>
                  </div>
                )}
                {payment.checkVoucher && (
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Check Voucher</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/payments/vouchers/${payment.checkVoucher?.id}`)}
                    >
                      View Check Voucher
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Approval Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentStatusTimeline payment={payment} />
              </CardContent>
            </Card>

            {(canCancel() || canDelete()) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {canCancel() && (
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={actionLoading}
                      className="w-full gap-2 text-orange-600 border-orange-600 hover:bg-orange-50"
                    >
                      <Ban className="h-4 w-4" />
                      Cancel Request
                    </Button>
                  )}
                  {canDelete() && (
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={actionLoading}
                      className="w-full gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Request
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
