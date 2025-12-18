'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckVoucher, CheckVoucherStatus } from '@docflows/shared';
import { getCheckVouchers } from '@/services/checkVoucherService';
import { FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/requisitions/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { format, parseISO } from 'date-fns';

const statusTabs = [
  { label: 'All', value: null },
  { label: 'Draft', value: CheckVoucherStatus.DRAFT },
  { label: 'Verified', value: CheckVoucherStatus.VERIFIED },
  { label: 'Approved', value: CheckVoucherStatus.APPROVED },
  { label: 'Check Issued', value: CheckVoucherStatus.CHECK_ISSUED },
  { label: 'Rejected', value: CheckVoucherStatus.REJECTED },
];

export default function CheckVouchersListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [vouchers, setVouchers] = useState<CheckVoucher[]>([]);
  const [filteredVouchers, setFilteredVouchers] = useState<CheckVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CheckVoucherStatus | null>(null);

  useEffect(() => {
    loadVouchers();
  }, []);

  useEffect(() => {
    filterVouchers();
  }, [vouchers, searchQuery, selectedStatus]);

  async function loadVouchers() {
    try {
      setLoading(true);
      setError(null);
      const data = await getCheckVouchers();
      setVouchers(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load check vouchers');
      console.error('Error loading check vouchers:', err);
    } finally {
      setLoading(false);
    }
  }

  function filterVouchers() {
    let filtered = [...vouchers];

    if (selectedStatus) {
      filtered = filtered.filter((voucher) => voucher.status === selectedStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (voucher) =>
          voucher.cvNumber?.toLowerCase().includes(query) ||
          voucher.requisitionForPayment?.payee?.toLowerCase().includes(query)
      );
    }

    setFilteredVouchers(filtered);
  }

  const stats = {
    total: vouchers.length,
    draft: vouchers.filter((v) => v.status === CheckVoucherStatus.DRAFT).length,
    verified: vouchers.filter((v) => v.status === CheckVoucherStatus.VERIFIED).length,
    approved: vouchers.filter((v) => v.status === CheckVoucherStatus.APPROVED).length,
    issued: vouchers.filter((v) => v.status === CheckVoucherStatus.CHECK_ISSUED).length,
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900">
        <Sidebar currentView="payments" isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900">
            <div className="p-6 sm:p-8 space-y-8">
              <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Check Vouchers
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                View and manage check vouchers generated from approved payment requests
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/payments')}>
              Back to Payments
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">{stats.draft}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Draft</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.verified}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Verified</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.issued}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Issued</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by CV number or payee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Status Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {statusTabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setSelectedStatus(tab.value)}
                className={`
                  whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                  ${
                    selectedStatus === tab.value
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400'
                  }
                `}
              >
                {tab.label}
                <span className="ml-2 rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs">
                  {tab.value ? vouchers.filter((v) => v.status === tab.value).length : vouchers.length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-center text-red-600 dark:text-red-400">
              <p>{error}</p>
              <Button onClick={loadVouchers} className="mt-4">Try Again</Button>
            </CardContent>
          </Card>
        ) : filteredVouchers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No check vouchers found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Check vouchers are generated from approved payment requests
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    CV Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    RFP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredVouchers.map((voucher) => (
                  <tr
                    key={voucher.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => router.push(`/payments/vouchers/${voucher.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {voucher.cvNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {voucher.requisitionForPayment?.rfpNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {voucher.requisitionForPayment?.payee || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {voucher.requisitionForPayment?.currency || 'PHP'} {voucher.requisitionForPayment?.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={voucher.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {voucher.createdAt ? format(parseISO(voucher.createdAt), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/payments/vouchers/${voucher.id}`);
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
