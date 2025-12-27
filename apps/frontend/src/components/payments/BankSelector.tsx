'use client';

import { useState, useEffect } from 'react';
import { BankAccount } from '@docflows/shared';
import { getActiveBankAccounts } from '@/services/bankAccountService';
import { ChevronDown } from 'lucide-react';

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

  const selectedAccount = bankAccounts.find(acc => acc.id === value);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {loading ? (
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      ) : loadError ? (
        <div className="text-sm text-red-600 dark:text-red-400">
          {loadError}
        </div>
      ) : (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={required}
            className={`
              w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-800 px-4 py-2.5 pr-10 text-sm
              text-gray-900 dark:text-gray-100
              transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 
              dark:focus:ring-offset-0
              disabled:bg-gray-100 dark:disabled:bg-gray-700 
              disabled:text-gray-500 dark:disabled:text-gray-400
              disabled:cursor-not-allowed
              ${error ? 'border-red-300 dark:border-red-600 focus:ring-red-500' : ''}
            `}
          >
            <option value="">Select a bank account...</option>
            {bankAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.accountNumber} - {account.bankName} ({account.accountName})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
