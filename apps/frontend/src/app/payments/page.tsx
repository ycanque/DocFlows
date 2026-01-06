'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { RequisitionForPayment, RFPStatus } from '@docflows/shared';
import { getRequisitionsForPayment } from '@/services/paymentService';
import { Banknote, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/requisitions/StatusBadge';
import RichTextDisplay from '@/components/RichTextDisplay';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { format, parseISO } from 'date-fns';
import PaymentFilters, { PaymentFiltersState } from '@/components/payments/PaymentFilters';

export default function PaymentsListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [payments, setPayments] = useState<RequisitionForPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PaymentFiltersState>({
    searchQuery: '',
    status: null,
    dateNeededFrom: null,
    dateNeededTo: null,
    createdFrom: null,
    createdTo: null,
    amountMin: null,
    amountMax: null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    try {
      setLoading(true);
      setError(null);
      const data = await getRequisitionsForPayment();
      setPayments(data);
    } catch (err) {
      const axiosError = err as AxiosError<{message?: string}>;
      setError(axiosError?.response?.data?.message || 'Failed to load payment requests');
      console.error('Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  }

  // Apply filters and sorting
  const filteredPayments = useMemo(() => {
    let filtered = [...payments];

    // Filter by search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.payee.toLowerCase().includes(query) ||
        p.particulars?.toLowerCase().includes(query) ||
        p.seriesCode?.toLowerCase().includes(query) ||
        p.rfpNumber?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    // Filter by amount range
    if (filters.amountMin) {
      filtered = filtered.filter(p => Number(p.amount) >= Number(filters.amountMin));
    }
    if (filters.amountMax) {
      filtered = filtered.filter(p => Number(p.amount) <= Number(filters.amountMax));
    }

    // Filter by date needed range
    if (filters.dateNeededFrom && filtered.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.dateNeeded) return false;
        return new Date(p.dateNeeded) >= new Date(filters.dateNeededFrom!);
      });
    }
    if (filters.dateNeededTo && filtered.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.dateNeeded) return false;
        return new Date(p.dateNeeded) <= new Date(filters.dateNeededTo!);
      });
    }

    // Filter by created date range
    if (filters.createdFrom && filtered.length > 0) {
      filtered = filtered.filter(p => new Date(p.createdAt) >= new Date(filters.createdFrom!));
    }
    if (filters.createdTo && filtered.length > 0) {
      filtered = filtered.filter(p => new Date(p.createdAt) <= new Date(filters.createdTo!));
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'rfpNumber':
          comparison = (a.rfpNumber || a.seriesCode || '').localeCompare(b.rfpNumber || b.seriesCode || '');
          break;
        case 'payee':
          comparison = a.payee.localeCompare(b.payee);
          break;
        case 'amount':
          comparison = Number(a.amount) - Number(b.amount);
          break;
        case 'dateNeeded':
          if (!a.dateNeeded && !b.dateNeeded) comparison = 0;
          else if (!a.dateNeeded) comparison = 1;
          else if (!b.dateNeeded) comparison = -1;
          else comparison = new Date(a.dateNeeded).getTime() - new Date(b.dateNeeded).getTime();
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
  }, [payments, filters]);

  // Calculate statistics
  const stats = useMemo(() => ({
    total: payments.length,
    draft: payments.filter(p => p.status === RFPStatus.DRAFT).length,
    pending: payments.filter(p => [RFPStatus.SUBMITTED, RFPStatus.CV_GENERATED].includes(p.status)).length,
    approved: payments.filter(p => p.status === RFPStatus.APPROVED).length,
  }), [payments]);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Payment Requests</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage requisitions for payment (RFP) and track disbursements
            </p>
          </div>
          <Button onClick={() => router.push('/payments/create')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Payment Request
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Total</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {stats.total}
                  </p>
                </div>
                <Banknote className="h-8 w-8 text-zinc-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Draft</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {stats.draft}
                  </p>
                </div>
                <Banknote className="h-8 w-8 text-zinc-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.pending}
                  </p>
                </div>
                <Banknote className="h-8 w-8 text-yellow-400" />
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
                <Banknote className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <PaymentFilters
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Payments Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      RFP Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Payee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Particulars
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Date Needed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Status
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
                  ) : filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        {filters.searchQuery || filters.status || filters.amountMin || 
                         filters.amountMax || filters.dateNeededFrom || filters.dateNeededTo || 
                         filters.createdFrom || filters.createdTo
                          ? 'No payment requests found matching your criteria'
                          : 'No payment requests yet. Create your first one!'}
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr
                        key={payment.id}
                        onClick={() => router.push(`/payments/${payment.id}`)}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors align-top"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                          {payment.rfpNumber || payment.seriesCode || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">
                          {payment.payee}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100 max-w-xs">
                          <div className="truncate">
                            <RichTextDisplay content={payment.particulars} singleLine={true} className="truncate" />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                          {payment.currency === 'PHP' ? '₱' : payment.currency} {Number(payment.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900 dark:text-zinc-100">
                          {payment.dateNeeded ? format(parseISO(payment.dateNeeded), 'MMM dd, yyyy') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={payment.status} />
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
