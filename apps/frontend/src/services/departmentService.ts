import api from '../lib/api';
import { Department } from '@docflows/shared';

/**
 * Get all departments
 */
export async function getDepartments(): Promise<Department[]> {
  const response = await api.get('/departments');
  return response.data;
}

/**
 * Get a single department by ID
 */
export async function getDepartment(id: string): Promise<Department> {
  const response = await api.get(`/departments/${id}`);
  return response.data;
}
