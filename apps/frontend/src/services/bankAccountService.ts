import api from "../lib/api";
import { BankAccount } from "@docflows/shared";

export interface CreateBankAccountDto {
  accountName: string;
  accountNumber: string;
  bankName: string;
  isActive?: boolean;
}

export interface UpdateBankAccountDto {
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  isActive?: boolean;
}

/**
 * Get all bank accounts
 */
export async function getBankAccounts(): Promise<BankAccount[]> {
  const response = await api.get("/payments/bank-accounts");
  return response.data;
}

/**
 * Get only active bank accounts (for dropdowns)
 */
export async function getActiveBankAccounts(): Promise<BankAccount[]> {
  const response = await api.get("/payments/bank-accounts/active");
  return response.data;
}

/**
 * Get a single bank account by ID
 */
export async function getBankAccount(id: string): Promise<BankAccount> {
  const response = await api.get(`/payments/bank-accounts/${id}`);
  return response.data;
}

/**
 * Create a new bank account
 */
export async function createBankAccount(
  dto: CreateBankAccountDto
): Promise<BankAccount> {
  const response = await api.post("/payments/bank-accounts", dto);
  return response.data;
}

/**
 * Update an existing bank account
 */
export async function updateBankAccount(
  id: string,
  dto: UpdateBankAccountDto
): Promise<BankAccount> {
  const response = await api.patch(`/payments/bank-accounts/${id}`, dto);
  return response.data;
}

/**
 * Delete a bank account
 */
export async function deleteBankAccount(id: string): Promise<void> {
  await api.delete(`/payments/bank-accounts/${id}`);
}
