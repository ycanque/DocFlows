'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Department, CostCenter } from '@docflows/shared';
import ProtectedRoute from '@/components/ProtectedRoute';
import { createRequisition, CreateRequisitionDto } from '@/services/requisitionService';
import { getDepartments } from '@/services/departmentService';
import { getCostCenters } from '@/services/costCenterService';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

interface RequisitionItem {
  quantity: number;
  unit: string;
  particulars: string;
  estimatedCost?: number;
}

export default function CreateRequisitionPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [formData, setFormData] = useState({
    departmentId: '',
    costCenterId: '',
    currency: 'PHP',
    dateRequested: new Date().toISOString().split('T')[0],
    dateNeeded: new Date().toISOString().split('T')[0],
    purpose: '',
  });
  const [items, setItems] = useState<RequisitionItem[]>([
    { quantity: 1, unit: '', particulars: '', estimatedCost: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingCostCenters, setLoadingCostCenters] = useState(true);

  useEffect(() => {
    loadDepartments();
    loadCostCenters();
  }, []);

  async function loadDepartments() {
    try {
      setLoadingDepartments(true);
      const data = await getDepartments();
      setDepartments(data);
      
      // Set default department to user's department if available
      if (user?.departmentId) {
        setFormData((prev) => ({ ...prev, departmentId: user.departmentId! }));
      }
    } catch (err) {
      console.error('Error loading departments:', err);
    } finally {
      setLoadingDepartments(false);
    }
  }

  async function loadCostCenters() {
    try {
      setLoadingCostCenters(true);
      const data = await getCostCenters();
      setCostCenters(data);
    } catch (err) {
      console.error('Error loading cost centers:', err);
    } finally {
      setLoadingCostCenters(false);
    }
  }

  function handleAddItem() {
    setItems([...items, { quantity: 1, unit: '', particulars: '', estimatedCost: 0 }]);
  }

  function handleRemoveItem(index: number) {
    if (items.length === 1) {
      alert('At least one item is required');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  }

  function handleItemChange(index: number, field: keyof RequisitionItem, value: any) {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  }

  function validateForm(): boolean {
    if (!formData.departmentId) {
      setError('Please select a department');
      return false;
    }
    if (!formData.dateRequested) {
      setError('Please select a date requested');
      return false;
    }
    if (!formData.dateNeeded) {
      setError('Please select a date needed');
      return false;
    }
    if (!formData.purpose.trim()) {
      setError('Please enter the purpose');
      return false;
    }
    if (items.length === 0) {
      setError('Please add at least one item');
      return false;
    }
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.quantity <= 0) {
        setError(`Item ${i + 1}: Quantity must be greater than 0`);
        return false;
      }
      if (!item.unit.trim()) {
        setError(`Item ${i + 1}: Unit is required`);
        return false;
      }
      if (!item.particulars.trim()) {
        setError(`Item ${i + 1}: Particulars is required`);
        return false;
      }
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const dto: CreateRequisitionDto = {
        departmentId: formData.departmentId,
        costCenterId: formData.costCenterId || undefined,
        currency: formData.currency,
        dateRequested: formData.dateRequested,
        dateNeeded: formData.dateNeeded,
        purpose: formData.purpose,
        items: items.map((item) => ({
          quantity: item.quantity,
          unit: item.unit,
          particulars: item.particulars,
          estimatedCost: item.estimatedCost || undefined,
        })),
      };

      const newRequisition = await createRequisition(dto);
      router.push(`/requisitions/${newRequisition.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create requisition');
      console.error('Error creating requisition:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/requisitions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Requisition
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Fill in the details to create a new requisition slip
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                {loadingDepartments ? (
                  <div className="text-sm text-gray-500">Loading departments...</div>
                ) : (
                  <select
                    value={formData.departmentId}
                    onChange={(e) =>
                      setFormData({ ...formData, departmentId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Requested <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dateRequested}
                  onChange={(e) =>
                    setFormData({ ...formData, dateRequested: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Needed <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dateNeeded}
                  onChange={(e) =>
                    setFormData({ ...formData, dateNeeded: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="PHP">₱ - Philippine Peso (PHP)</option>
                  <option value="USD">$ - US Dollar (USD)</option>
                  <option value="EUR">€ - Euro (EUR)</option>
                  <option value="JPY">¥ - Japanese Yen (JPY)</option>
                  <option value="GBP">£ - British Pound (GBP)</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select currency for this transaction (default: PHP)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cost Center <span className="text-red-500">*</span>
                </label>
                {loadingCostCenters ? (
                  <div className="text-sm text-gray-500">Loading cost centers...</div>
                ) : (
                  <select
                    value={formData.costCenterId}
                    onChange={(e) =>
                      setFormData({ ...formData, costCenterId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Cost Center</option>
                    {costCenters.map((cc) => (
                      <option key={cc.id} value={cc.id}>
                        {cc.code} - {cc.name} ({cc.type === 'BUSINESS_UNIT' ? 'Business Unit' : cc.type === 'PROJECT' ? 'Project' : 'Division'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter the purpose of this requisition..."
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requisition Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Requisition Items</CardTitle>
              <Button type="button" onClick={handleAddItem} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)
                      }
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="pcs, box, etc."
                      required
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Particulars <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.particulars}
                      onChange={(e) =>
                        handleItemChange(index, 'particulars', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Item description"
                      required
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estimated Cost
                    </label>
                    <input
                      type="number"
                      value={item.estimatedCost || ''}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          'estimatedCost',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="md:col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-end">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-6 py-3">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Estimated Cost:
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ₱
                      {items
                        .reduce((sum, item) => sum + (item.estimatedCost || 0), 0)
                        .toLocaleString('en-PH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/requisitions')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Requisition'}
          </Button>
        </div>
      </form>
    </div>
    </ProtectedRoute>
  );
}
