'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RequisitionForPayment, RFPStatus } from '@docflows/shared';
import { getRequisitionsForPayment } from '@/services/paymentService';
import { Banknote, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/requisitions/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { format, parseISO } from 'date-fns';

const statusTabs = [
  { label: 'All', value: null },
  { label: 'Draft', value: RFPStatus.DRAFT },
  { label: 'Pending', value: RFPStatus.SUBMITTED },
  { label: 'Approved', value: RFPStatus.APPROVED },
  { label: 'CV Generated', value: RFPStatus.CV_GENERATED },
  { label: 'Check Issued', value: RFPStatus.CHECK_ISSUED },
  { label: 'Disbursed', value: RFPStatus.DISBURSED },
  { label: 'Rejected', value: RFPStatus.REJECTED },
];

export default function PaymentsListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [payments, setPayments] = useState<RequisitionForPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<RequisitionForPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<RFPStatus | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchQuery, selectedStatus]);

  async function loadPayments() {
    try {
      setLoading(true);
      setError(null);
      const data = await getRequisitionsForPayment();
      setPayments(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load payment requests');
      console.error('Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  }

  function filterPayments() {
    let filtered = payments;

    if (selectedStatus) {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.payee.toLowerCase().includes(query) ||
        p.particulars?.toLowerCase().includes(query) ||
        p.seriesCode?.toLowerCase().includes(query) ||
        p.rfpNumber?.toLowerCase().includes(query)
      );
    }

    setFilteredPayments(filtered);
  }

  function getStatusCounts() {
    return {
      total: payments.length,
      draft: payments.filter(p => p.status === RFPStatus.DRAFT).length,
      pending: payments.filter(p => [RFPStatus.SUBMITTED, RFPStatus.CV_GENERATED].includes(p.status)).length,
      approved: payments.filter(p => p.status === RFPStatus.APPROVED).length,
    };
  }

  const counts = getStatusCounts();

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
                    {counts.total}
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
                  <p className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">
                    {counts.draft}
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
                    {counts.pending}
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
                    {counts.approved}
                  </p>
                </div>
                <Banknote className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search by payee, particulars, or RFP number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {/* Status Filter Tabs */}
              <div className="flex gap-2 overflow-x-auto max-w-full pb-2 lg:pb-0">
                {statusTabs.map((tab) => (
                  <Button
                    key={tab.label}
                    variant={selectedStatus === tab.value ? 'default' : 'secondary'}
                    className="px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap"
                    onClick={() => setSelectedStatus(tab.value)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

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
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        {searchQuery || selectedStatus
                          ? 'No payment requests found matching your criteria'
                          : 'No payment requests yet. Create your first one!'}
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr
                        key={payment.id}
                        onClick={() => router.push(`/payments/${payment.id}`)}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                          {payment.rfpNumber || payment.seriesCode || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">
                          {payment.payee}
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
