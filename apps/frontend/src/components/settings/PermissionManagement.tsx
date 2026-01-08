'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Shield,
  Users,
  FileText,
  DollarSign,
  CheckSquare,
  CreditCard,
  Building2,
  Loader2,
  Search,
  Key,
  Settings,
  BarChart3,
  FolderArchive,
  Package,
  Plane,
  Banknote,
  ClipboardList,
  LayoutDashboard,
  Database,
} from 'lucide-react';
import { userService, type PermissionCategory } from '@/services/userService';
import { toast } from 'sonner';

// Permission category icons
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  requisitions: FileText,
  payments: DollarSign,
  vouchers: CheckSquare,
  checks: CreditCard,
  users: Users,
  roles: Shield,
  departments: Building2,
  bankAccounts: Banknote,
  documents: FolderArchive,
  reports: BarChart3,
  system: Database,
  approvals: ClipboardList,
  audit: Key,
  adjustments: Settings,
  materials: Package,
  personnel: Users,
  tickets: Plane,
  advances: Banknote,
  dashboard: LayoutDashboard,
  settings: Settings,
};

// Permission category descriptions
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  requisitions: 'Manage requisition slips and their approval workflow',
  payments: 'Handle payment requests and disbursement processes',
  vouchers: 'Create and manage check vouchers',
  checks: 'Issue, disburse, and manage checks',
  users: 'User account management and access control',
  roles: 'View and manage system roles',
  departments: 'Department configuration and management',
  bankAccounts: 'Bank account setup and management',
  documents: 'File uploads and document management',
  reports: 'Generate and view system reports',
  system: 'System configuration and maintenance',
  approvals: 'Approval workflow and records',
  audit: 'Audit logs and activity tracking',
  adjustments: 'Adjustment requests processing',
  materials: 'Material issuance tracking',
  personnel: 'Personnel request management',
  tickets: 'Plane ticket requests and booking',
  advances: 'Cash advance agreements and tracking',
  dashboard: 'Dashboard view access',
  settings: 'Application settings access',
};

export default function PermissionManagement() {
  const [categories, setCategories] = useState<Record<string, PermissionCategory>>({});
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesData, permissionsData] = await Promise.all([
          userService.getPermissionCategories(),
          userService.getPermissions(),
        ]);
        setCategories(categoriesData);
        setAllPermissions(permissionsData);
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
        toast.error('Failed to load permissions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatPermissionName = (permission: string): string => {
    const parts = permission.split(':');
    if (parts.length >= 2) {
      const action = parts[1].replace(/-/g, ' ');
      const scope = parts[2] || '';
      return `${action.charAt(0).toUpperCase() + action.slice(1)}${scope ? ` (${scope})` : ''}`;
    }
    return permission;
  };

  const getScopeColor = (permission: string): string => {
    if (permission.includes(':own')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
    if (permission.includes(':department')) {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    }
    if (permission.includes(':all')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200';
  };

  const filterPermissions = (permissions: string[]): string[] => {
    if (!searchQuery) return permissions;
    const query = searchQuery.toLowerCase();
    return permissions.filter((p) => p.toLowerCase().includes(query));
  };

  const filteredCategories = Object.entries(categories).filter(([key, cat]) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      key.toLowerCase().includes(query) ||
      cat.label.toLowerCase().includes(query) ||
      cat.permissions.some((p) => p.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Management</CardTitle>
          <CardDescription>
            View all system permissions organized by category. Permissions follow the format{' '}
            <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">
              module:action:scope
            </code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 mb-1">
                <Key className="h-4 w-4" />
                <span className="text-sm">Total Permissions</span>
              </div>
              <p className="text-2xl font-bold">{allPermissions.length}</p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 mb-1">
                <FolderArchive className="h-4 w-4" />
                <span className="text-sm">Categories</span>
              </div>
              <p className="text-2xl font-bold">{Object.keys(categories).length}</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Own Scope</span>
              </div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {allPermissions.filter((p) => p.includes(':own')).length}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                <Shield className="h-4 w-4" />
                <span className="text-sm">All Scope</span>
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {allPermissions.filter((p) => p.includes(':all')).length}
              </p>
            </div>
          </div>

          {/* Scope Legend */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
            <div className="text-sm font-medium">Permission Scopes:</div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                :own
              </Badge>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                User&apos;s own records only
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                :department
              </Badge>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Department-scoped access
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                :all
              </Badge>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Full access to all records
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                placeholder="Search permissions..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Permissions by Category */}
          <Accordion type="multiple" className="w-full">
            {filteredCategories.map(([key, category]) => {
              const Icon = CATEGORY_ICONS[key] || Shield;
              const description = CATEGORY_DESCRIPTIONS[key] || '';
              const filteredPerms = filterPermissions(category.permissions);

              if (searchQuery && filteredPerms.length === 0) return null;

              return (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        <Icon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{category.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            {filteredPerms.length} permissions
                          </Badge>
                        </div>
                        {description && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-normal">
                            {description}
                          </p>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4 pl-14">
                      <div className="grid gap-2">
                        {filteredPerms.map((permission) => (
                          <div
                            key={permission}
                            className="flex items-center justify-between p-3 bg-white dark:bg-zinc-950 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded font-mono">
                                {permission}
                              </code>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                {formatPermissionName(permission)}
                              </span>
                              <Badge className={getScopeColor(permission)}>
                                {permission.includes(':own')
                                  ? 'Own'
                                  : permission.includes(':department')
                                  ? 'Department'
                                  : permission.includes(':all')
                                  ? 'All'
                                  : 'Global'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Permission Format Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Format Reference</CardTitle>
          <CardDescription>
            Understanding how permissions are structured in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
              <h4 className="font-medium mb-2">Permission String Format</h4>
              <code className="text-sm bg-zinc-200 dark:bg-zinc-800 px-3 py-2 rounded block">
                module:action:scope
              </code>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-blue-600 dark:text-blue-400 min-w-[70px]">
                    module
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    The feature area (requisitions, payments, users, etc.)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-green-600 dark:text-green-400 min-w-[70px]">
                    action
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    The operation (create, read, update, delete, approve, etc.)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium text-orange-600 dark:text-orange-400 min-w-[70px]">
                    scope
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    The access level (own, department, all) - optional for global permissions
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
              <h4 className="font-medium mb-2">Examples</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <code className="bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">
                    requisitions:create:own
                  </code>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    → Can create their own requisitions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">
                    payments:approve:department
                  </code>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    → Can approve payments in their department
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">
                    users:read:all
                  </code>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    → Can view all users in the system
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">
                    system:config
                  </code>
                  <span className="text-zinc-600 dark:text-zinc-400">
                    → Global permission for system configuration
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
