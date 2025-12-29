import api from "../lib/api";
import { RequisitionForPayment, ApprovalRecord } from "@docflows/shared";

export interface CreateRequisitionForPaymentDto {
  requisitionSlipId?: string;
  requesterId: string;
  departmentId: string;
  seriesCode: string;
  dateRequested: string;
  dateNeeded: string;
  payee: string;
  particulars: string;
  amount: number;
  currency?: string;
}

export interface UpdateRequisitionForPaymentDto {
  requisitionSlipId?: string;
  seriesCode?: string;
  dateRequested?: string;
  dateNeeded?: string;
  payee?: string;
  particulars?: string;
  amount?: number;
  currency?: string;
}

export interface RejectRFPDto {
  reason: string;
}

export interface RFPFilters {
  status?: string;
  payee?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Get all requisitions for payment with optional filters
 */
export async function getRequisitionsForPayment(
  filters?: RFPFilters
): Promise<RequisitionForPayment[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.payee) params.append("payee", filters.payee);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const response = await api.get(`/payments?${params.toString()}`);
  return response.data;
}

/**
 * Get a single requisition for payment by ID
 */
export async function getRequisitionForPayment(
  id: string
): Promise<RequisitionForPayment> {
  const response = await api.get(`/payments/${id}`);
  return response.data;
}

/**
 * Create a new requisition for payment
 */
export async function createRequisitionForPayment(
  dto: CreateRequisitionForPaymentDto
): Promise<RequisitionForPayment> {
  const response = await api.post("/payments", dto);
  return response.data;
}

/**
 * Update an existing requisition for payment
 */
export async function updateRequisitionForPayment(
  id: string,
  dto: UpdateRequisitionForPaymentDto
): Promise<RequisitionForPayment> {
  const response = await api.patch(`/payments/${id}`, dto);
  return response.data;
}

/**
 * Delete a requisition for payment
 */
export async function deleteRequisitionForPayment(id: string): Promise<void> {
  await api.delete(`/payments/${id}`);
}

/**
 * Submit a requisition for payment for approval
 */
export async function submitRequisitionForPayment(
  id: string
): Promise<RequisitionForPayment> {
  const response = await api.post(`/payments/${id}/submit`);
  return response.data;
}

/**
 * Approve a requisition for payment
 */
export async function approveRequisitionForPayment(
  id: string
): Promise<RequisitionForPayment> {
  const response = await api.post(`/payments/${id}/approve`);
  return response.data;
}

/**
 * Reject a requisition for payment
 */
export async function rejectRequisitionForPayment(
  id: string,
  dto: RejectRFPDto
): Promise<RequisitionForPayment> {
  const response = await api.post(`/payments/${id}/reject`, dto);
  return response.data;
}

/**
 * Cancel a requisition for payment
 */
export async function cancelRequisitionForPayment(
  id: string
): Promise<RequisitionForPayment> {
  const response = await api.post(`/payments/${id}/cancel`);
  return response.data;
}
