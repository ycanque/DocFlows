import api from '../lib/api';
import { CostCenter } from '@docflows/shared';

/**
 * Get all active cost centers
 */
export async function getCostCenters(): Promise<CostCenter[]> {
  const response = await api.get('/cost-centers');
  return response.data;
}

/**
 * Get a single cost center by ID
 */
export async function getCostCenter(id: string): Promise<CostCenter> {
  const response = await api.get(`/cost-centers/${id}`);
  return response.data;
}
