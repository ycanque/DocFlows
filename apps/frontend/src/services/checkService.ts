import api from "../lib/api";
import { Check } from "@docflows/shared";

export interface IssueCheckDto {
  checkNumber: string;
  bankAccountId: string;
}

export interface VoidCheckDto {
  reason: string;
}

/**
 * Get all checks
 */
export async function getChecks(): Promise<Check[]> {
  const response = await api.get("/payments/checks/all");
  return response.data;
}

/**
 * Get a single check by ID
 */
export async function getCheck(id: string): Promise<Check> {
  const response = await api.get(`/payments/checks/${id}`);
  return response.data;
}

/**
 * Issue a check from an approved check voucher
 */
export async function issueCheck(
  cvId: string,
  dto: IssueCheckDto
): Promise<Check> {
  const response = await api.post(
    `/payments/check-vouchers/${cvId}/issue-check`,
    dto
  );
  return response.data;
}

/**
 * Clear/disburse a check (Treasury)
 */
export async function clearCheck(id: string): Promise<Check> {
  const response = await api.patch(`/payments/checks/${id}/clear`);
  return response.data;
}

/**
 * Void a check with a reason
 */
export async function voidCheck(id: string, dto: VoidCheckDto): Promise<Check> {
  const response = await api.patch(`/payments/checks/${id}/void`, dto);
  return response.data;
}
