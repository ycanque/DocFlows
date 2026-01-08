'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Users, Shield, Key, Palette } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { Permissions } from '@docflows/shared';
import UserManagement from './UserManagement';
import RoleManagement from './RoleManagement';
import PermissionManagement from './PermissionManagement';

export default function SettingsContent() {
  const { theme, setTheme } = useTheme();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const [activeTab, setActiveTab] = useState('appearance');

  const canManageUsers = hasPermission(Permissions.USERS_READ_ALL);
  const canViewRoles = hasPermission(Permissions.ROLES_READ);

  const themeOptions = [
    {
      value: 'light' as const,
      label: 'Light',
      description: 'Use light theme',
      icon: Sun,
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      description: 'Use dark theme',
      icon: Moon,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Manage your application preferences and configuration
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          {canManageUsers && (
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
          )}
          {canViewRoles && (
            <TabsTrigger value="roles" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Roles</span>
            </TabsTrigger>
          )}
          {canViewRoles && (
            <TabsTrigger value="permissions" className="gap-2">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">Permissions</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Theme
                </label>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  Select your preferred color scheme
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = theme === option.value;
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={`flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-colors ${
                          isSelected
                            ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-900'
                            : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                        }`}
                        aria-pressed={isSelected}
                      >
                        <div
                          className={`rounded-lg p-2 ${
                            isSelected
                              ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900'
                              : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                          }`}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                            {option.label}
                          </p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {option.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-50">
                            <div className="h-2 w-2 rounded-full bg-zinc-50 dark:bg-zinc-900" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application Information</CardTitle>
              <CardDescription>
                Details about the Document Flow system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Version</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Environment</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">Development</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">API Status</span>
                <span className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  Connected
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        {canManageUsers && (
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        )}

        {/* Roles Tab */}
        {canViewRoles && (
          <TabsContent value="roles">
            <RoleManagement />
          </TabsContent>
        )}

        {/* Permissions Tab */}
        {canViewRoles && (
          <TabsContent value="permissions">
            <PermissionManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
