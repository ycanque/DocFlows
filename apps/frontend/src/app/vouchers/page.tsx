'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { CheckVoucher, CheckVoucherStatus } from '@docflows/shared';
import { getCheckVouchers } from '@/services/checkVoucherService';
import { CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/requisitions/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { format, parseISO } from 'date-fns';
import VoucherFilters, { VoucherFiltersState } from '@/components/vouchers/VoucherFilters';

export default function CheckVouchersListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState<CheckVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<VoucherFiltersState>({
    searchQuery: '',
    status: null,
    createdFrom: null,
    createdTo: null,
    amountMin: null,
    amountMax: null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    loadVouchers();
  }, []);

  async function loadVouchers() {
    try {
      setLoading(true);
      setError(null);
      const data = await getCheckVouchers();
      setVouchers(data);
    } catch (err) {
      const axiosError = err as AxiosError<{message?: string}>;
      setError(axiosError?.response?.data?.message || 'Failed to load check vouchers');
      console.error('Error loading check vouchers:', err);
    } finally {
      setLoading(false);
    }
  }

  // Apply filters and sorting
  const filteredVouchers = useMemo(() => {
    let filtered = [...vouchers];

    // Filter by search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.cvNumber?.toLowerCase().includes(query) ||
        v.requisitionForPayment?.payee?.toLowerCase().includes(query) ||
        v.requisitionForPayment?.particulars?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(v => v.status === filters.status);
    }

    // Filter by amount range
    if (filters.amountMin) {
      filtered = filtered.filter(v => {
        const amount = v.requisitionForPayment?.amount;
        return amount && Number(amount) >= Number(filters.amountMin);
      });
    }
    if (filters.amountMax) {
      filtered = filtered.filter(v => {
        const amount = v.requisitionForPayment?.amount;
        return amount && Number(amount) <= Number(filters.amountMax);
      });
    }

    // Filter by created date range
    if (filters.createdFrom && filtered.length > 0) {
      filtered = filtered.filter(v => new Date(v.createdAt) >= new Date(filters.createdFrom!));
    }
    if (filters.createdTo && filtered.length > 0) {
      filtered = filtered.filter(v => new Date(v.createdAt) <= new Date(filters.createdTo!));
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'cvNumber':
          comparison = (a.cvNumber || '').localeCompare(b.cvNumber || '');
          break;
        case 'payee':
          comparison = (a.requisitionForPayment?.payee || '').localeCompare(b.requisitionForPayment?.payee || '');
          break;
        case 'amount':
          comparison = Number(a.requisitionForPayment?.amount || 0) - Number(b.requisitionForPayment?.amount || 0);
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
  }, [vouchers, filters]);

  // Calculate statistics
  const stats = useMemo(() => ({
    total: vouchers.length,
    draft: vouchers.filter((v) => v.status === CheckVoucherStatus.DRAFT).length,
    verified: vouchers.filter((v) => v.status === CheckVoucherStatus.VERIFIED).length,
    approved: vouchers.filter((v) => v.status === CheckVoucherStatus.APPROVED).length,
    issued: vouchers.filter((v) => v.status === CheckVoucherStatus.CHECK_ISSUED).length,
  }), [vouchers]);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Check Vouchers
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              View and manage check vouchers generated from approved payment requests
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/payments')}>
            Back to Payments
          </Button>
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
                <CheckSquare className="h-8 w-8 text-zinc-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Draft</p>
                  <p className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">
                    {stats.draft}
                  </p>
                </div>
                <CheckSquare className="h-8 w-8 text-zinc-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Verified</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.verified}
                  </p>
                </div>
                <CheckSquare className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Approved</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.approved}
                  </p>
                </div>
                <CheckSquare className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <VoucherFilters
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Vouchers Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      CV Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      RFP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Payee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-950 divide-y divide-zinc-200 dark:divide-zinc-800">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredVouchers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        {filters.searchQuery || filters.status || filters.amountMin || 
                         filters.amountMax || filters.createdFrom || filters.createdTo
                          ? 'No check vouchers found matching your criteria'
                          : 'No check vouchers found'}
                      </td>
                    </tr>
                  ) : (
                    filteredVouchers.map((voucher) => (
                      <tr
                        key={voucher.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                        onClick={() => router.push(`/vouchers/${voucher.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                          {voucher.cvNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                          {voucher.requisitionForPayment?.rfpNumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                          {voucher.requisitionForPayment?.payee || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                          {voucher.requisitionForPayment?.currency === 'PHP' ? '₱' : voucher.requisitionForPayment?.currency} {Number(voucher.requisitionForPayment?.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={voucher.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                          {voucher.createdAt ? format(parseISO(voucher.createdAt), 'MMM dd, yyyy') : 'N/A'}
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
