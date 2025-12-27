'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, CheckStatus } from '@docflows/shared';
import { getChecks } from '@/services/checkService';
import { CreditCard, Search } from 'lucide-react';
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
  { label: 'Issued', value: CheckStatus.ISSUED },
  { label: 'Cleared', value: CheckStatus.CLEARED },
  { label: 'Voided', value: CheckStatus.VOIDED },
  { label: 'Cancelled', value: CheckStatus.CANCELLED },
];

export default function ChecksListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [checks, setChecks] = useState<Check[]>([]);
  const [filteredChecks, setFilteredChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CheckStatus | null>(null);

  useEffect(() => {
    loadChecks();
  }, []);

  useEffect(() => {
    filterChecks();
  }, [checks, searchQuery, selectedStatus]);

  async function loadChecks() {
    try {
      setLoading(true);
      setError(null);
      const data = await getChecks();
      setChecks(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load checks');
      console.error('Error loading checks:', err);
    } finally {
      setLoading(false);
    }
  }

  function filterChecks() {
    let filtered = [...checks];

    if (selectedStatus) {
      filtered = filtered.filter((check) => check.status === selectedStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (check) =>
          check.checkNumber?.toLowerCase().includes(query) ||
          check.checkVoucher?.cvNumber?.toLowerCase().includes(query) ||
          check.bankAccount?.accountNumber?.toLowerCase().includes(query)
      );
    }

    setFilteredChecks(filtered);
  }

  const stats = {
    total: checks.length,
    issued: checks.filter((c) => c.status === CheckStatus.ISSUED).length,
    cleared: checks.filter((c) => c.status === CheckStatus.CLEARED).length,
    voided: checks.filter((c) => c.status === CheckStatus.VOIDED).length,
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
                Checks
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                View and manage issued checks
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/payments')}>
              Back to Payments
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.issued}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Issued</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.cleared}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Cleared</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.voided}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Voided</div>
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
                placeholder="Search by check number, CV number, or account..."
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
                  {tab.value ? checks.filter((c) => c.status === tab.value).length : checks.length}
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
              <Button onClick={loadChecks} className="mt-4">Try Again</Button>
            </CardContent>
          </Card>
        ) : filteredChecks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No checks found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Checks are issued from approved check vouchers
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Check Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    CV Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Bank Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Disbursement Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredChecks.map((check) => (
                  <tr
                    key={check.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => router.push(`/payments/checks/${check.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {check.checkNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {check.checkVoucher?.cvNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {check.bankAccount?.accountNumber || 'N/A'} - {check.bankAccount?.bankName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={check.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {check.checkDate ? format(parseISO(check.checkDate), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {check.disbursementDate ? format(parseISO(check.disbursementDate), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/payments/checks/${check.id}`);
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
