import api from "../lib/api";
import { CheckVoucher } from "@docflows/shared";

/**
 * Get all check vouchers
 */
export async function getCheckVouchers(): Promise<CheckVoucher[]> {
  const response = await api.get("/payments/check-vouchers/all");
  return response.data;
}

/**
 * Get a single check voucher by ID
 */
export async function getCheckVoucher(id: string): Promise<CheckVoucher> {
  const response = await api.get(`/payments/check-vouchers/${id}`);
  return response.data;
}

/**
 * Generate a check voucher from an approved RFP
 */
export async function generateCheckVoucher(
  rfpId: string
): Promise<CheckVoucher> {
  const response = await api.post(`/payments/${rfpId}/create-cv`);
  return response.data;
}

/**
 * Verify a check voucher (Finance Staff)
 */
export async function verifyCheckVoucher(id: string): Promise<CheckVoucher> {
  const response = await api.patch(`/payments/check-vouchers/${id}/verify`);
  return response.data;
}

/**
 * Approve a check voucher (Accounting Head)
 */
export async function approveCheckVoucher(id: string): Promise<CheckVoucher> {
  const response = await api.patch(`/payments/check-vouchers/${id}/approve`);
  return response.data;
}
