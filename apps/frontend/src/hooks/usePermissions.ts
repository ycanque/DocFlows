"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/userService";
import type { Permission } from "@docflows/shared";

interface UsePermissionsReturn {
  permissions: string[];
  loading: boolean;
  error: string | null;
  hasPermission: (permission: Permission | string) => boolean;
  hasAnyPermission: (...permissions: (Permission | string)[]) => boolean;
  hasAllPermissions: (...permissions: (Permission | string)[]) => boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing user permissions
 * Fetches permissions from the API and provides helper functions
 */
export function usePermissions(): UsePermissionsReturn {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!isAuthenticated) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await userService.getMyPermissions();
      setPermissions(response.permissions);
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
      setError("Failed to load permissions");
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions, user?.id]);

  const hasPermission = useCallback(
    (permission: Permission | string): boolean => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (...perms: (Permission | string)[]): boolean => {
      return perms.some((p) => permissions.includes(p));
    },
    [permissions]
  );

  const hasAllPermissions = useCallback(
    (...perms: (Permission | string)[]): boolean => {
      return perms.every((p) => permissions.includes(p));
    },
    [permissions]
  );

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refetch: fetchPermissions,
  };
}

export default usePermissions;
