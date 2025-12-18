'use client';

import { useState, useEffect } from 'react';
import { BankAccount } from '@docflows/shared';
import { getActiveBankAccounts } from '@/services/bankAccountService';

interface BankSelectorProps {
  value: string;
  onChange: (bankAccountId: string) => void;
  className?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
}

export default function BankSelector({
  value,
  onChange,
  className = '',
  disabled = false,
  error,
  label = 'Bank Account',
  required = false,
}: BankSelectorProps) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const accounts = await getActiveBankAccounts();
      setBankAccounts(accounts);
    } catch (err: any) {
      console.error('Failed to load bank accounts:', err);
      setLoadError(err.response?.data?.message || 'Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {loading ? (
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ) : loadError ? (
        <div className="text-sm text-red-600 dark:text-red-400">
          {loadError}
        </div>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          className={`
            block w-full rounded-md border-gray-300 dark:border-gray-600 
            shadow-sm focus:border-blue-500 focus:ring-blue-500 
            dark:bg-gray-700 dark:text-white sm:text-sm
            disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          `}
        >
          <option value="">Select a bank account...</option>
          {bankAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.accountNumber} - {account.bankName} ({account.accountName})
            </option>
          ))}
        </select>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
