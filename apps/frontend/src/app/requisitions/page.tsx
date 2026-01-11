'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AxiosError } from 'axios';
import { RequisitionSlip, RequisitionStatus, Department, RequisitionType, REQUISITION_TYPE_LABELS } from '@docflows/shared';
import { getRequisitions } from '@/services/requisitionService';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/requisitions/StatusBadge';
import RichTextDisplay from '@/components/RichTextDisplay';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import RequisitionFilters, { RequisitionFiltersState } from '@/components/requisitions/RequisitionFilters';

function RequisitionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [requisitions, setRequisitions] = useState<RequisitionSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RequisitionFiltersState>(() => {
    const statusParam = searchParams.get('status');
    return {
      searchQuery: '',
      status: statusParam === 'PENDING_APPROVAL' ? RequisitionStatus.PENDING_APPROVAL : null,
      departmentId: null,
      dateNeededFrom: null,
      dateNeededTo: null,
      createdFrom: null,
      createdTo: null,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
  });

  useEffect(() => {
    loadRequisitions();
  }, []);

  async function loadRequisitions() {
    try {
      setLoading(true);
      setError(null);
      const data = await getRequisitions();
      setRequisitions(data);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{message?: string}>;
      setError(axiosError?.response?.data?.message || 'Failed to load requisitions');
      console.error('Error loading requisitions:', err);
    } finally {
      setLoading(false);
    }
  }

  // Extract unique departments and requesters from requisitions
  const departments = useMemo(() => {
    const deptMap = new Map<string, Department>();
    requisitions.forEach(req => {
      if (req.department) {
        deptMap.set(req.department.id, req.department);
      }
    });
    return Array.from(deptMap.values());
  }, [requisitions]);

// Apply filters and sorting
  const filteredRequisitions = useMemo(() => {
    let filtered = [...requisitions];

    // Filter by search query
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.requisitionNumber.toLowerCase().includes(query) ||
          req.purpose.toLowerCase().includes(query) ||
          req.requester?.firstName.toLowerCase().includes(query) ||
          req.requester?.lastName.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((req) => req.status === filters.status);
    }

    // Filter by department
    if (filters.departmentId) {
      filtered = filtered.filter((req) => req.department?.id === filters.departmentId);
    }

    // Filter by date needed range
    if (filters.dateNeededFrom) {
      filtered = filtered.filter((req) => new Date(req.dateNeeded) >= new Date(filters.dateNeededFrom!));
    }
    if (filters.dateNeededTo) {
      filtered = filtered.filter((req) => new Date(req.dateNeeded) <= new Date(filters.dateNeededTo!));
    }

    // Filter by created date range
    if (filters.createdFrom) {
      filtered = filtered.filter((req) => new Date(req.createdAt) >= new Date(filters.createdFrom!));
    }
    if (filters.createdTo) {
      filtered = filtered.filter((req) => new Date(req.createdAt) <= new Date(filters.createdTo!));
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'number':
          comparison = a.requisitionNumber.localeCompare(b.requisitionNumber);
          break;
        case 'dateNeeded':
          comparison = new Date(a.dateNeeded).getTime() - new Date(b.dateNeeded).getTime();
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
  }, [requisitions, filters]);

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
              <FileText className="h-8 w-8 text-yellow-400" />
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
      <RequisitionFilters
        filters={filters}
        onFiltersChange={setFilters}
        departments={departments}
      />

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
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Process Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Requester
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
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    {filters.searchQuery || filters.status || filters.departmentId || 
                     filters.dateNeededFrom || filters.dateNeededTo || filters.createdFrom || filters.createdTo
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {requisition.type ? (
                        <Badge variant="outline" className="text-xs">
                          {REQUISITION_TYPE_LABELS[requisition.type]}
                        </Badge>
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {requisition.receivingDepartment?.name || <span className="text-zinc-400">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {requisition.requester
                        ? `${requisition.requester.firstName} ${requisition.requester.lastName}`
                        : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs">
                      <div className="truncate">
                        <RichTextDisplay content={requisition.purpose} singleLine={true} className="truncate" />
                      </div>
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

export default function RequisitionsListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-zinc-500 dark:text-zinc-400">Loading...</div>
          </div>
        </div>
      </div>
    }>
      <RequisitionsContent />
    </Suspense>
  );
}
