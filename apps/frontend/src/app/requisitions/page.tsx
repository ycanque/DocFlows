'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RequisitionSlip, RequisitionStatus } from '@docflows/shared';
import { getRequisitions } from '@/services/requisitionService';
import { FileText, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/requisitions/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const statusTabs = [
  { label: 'All', value: null },
  { label: 'Draft', value: RequisitionStatus.DRAFT },
  { label: 'Pending', value: RequisitionStatus.PENDING_APPROVAL },
  { label: 'Approved', value: RequisitionStatus.APPROVED },
  { label: 'Rejected', value: RequisitionStatus.REJECTED },
];

export default function RequisitionsListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [requisitions, setRequisitions] = useState<RequisitionSlip[]>([]);
  const [filteredRequisitions, setFilteredRequisitions] = useState<RequisitionSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<RequisitionStatus | null>(null);

  useEffect(() => {
    loadRequisitions();
  }, []);

  useEffect(() => {
    filterRequisitions();
  }, [requisitions, searchQuery, selectedStatus]);

  async function loadRequisitions() {
    try {
      setLoading(true);
      setError(null);
      const data = await getRequisitions();
      setRequisitions(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load requisitions');
      console.error('Error loading requisitions:', err);
    } finally {
      setLoading(false);
    }
  }

  function filterRequisitions() {
    let filtered = [...requisitions];

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter((req) => req.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.requisitionNumber.toLowerCase().includes(query) ||
          req.purpose.toLowerCase().includes(query) ||
          req.requester?.firstName.toLowerCase().includes(query) ||
          req.requester?.lastName.toLowerCase().includes(query)
      );
    }

    setFilteredRequisitions(filtered);
  }

  function handleRowClick(id: string) {
    router.push(`/requisitions/${id}`);
  }

  function handleCreateNew() {
    router.push('/requisitions/create');
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Requisitions</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage requisition slips and track approvals
          </p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Requisition
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 mb-4">
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
                  {requisitions.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-zinc-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {requisitions.filter((r) => r.status === RequisitionStatus.PENDING_APPROVAL).length}
                </p>
              </div>
              <Filter className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Approved</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {requisitions.filter((r) => r.status === RequisitionStatus.APPROVED).length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Draft</p>
                <p className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">
                  {requisitions.filter((r) => r.status === RequisitionStatus.DRAFT).length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-zinc-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by number, purpose, or requester..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {/* Status Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto">
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

      {/* Requisitions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Requisition #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Requester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Date Needed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Items
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-950 divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredRequisitions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery || selectedStatus
                      ? 'No requisitions found matching your criteria'
                      : 'No requisitions yet. Create your first one!'}
                  </td>
                </tr>
              ) : (
                filteredRequisitions.map((requisition) => (
                  <tr
                    key={requisition.id}
                    onClick={() => handleRowClick(requisition.id)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                      {requisition.requisitionNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {requisition.requester
                        ? `${requisition.requester.firstName} ${requisition.requester.lastName}`
                        : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {requisition.department?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      {requisition.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {new Date(requisition.dateNeeded).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={requisition.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {requisition.items?.length || 0}
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
