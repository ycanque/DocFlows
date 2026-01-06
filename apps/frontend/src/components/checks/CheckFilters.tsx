'use client';

import { useState, useMemo } from 'react';
import { CheckStatus } from '@docflows/shared';
import { Search, SlidersHorizontal, X, Calendar, DollarSign, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export interface CheckFiltersState {
  searchQuery: string;
  status: CheckStatus | null;
  checkDateFrom: string | null;
  checkDateTo: string | null;
  createdFrom: string | null;
  createdTo: string | null;
  amountMin: string | null;
  amountMax: string | null;
  sortBy: 'checkNumber' | 'payee' | 'amount' | 'checkDate' | 'createdAt' | 'status';
  sortOrder: 'asc' | 'desc';
}

function getStatusLabel(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

const sortOptions = [
  { label: 'Check Number', value: 'checkNumber' },
  { label: 'Payee', value: 'payee' },
  { label: 'Amount', value: 'amount' },
  { label: 'Check Date', value: 'checkDate' },
  { label: 'Created Date', value: 'createdAt' },
  { label: 'Status', value: 'status' },
];

interface CheckFiltersProps {
  filters: CheckFiltersState;
  onFiltersChange: (filters: CheckFiltersState) => void;
}

export default function CheckFilters({
  filters,
  onFiltersChange,
}: CheckFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof CheckFiltersState, value: unknown) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
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
    setShowAdvanced(false);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.status) count++;
    if (filters.checkDateFrom || filters.checkDateTo) count++;
    if (filters.createdFrom || filters.createdTo) count++;
    if (filters.amountMin || filters.amountMax) count++;
    return count;
  };

  // Generate status options dynamically from enum
  const statusOptions = useMemo(() => {
    const options = [{ label: 'All Statuses', value: null as CheckStatus | null }];
    Object.values(CheckStatus).forEach((status) => {
      options.push({
        label: getStatusLabel(status),
        value: status as CheckStatus,
      });
    });
    return options;
  }, []);

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Main Filter Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by check number, payee, or CV number..."
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => updateFilter('status', value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.label} value={option.value || 'all'}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="relative"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <Button variant="ghost" onClick={clearFilters} size="icon">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            {/* Sorting Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort By
                </label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilter('sortBy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">&nbsp;</label>
                <Button
                  variant="outline"
                  onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="h-10"
                >
                  {filters.sortOrder === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
                </Button>
              </div>
            </div>

            {/* Amount Range Section */}
            <div>
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Amount Range
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Min</label>
                  <input
                    type="number"
                    step="0.01"
                    value={filters.amountMin || ''}
                    onChange={(e) => updateFilter('amountMin', e.target.value || null)}
                    placeholder="Minimum"
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Max</label>
                  <input
                    type="number"
                    step="0.01"
                    value={filters.amountMax || ''}
                    onChange={(e) => updateFilter('amountMax', e.target.value || null)}
                    placeholder="Maximum"
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Check Date Range Section */}
            <div>
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Check Date
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">From</label>
                  <input
                    type="date"
                    value={filters.checkDateFrom || ''}
                    onChange={(e) => updateFilter('checkDateFrom', e.target.value || null)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">To</label>
                  <input
                    type="date"
                    value={filters.checkDateTo || ''}
                    onChange={(e) => updateFilter('checkDateTo', e.target.value || null)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Created Date Range Section */}
            <div>
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created Date
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">From</label>
                  <input
                    type="date"
                    value={filters.createdFrom || ''}
                    onChange={(e) => updateFilter('createdFrom', e.target.value || null)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">To</label>
                  <input
                    type="date"
                    value={filters.createdTo || ''}
                    onChange={(e) => updateFilter('createdTo', e.target.value || null)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
            {filters.searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {filters.searchQuery}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter('searchQuery', '')}
                />
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="gap-1">
                Status: {statusOptions.find(s => s.value === filters.status)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter('status', null)}
                />
              </Badge>
            )}
            {(filters.amountMin || filters.amountMax) && (
              <Badge variant="secondary" className="gap-1">
                Amount: {filters.amountMin || '...'} - {filters.amountMax || '...'}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    updateFilter('amountMin', null);
                    updateFilter('amountMax', null);
                  }}
                />
              </Badge>
            )}
            {(filters.checkDateFrom || filters.checkDateTo) && (
              <Badge variant="secondary" className="gap-1">
                Check Date: {filters.checkDateFrom || '...'} - {filters.checkDateTo || '...'}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    updateFilter('checkDateFrom', null);
                    updateFilter('checkDateTo', null);
                  }}
                />
              </Badge>
            )}
            {(filters.createdFrom || filters.createdTo) && (
              <Badge variant="secondary" className="gap-1">
                Created: {filters.createdFrom || '...'} - {filters.createdTo || '...'}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    updateFilter('createdFrom', null);
                    updateFilter('createdTo', null);
                  }}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
