'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  ChevronRight,
} from 'lucide-react';
import { userService, type RoleInfo } from '@/services/userService';
import { UserRole } from '@docflows/shared';
import { toast } from 'sonner';

const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.REQUESTER]: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  [UserRole.APPROVER]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [UserRole.FINANCE_STAFF]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [UserRole.ACCOUNTING_HEAD]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  [UserRole.DEPARTMENT_HEAD]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  [UserRole.ADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  [UserRole.SYSTEM_ADMIN]: 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900',
};

const ROLE_ICONS: Record<UserRole, React.ElementType> = {
  [UserRole.REQUESTER]: FileText,
  [UserRole.APPROVER]: CheckSquare,
  [UserRole.FINANCE_STAFF]: DollarSign,
  [UserRole.ACCOUNTING_HEAD]: CreditCard,
  [UserRole.DEPARTMENT_HEAD]: Building2,
  [UserRole.ADMIN]: Users,
  [UserRole.SYSTEM_ADMIN]: Shield,
};

// Permission category icons
const PERMISSION_CATEGORY_ICONS: Record<string, React.ElementType> = {
  requisitions: FileText,
  payments: DollarSign,
  vouchers: CheckSquare,
  checks: CreditCard,
  users: Users,
  roles: Shield,
  departments: Building2,
  default: Shield,
};

export default function RoleManagement() {
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const rolesData = await userService.getRoles();
        setRoles(rolesData);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        toast.error('Failed to load roles');
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const getPermissionCategory = (permission: string): string => {
    const [category] = permission.split(':');
    return category || 'other';
  };

  const groupPermissionsByCategory = (permissions: string[]) => {
    const grouped: Record<string, string[]> = {};
    permissions.forEach((permission) => {
      const category = getPermissionCategory(permission);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });
    return grouped;
  };

  const formatPermissionName = (permission: string): string => {
    const parts = permission.split(':');
    if (parts.length >= 2) {
      const action = parts[1].replace(/-/g, ' ');
      const scope = parts[2] || '';
      return `${action.charAt(0).toUpperCase() + action.slice(1)}${scope ? ` (${scope})` : ''}`;
    }
    return permission;
  };

  const formatCategoryName = (category: string): string => {
    return category
      .replace(/-/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>
            View system roles and their associated permissions. Roles follow a hierarchical
            inheritance model where higher-level roles inherit permissions from lower levels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Role Hierarchy Diagram */}
          <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
            <h3 className="text-sm font-medium mb-3">Role Hierarchy</h3>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge className={ROLE_COLORS[UserRole.REQUESTER]}>Requester</Badge>
              <ChevronRight className="h-4 w-4 text-zinc-400" />
              <Badge className={ROLE_COLORS[UserRole.APPROVER]}>Approver</Badge>
              <ChevronRight className="h-4 w-4 text-zinc-400" />
              <Badge className={ROLE_COLORS[UserRole.FINANCE_STAFF]}>Finance Staff</Badge>
              <ChevronRight className="h-4 w-4 text-zinc-400" />
              <Badge className={ROLE_COLORS[UserRole.ACCOUNTING_HEAD]}>Accounting Head</Badge>
              <ChevronRight className="h-4 w-4 text-zinc-400" />
              <Badge className={ROLE_COLORS[UserRole.ADMIN]}>Admin</Badge>
              <ChevronRight className="h-4 w-4 text-zinc-400" />
              <Badge className={ROLE_COLORS[UserRole.SYSTEM_ADMIN]}>System Admin</Badge>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              * Department Head is a parallel role that inherits from Requester with department-scoped permissions
            </p>
          </div>

          {/* Roles List */}
          <Accordion
            type="single"
            collapsible
            value={expandedRole || undefined}
            onValueChange={(value: string) => setExpandedRole(value)}
          >
            {roles.map((role) => {
              const Icon = ROLE_ICONS[role.value] || Shield;
              const groupedPermissions = groupPermissionsByCategory(role.permissions);

              return (
                <AccordionItem key={role.value} value={role.value}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${ROLE_COLORS[role.value]}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{role.label}</span>
                          <Badge variant="outline" className="text-xs">
                            Level {role.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-normal">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4 pl-14 space-y-4">
                      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <Shield className="h-4 w-4" />
                        <span>{role.permissions.length} permissions</span>
                      </div>

                      {/* Permissions by Category */}
                      <div className="grid gap-4">
                        {Object.entries(groupedPermissions).map(([category, permissions]) => {
                          const CategoryIcon = PERMISSION_CATEGORY_ICONS[category] || PERMISSION_CATEGORY_ICONS.default;
                          
                          return (
                            <div
                              key={category}
                              className="border rounded-lg p-4 bg-white dark:bg-zinc-950"
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <CategoryIcon className="h-4 w-4 text-zinc-500" />
                                <h4 className="font-medium text-sm">
                                  {formatCategoryName(category)}
                                </h4>
                                <Badge variant="secondary" className="text-xs">
                                  {permissions.length}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {permissions.map((permission) => (
                                  <Badge
                                    key={permission}
                                    variant="outline"
                                    className="text-xs font-normal"
                                  >
                                    {formatPermissionName(permission)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Role Capabilities Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Role Capabilities Overview</CardTitle>
          <CardDescription>
            Quick reference for what each role can do
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-center py-3 px-4 font-medium">Create Requests</th>
                  <th className="text-center py-3 px-4 font-medium">Approve</th>
                  <th className="text-center py-3 px-4 font-medium">Finance Ops</th>
                  <th className="text-center py-3 px-4 font-medium">Manage Users</th>
                  <th className="text-center py-3 px-4 font-medium">System Admin</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className={ROLE_COLORS[UserRole.REQUESTER]}>Requester</Badge>
                  </td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className={ROLE_COLORS[UserRole.APPROVER]}>Approver</Badge>
                  </td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className={ROLE_COLORS[UserRole.DEPARTMENT_HEAD]}>Department Head</Badge>
                  </td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅ (Dept)</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className={ROLE_COLORS[UserRole.FINANCE_STAFF]}>Finance Staff</Badge>
                  </td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className={ROLE_COLORS[UserRole.ACCOUNTING_HEAD]}>Accounting Head</Badge>
                  </td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">❌</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className={ROLE_COLORS[UserRole.ADMIN]}>Admin</Badge>
                  </td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">❌</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <Badge className={ROLE_COLORS[UserRole.SYSTEM_ADMIN]}>System Admin</Badge>
                  </td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
