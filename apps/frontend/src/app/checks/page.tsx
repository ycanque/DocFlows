'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { Check, CheckStatus } from '@docflows/shared';
import { getChecks } from '@/services/checkService';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/requisitions/StatusBadge';
import ProtectedRoute from '@/components/ProtectedRoute';
import { format, parseISO } from 'date-fns';
import CheckFilters, { CheckFiltersState } from '@/components/checks/CheckFilters';

export default function ChecksPage() {
  const router = useRouter();
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CheckFiltersState>({
    searchQuery: '',
    status: null,
    checkDateFrom: null,
    checkDateTo: null,
    createdFrom: null,
    createdTo: null,
    amountMin: null,
    amountMax: null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    loadChecks();
  }, []);

  async function loadChecks() {
    try {
      setLoading(true);
      setError(null);
      const data = await getChecks();
      setChecks(data);
    } catch (err) {
      const axiosError = err as AxiosError<{message?: string}>;
      setError(axiosError?.response?.data?.message || 'Failed to load checks');
      console.error('Error loading checks:', err);
    } finally {
      setLoading(false);
    }
  }

  // Apply filters and sorting
  const filteredChecks = useMemo(() => {
    let filtered = [...checks];

    // Filter by search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.checkNumber?.toLowerCase().includes(query) ||
        c.checkVoucher?.cvNumber?.toLowerCase().includes(query) ||
        c.bankAccount?.accountNumber?.toLowerCase().includes(query) ||
        c.payee?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    // Filter by amount range
    if (filters.amountMin) {
      filtered = filtered.filter(c => Number(c.amount) >= Number(filters.amountMin));
    }
    if (filters.amountMax) {
      filtered = filtered.filter(c => Number(c.amount) <= Number(filters.amountMax));
    }

    // Filter by check date range
    if (filters.checkDateFrom && filtered.length > 0) {
      filtered = filtered.filter(c => {
        if (!c.checkDate) return false;
        return new Date(c.checkDate) >= new Date(filters.checkDateFrom!);
      });
    }
    if (filters.checkDateTo && filtered.length > 0) {
      filtered = filtered.filter(c => {
        if (!c.checkDate) return false;
        return new Date(c.checkDate) <= new Date(filters.checkDateTo!);
      });
    }

    // Filter by created date range
    if (filters.createdFrom && filtered.length > 0) {
      filtered = filtered.filter(c => new Date(c.createdAt) >= new Date(filters.createdFrom!));
    }
    if (filters.createdTo && filtered.length > 0) {
      filtered = filtered.filter(c => new Date(c.createdAt) <= new Date(filters.createdTo!));
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'checkNumber':
          comparison = (a.checkNumber || '').localeCompare(b.checkNumber || '');
          break;
        case 'payee':
          comparison = (a.payee || '').localeCompare(b.payee || '');
          break;
        case 'amount':
          comparison = Number(a.amount) - Number(b.amount);
          break;
        case 'checkDate':
          if (!a.checkDate && !b.checkDate) comparison = 0;
          else if (!a.checkDate) comparison = 1;
          else if (!b.checkDate) comparison = -1;
          else comparison = new Date(a.checkDate).getTime() - new Date(b.checkDate).getTime();
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [checks, filters]);

  // Calculate statistics
  const stats = useMemo(() => ({
    total: checks.length,
    issued: checks.filter((c) => c.status === CheckStatus.ISSUED).length,
    cleared: checks.filter((c) => c.status === CheckStatus.DISBURSED).length,
    voided: checks.filter((c) => c.status === CheckStatus.VOIDED).length,
  }), [checks]);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Checks
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              View and manage issued checks
            </p>
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Total</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {stats.total}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-zinc-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Issued</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.issued}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Disbursed</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.cleared}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Voided</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {stats.voided}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <CheckFilters
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Checks Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Check Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Payee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Check Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-950 divide-y divide-zinc-200 dark:divide-zinc-800">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredChecks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        {filters.searchQuery || filters.status || filters.amountMin || 
                         filters.amountMax || filters.checkDateFrom || filters.checkDateTo || 
                         filters.createdFrom || filters.createdTo
                          ? 'No checks found matching your criteria'
                          : 'No checks issued yet.'}
                      </td>
                    </tr>
                  ) : (
                    filteredChecks.map((check) => (
                      <tr
                        key={check.id}
                        onClick={() => router.push(`/checks/${check.id}`)}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                          {check.checkNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">
                          {check.payee}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                          ₱ {Number(check.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                          {check.checkDate ? format(parseISO(check.checkDate), 'MMM dd, yyyy') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={check.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
