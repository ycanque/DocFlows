'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';

export default function SettingsContent() {
  const { theme, setTheme } = useTheme();

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
    </div>
  );
}
