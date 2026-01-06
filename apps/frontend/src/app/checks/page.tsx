'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { Check, CheckStatus } from '@docflows/shared';
import { getChecks } from '@/services/checkService';
import { CreditCard, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/requisitions/StatusBadge';
import ProtectedRoute from '@/components/ProtectedRoute';
import { format, parseISO } from 'date-fns';

const statusTabs = [
  { label: 'All', value: null },
  { label: 'Issued', value: CheckStatus.ISSUED },
  { label: 'Disbursed', value: CheckStatus.DISBURSED },
  { label: 'Voided', value: CheckStatus.VOIDED },
  { label: 'Cancelled', value: CheckStatus.CANCELLED },
];

export default function ChecksPage() {
  const router = useRouter();
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
    } catch (err) {
      const axiosError = err as AxiosError<{message?: string}>;
      setError(axiosError?.response?.data?.message || 'Failed to load checks');
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
          check.bankAccount?.accountNumber?.toLowerCase().includes(query) ||
          check.payee?.toLowerCase().includes(query)
      );
    }

    setFilteredChecks(filtered);
  }

  const stats = {
    total: checks.length,
    issued: checks.filter((c) => c.status === CheckStatus.ISSUED).length,
    cleared: checks.filter((c) => c.status === CheckStatus.DISBURSED).length,
    voided: checks.filter((c) => c.status === CheckStatus.VOIDED).length,
  };

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
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search by check number, payee, or CV number..."
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
                        {searchQuery || selectedStatus
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
