import api from "@/lib/api";
import type { User, UserRole } from "@docflows/shared";

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  departmentId?: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  departmentId?: string;
  isActive?: boolean;
}

export interface RoleInfo {
  value: UserRole;
  label: string;
  description: string;
  level: number;
  permissions: string[];
}

export interface PermissionCategory {
  label: string;
  permissions: string[];
}

export interface UserPermissionsResponse {
  permissions: string[];
  role: UserRole;
}

class UserService {
  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    const response = await api.get<User[]>("/users");
    return response.data;
  }

  /**
   * Get current user profile
   */
  async getMe(): Promise<User> {
    const response = await api.get<User>("/users/me");
    return response.data;
  }

  /**
   * Get permissions for current user
   */
  async getMyPermissions(): Promise<UserPermissionsResponse> {
    const response = await api.get<UserPermissionsResponse>(
      "/users/me/permissions"
    );
    return response.data;
  }

  /**
   * Get users by department
   */
  async getByDepartment(departmentId: string): Promise<User[]> {
    const response = await api.get<User[]>(`/users/department/${departmentId}`);
    return response.data;
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  }

  /**
   * Create a new user
   */
  async create(data: CreateUserData): Promise<User> {
    const response = await api.post<User>("/users", data);
    return response.data;
  }

  /**
   * Update a user
   */
  async update(id: string, data: UpdateUserData): Promise<User> {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  }

  /**
   * Change user role
   */
  async changeRole(id: string, role: UserRole): Promise<User> {
    const response = await api.patch<User>(`/users/${id}/role`, { role });
    return response.data;
  }

  /**
   * Deactivate a user
   */
  async deactivate(id: string): Promise<User> {
    const response = await api.patch<User>(`/users/${id}/deactivate`);
    return response.data;
  }

  /**
   * Reactivate a user
   */
  async reactivate(id: string): Promise<User> {
    const response = await api.patch<User>(`/users/${id}/reactivate`);
    return response.data;
  }

  /**
   * Reset user password
   */
  async resetPassword(id: string, password: string): Promise<User> {
    const response = await api.patch<User>(`/users/${id}/reset-password`, {
      password,
    });
    return response.data;
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<User> {
    const response = await api.delete<User>(`/users/${id}`);
    return response.data;
  }

  /**
   * Get all roles with their info
   */
  async getRoles(): Promise<RoleInfo[]> {
    const response = await api.get<RoleInfo[]>("/users/rbac/roles");
    return response.data;
  }

  /**
   * Get all permissions
   */
  async getPermissions(): Promise<string[]> {
    const response = await api.get<string[]>("/users/rbac/permissions");
    return response.data;
  }

  /**
   * Get permissions grouped by category
   */
  async getPermissionCategories(): Promise<Record<string, PermissionCategory>> {
    const response = await api.get<Record<string, PermissionCategory>>(
      "/users/rbac/permissions/categories"
    );
    return response.data;
  }
}

export const userService = new UserService();
export default userService;
