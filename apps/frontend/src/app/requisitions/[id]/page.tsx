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
import { ArrowLeft, CheckCircle, XCircle, Ban, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      requisition.status !== RequisitionStatus.COMPLETED
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
        <Button variant="ghost" onClick={() => router.push('/requisitions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Requisitions
        </Button>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">
            {error || 'Requisition not found'}
          </p>
        </div>
      </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/requisitions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {requisition.requisitionNumber}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Requisition Details
            </p>
          </div>
        </div>
        <StatusBadge status={requisition.status} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
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

      {/* Requisition Information */}
      <Card>
        <CardHeader>
          <CardTitle>Requisition Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Requisition Number
              </label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                {requisition.requisitionNumber}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </label>
              <div className="mt-1">
                <StatusBadge status={requisition.status} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Requester
              </label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                {requisition.requester
                  ? `${requisition.requester.firstName} ${requisition.requester.lastName}`
                  : 'Unknown'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Department
              </label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                {requisition.department?.name || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Date Requested
              </label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                {new Date(requisition.dateRequested).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Date Needed
              </label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                {new Date(requisition.dateNeeded).toLocaleDateString()}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Purpose
              </label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                {requisition.purpose}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Approval Level
              </label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                {requisition.currentApprovalLevel}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requisition Items */}
      <Card>
        <CardHeader>
          <CardTitle>Requisition Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemsTable items={requisition.items || []} />
        </CardContent>
      </Card>

      {/* Approval History */}
      <Card>
        <CardHeader>
          <CardTitle>Approval History</CardTitle>
        </CardHeader>
        <CardContent>
          <ApprovalTimeline approvalRecords={approvalHistory} />
        </CardContent>
      </Card>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Reject Requisition
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please provide a reason for rejecting this requisition..."
                />
              </div>
              <div className="flex gap-2 justify-end">
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
}
