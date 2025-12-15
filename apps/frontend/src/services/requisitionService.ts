import api from '../lib/api';
import { RequisitionSlip, RequestItem, ApprovalRecord } from '@docflows/shared';

export interface CreateRequisitionDto {
  departmentId: string;
  costCenterId?: string;
  projectId?: string;
  businessUnitId?: string;
  dateRequested: string;
  dateNeeded: string;
  purpose: string;
  currency?: string;
  items: Omit<RequestItem, 'id' | 'requisitionSlipId' | 'createdAt' | 'updatedAt'>[];
}

export interface UpdateRequisitionDto {
  departmentId?: string;
  costCenterId?: string;
  projectId?: string;
  businessUnitId?: string;
  dateRequested?: string;
  dateNeeded?: string;
  purpose?: string;
  currency?: string;
}

export interface RejectRequisitionDto {
  reason: string;
}

/**
 * Get all requisitions
 */
export async function getRequisitions(): Promise<RequisitionSlip[]> {
  const response = await api.get('/requisitions');
  return response.data;
}

/**
 * Get a single requisition by ID
 */
export async function getRequisition(id: string): Promise<RequisitionSlip> {
  const response = await api.get(`/requisitions/${id}`);
  return response.data;
}

/**
 * Create a new requisition
 */
export async function createRequisition(data: CreateRequisitionDto): Promise<RequisitionSlip> {
  const response = await api.post('/requisitions', data);
  return response.data;
}

/**
 * Update an existing requisition
 */
export async function updateRequisition(
  id: string,
  data: UpdateRequisitionDto
): Promise<RequisitionSlip> {
  const response = await api.patch(`/requisitions/${id}`, data);
  return response.data;
}

/**
 * Delete a requisition
 */
export async function deleteRequisition(id: string): Promise<void> {
  await api.delete(`/requisitions/${id}`);
}

/**
 * Submit a requisition for approval
 */
export async function submitRequisition(id: string): Promise<RequisitionSlip> {
  const response = await api.post(`/requisitions/${id}/submit`);
  return response.data;
}

/**
 * Approve a requisition
 */
export async function approveRequisition(id: string): Promise<RequisitionSlip> {
  const response = await api.post(`/requisitions/${id}/approve`);
  return response.data;
}

/**
 * Reject a requisition
 */
export async function rejectRequisition(
  id: string,
  data: RejectRequisitionDto
): Promise<RequisitionSlip> {
  const response = await api.post(`/requisitions/${id}/reject`, data);
  return response.data;
}

/**
 * Cancel a requisition
 */
export async function cancelRequisition(id: string): Promise<RequisitionSlip> {
  const response = await api.post(`/requisitions/${id}/cancel`);
  return response.data;
}

/**
 * Get approval history for a requisition
 */
export async function getApprovalHistory(id: string): Promise<ApprovalRecord[]> {
  const response = await api.get(`/requisitions/${id}/approval-history`);
  return response.data;
}
