'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { RequisitionSlip, ApprovalRecord, RequisitionStatus, UserRole } from '@docflows/shared';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  getRequisition,
  getApprovalHistory,
  submitRequisition,
  approveRequisition,
  rejectRequisition,
  cancelRequisition,
} from '@/services/requisitionService';
import { ArrowLeft, CheckCircle, XCircle, Ban, Send, Edit } from 'lucide-react';
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
import ItemsTable from '@/components/requisitions/ItemsTable';
import ApprovalTimeline from '@/components/requisitions/ApprovalTimeline';
import { useAuth } from '@/contexts/AuthContext';

export default function RequisitionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const requisitionId = params?.id as string;

  const [requisition, setRequisition] = useState<RequisitionSlip | null>(null);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (requisitionId) {
      loadRequisition();
      loadApprovalHistory();
    }
  }, [requisitionId]);

  async function loadRequisition() {
    try {
      setLoading(true);
      setError(null);
      const data = await getRequisition(requisitionId);
      setRequisition(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load requisition');
      console.error('Error loading requisition:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadApprovalHistory() {
    try {
      const data = await getApprovalHistory(requisitionId);
      setApprovalHistory(data);
    } catch (err) {
      console.error('Error loading approval history:', err);
    }
  }

  async function handleSubmit() {
    if (!window.confirm('Submit this requisition for approval?')) return;

    try {
      setActionLoading(true);
      await submitRequisition(requisitionId);
      await loadRequisition();
      await loadApprovalHistory();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to submit requisition');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleApprove() {
    if (!window.confirm('Approve this requisition?')) return;

    try {
      setActionLoading(true);
      await approveRequisition(requisitionId);
      await loadRequisition();
      await loadApprovalHistory();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to approve requisition');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(true);
      await rejectRequisition(requisitionId, { reason: rejectReason });
      await loadRequisition();
      await loadApprovalHistory();
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reject requisition');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm('Cancel this requisition? This action cannot be undone.')) return;

    try {
      setActionLoading(true);
      await cancelRequisition(requisitionId);
      await loadRequisition();
      await loadApprovalHistory();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to cancel requisition');
    } finally {
      setActionLoading(false);
    }
  }

  function canSubmit(): boolean {
    if (!requisition || !user) return false;
    return (
      requisition.status === RequisitionStatus.DRAFT &&
      requisition.requesterId === user.id
    );
  }

  function canApprove(): boolean {
    if (!requisition || !user) return false;
    const isApprover = user.role === UserRole.APPROVER || user.role === UserRole.ADMIN;
    return (
      isApprover &&
      (requisition.status === RequisitionStatus.SUBMITTED ||
        requisition.status === RequisitionStatus.PENDING_APPROVAL)
    );
  }

  function canReject(): boolean {
    return canApprove();
  }

  function canCancel(): boolean {
    if (!requisition || !user) return false;
    return (
      (requisition.requesterId === user.id || user.role === UserRole.ADMIN) &&
      requisition.status !== RequisitionStatus.CANCELLED &&
      requisition.status !== RequisitionStatus.COMPLETED &&
      requisition.status !== RequisitionStatus.APPROVED &&
      requisition.status !== RequisitionStatus.REJECTED
    );
  }

  function canEdit(): boolean {
    if (!requisition || !user) return false;
    return (
      requisition.status === RequisitionStatus.DRAFT &&
      requisition.requesterId === user.id
    );
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

  if (error || !requisition) {
    return (
      <ProtectedRoute>
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/requisitions')}
            className="w-fit text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requisitions
          </Button>
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                {error || 'Requisition not found'}
              </p>
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
          onClick={() => router.push('/requisitions')}
          className="w-fit text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Requisitions
        </Button>
        
        {/* Requisition ID and Subtitle */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {requisition.requisitionNumber}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Requisition Details
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
                <Send className="h-4 w-4" />
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
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject
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
          </div>

          {/* CRUD Action Buttons (Right) */}
          <div className="flex gap-2 flex-wrap">
            {canEdit() && (
              <Button
                onClick={() => router.push(`/requisitions/${requisitionId}/edit`)}
                disabled={actionLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Requisition Information and Approval History - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Requisition Information */}
        <div className="md:col-span-2 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Requisition Information</CardTitle>
                <StatusBadge status={requisition.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Key Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-700">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                      Requisition #
                    </label>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mt-2">
                      {requisition.requisitionNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                      Approval Level
                    </label>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mt-2">
                      {requisition.currentApprovalLevel}
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
                      {requisition.requester
                        ? `${requisition.requester.firstName} ${requisition.requester.lastName}`
                        : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                      Department
                    </label>
                    <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-2">
                      {requisition.department?.name || 'N/A'}
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
                      {new Date(requisition.dateRequested).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                      Date Needed
                    </label>
                    <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-2">
                      {new Date(requisition.dateNeeded).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    Purpose
                  </label>
                  <p className="text-sm text-zinc-900 dark:text-zinc-50 mt-2 leading-relaxed">
                    {requisition.purpose}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Approval History */}
        <div className="md:col-span-2 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Approval History</CardTitle>
            </CardHeader>
            <CardContent>
              <ApprovalTimeline 
                approvalRecords={approvalHistory} 
                createdAt={requisition.createdAt}
                requester={requisition.requester}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Requisition Items */}
      <Card>
        <CardHeader>
          <CardTitle>Requisition Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemsTable items={requisition.items || []} />
        </CardContent>
      </Card>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Requisition</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this requisition
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="reject-reason" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Reason for Rejection
              </label>
              <textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent"
                placeholder="Please provide a reason for rejecting this requisition..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectReason.trim()}
            >
              Reject Requisition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </ProtectedRoute>
  );
}
