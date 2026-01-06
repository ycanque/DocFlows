'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AxiosError } from 'axios';
import { Department, CostCenter, RequisitionSlip, RequisitionStatus } from '@docflows/shared';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getRequisition, updateRequisition } from '@/services/requisitionService';
import { getDepartments } from '@/services/departmentService';
import { getCostCenters } from '@/services/costCenterService';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RichTextEditor from '@/components/RichTextEditor';
import { useAuth } from '@/contexts/AuthContext';

// Unit of measure categories
const UNIT_OF_MEASURE = {
  LENGTH: [
    { value: 'm', label: 'Meter (m)' },
    { value: 'cm', label: 'Centimeter (cm)' },
    { value: 'mm', label: 'Millimeter (mm)' },
    { value: 'km', label: 'Kilometer (km)' },
    { value: 'in', label: 'Inch (in)' },
    { value: 'ft', label: 'Foot (ft)' },
  ],
  WEIGHT: [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'mg', label: 'Milligram (mg)' },
    { value: 'lb', label: 'Pound (lb)' },
    { value: 'oz', label: 'Ounce (oz)' },
  ],
  VOLUME: [
    { value: 'L', label: 'Liter (L)' },
    { value: 'mL', label: 'Milliliter (mL)' },
    { value: 'gal', label: 'Gallon (gal)' },
    { value: 'fl oz', label: 'Fluid Ounce (fl oz)' },
  ],
  COUNT: [
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'box', label: 'Box' },
    { value: 'pack', label: 'Pack' },
    { value: 'set', label: 'Set' },
    { value: 'bundle', label: 'Bundle' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'ream', label: 'Ream' },
  ],
  TIME: [
    { value: 'hr', label: 'Hour (hr)' },
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ],
};

function getTodayDateString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface RequisitionItem {
  id?: string;
  quantity: number;
  unit: string;
  particulars: string;
  specification?: string;
  unitCost?: number;
  subtotal?: number;
}

export default function EditRequisitionPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const requisitionId = params?.id as string;

  const [requisition, setRequisition] = useState<RequisitionSlip | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [originalDates, setOriginalDates] = useState<{
    dateRequested: string;
    dateNeeded: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    departmentId: '',
    costCenterId: '',
    currency: 'PHP',
    dateRequested: new Date().toISOString().split('T')[0],
    dateNeeded: new Date().toISOString().split('T')[0],
    purpose: '',
  });
  const [items, setItems] = useState<RequisitionItem[]>([
    { quantity: 1, unit: '', particulars: '', specification: '', unitCost: 0, subtotal: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingRequisition, setLoadingRequisition] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingCostCenters, setLoadingCostCenters] = useState(true);

  useEffect(() => {
    if (requisitionId) {
      loadRequisition();
    }
    loadDepartments();
    loadCostCenters();
  }, [requisitionId]);

  async function loadRequisition() {
    try {
      setLoadingRequisition(true);
      const data = await getRequisition(requisitionId);
      
      // Check if user can edit
      if (data.status !== RequisitionStatus.DRAFT || data.requesterId !== user?.id) {
        setError('You do not have permission to edit this requisition or it is no longer in draft status');
        return;
      }

      setRequisition(data);
      
      // Store original dates to allow them in edit mode
      const dateReq = new Date(data.dateRequested).toISOString().split('T')[0];
      const dateNeed = new Date(data.dateNeeded).toISOString().split('T')[0];
      setOriginalDates({
        dateRequested: dateReq,
        dateNeeded: dateNeed,
      });
      
      // Populate form data
      setFormData({
        departmentId: data.departmentId || '',
        costCenterId: data.costCenterId || '',
        currency: data.currency || 'PHP',
        dateRequested: dateReq,
        dateNeeded: dateNeed,
        purpose: data.purpose || '',
      });

      // Populate items
      if (data.items && data.items.length > 0) {
        setItems(data.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          unit: item.unit,
          particulars: item.particulars,
          specification: item.specification || '',
          unitCost: item.unitCost || 0,
          subtotal: item.subtotal || 0,
        })));
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{message?: string}>;
      setError(axiosError?.response?.data?.message || 'Failed to load requisition');
      console.error('Error loading requisition:', err);
    } finally {
      setLoadingRequisition(false);
    }
  }

  async function loadDepartments() {
    try {
      setLoadingDepartments(true);
      const data = await getDepartments();
      setDepartments(data);
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

  function isItemValid(item: RequisitionItem): boolean {
    return (
      (item.particulars?.trim() ?? '') !== '' &&
      (item.quantity ?? 0) > 0 &&
      (item.unit?.trim() ?? '') !== '' &&
      (item.unitCost ?? 0) > 0
    );
  }

  function areAllItemsValid(): boolean {
    return items.every(isItemValid);
  }

  function handleAddItem() {
    setItems([...items, { quantity: 1, unit: '', particulars: '', specification: '', unitCost: 0, subtotal: 0 }]);
  }

  function handleRemoveItem(index: number) {
    if (items.length === 1) {
      alert('At least one item is required');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  }

  function handleItemChange(index: number, field: keyof RequisitionItem, value: string | number) {
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

      const dto = {
        departmentId: formData.departmentId,
        costCenterId: formData.costCenterId || undefined,
        currency: formData.currency,
        dateRequested: formData.dateRequested,
        dateNeeded: formData.dateNeeded,
        purpose: formData.purpose,
        items: items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          unit: item.unit,
          particulars: item.particulars,
          specification: item.specification || undefined,
          unitCost: item.unitCost || undefined,
          subtotal: item.subtotal || undefined,
        })),
      };

      await updateRequisition(requisitionId, dto);
      router.push(`/requisitions/${requisitionId}`);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{message?: string}>;
      setError(axiosError?.response?.data?.message || 'Failed to update requisition');
      console.error('Error updating requisition:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loadingRequisition) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error && !requisition) {
    return (
      <ProtectedRoute>
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push(`/requisitions/${requisitionId}`)}
            className="w-fit text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requisition
          </Button>
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button 
          variant="ghost" 
          onClick={() => router.push(`/requisitions/${requisitionId}`)}
          className="w-fit text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Requisition
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Edit Requisition
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Update the requisition details
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Row 1: Organization Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  {loadingDepartments ? (
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">Loading departments...</div>
                  ) : (
                    <select
                      value={formData.departmentId}
                      onChange={(e) =>
                        setFormData({ ...formData, departmentId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Cost Center <span className="text-red-500">*</span>
                  </label>
                  {loadingCostCenters ? (
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">Loading cost centers...</div>
                  ) : (
                    <select
                      value={formData.costCenterId}
                      onChange={(e) =>
                        setFormData({ ...formData, costCenterId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent"
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
              </div>

              {/* Row 2: Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Date Requested <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateRequested}
                    onChange={(e) => {
                      const requested = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        dateRequested: requested,
                        // Update dateNeeded if it's before dateRequested
                        dateNeeded: prev.dateNeeded < requested ? requested : prev.dateNeeded,
                      }));
                    }}
                    min={originalDates?.dateRequested || getTodayDateString()}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Today or later (or original date if editing)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Date Needed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateNeeded}
                    onChange={(e) =>
                      setFormData({ ...formData, dateNeeded: e.target.value })
                    }
                    min={formData.dateRequested}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Must be on or after date requested</p>
                </div>
              </div>

              {/* Row 3: Currency and Purpose */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent"
                  required
                >
                  <option value="PHP">₱ - Philippine Peso (PHP)</option>
                  <option value="USD">$ - US Dollar (USD)</option>
                  <option value="EUR">€ - Euro (EUR)</option>
                  <option value="JPY">¥ - Japanese Yen (JPY)</option>
                  <option value="GBP">£ - British Pound (GBP)</option>
                </select>
              </div>

              {/* Row 4: Purpose */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={formData.purpose}
                  onChange={(value) => setFormData({ ...formData, purpose: value })}
                  placeholder="Enter the purpose of this requisition..."
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Describe the purpose and details of this requisition. You can use formatting (bold, italic, lists) to organize your information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requisition Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Requisition Items</CardTitle>
              <Button type="button" onClick={handleAddItem} size="sm" disabled={!areAllItemsValid()}>
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
                  className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-900/50"
                >
                  {/* Header with delete button */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      Item {index + 1}
                    </h3>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>

                  {/* Item Details Section */}
                  <div className="space-y-3 mb-6">
                    <div className="border-b border-zinc-200 dark:border-zinc-700 pb-2 mb-4">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                        Item Details
                      </h4>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Particulars <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.particulars}
                        onChange={(e) =>
                          handleItemChange(index, 'particulars', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent"
                        placeholder="What is this item? (e.g., Office Supplies, Equipment)"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Specification
                      </label>
                      <RichTextEditor
                        value={item.specification || ''}
                        onChange={(value) =>
                          handleItemChange(index, 'specification', value)
                        }
                        placeholder="Additional description or technical details (optional)"
                      />
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Provide additional details such as brand, model, color, size, or technical specifications
                      </p>
                    </div>
                  </div>

                  {/* Quantity & Unit Section */}
                  <div className="space-y-3 mb-6">
                    <div className="border-b border-zinc-200 dark:border-zinc-700 pb-2 mb-4">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                        Quantity & Unit
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={item.quantity || ''}
                          onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].quantity = e.target.valueAsNumber || 0;
                          newItems[index].subtotal = (e.target.valueAsNumber || 0) * (newItems[index].unitCost || 0);
                            setItems(newItems);
                          }}
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent"
                          required
                        />
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Up to 2 decimals</p>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Unit <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent"
                          required
                        >
                          <option value="">-- Select Unit --</option>
                          <optgroup label="Length">
                            {UNIT_OF_MEASURE.LENGTH.map((u) => (
                              <option key={u.value} value={u.value}>
                                {u.label}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Weight">
                            {UNIT_OF_MEASURE.WEIGHT.map((u) => (
                              <option key={u.value} value={u.value}>
                                {u.label}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Volume">
                            {UNIT_OF_MEASURE.VOLUME.map((u) => (
                              <option key={u.value} value={u.value}>
                                {u.label}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Count">
                            {UNIT_OF_MEASURE.COUNT.map((u) => (
                              <option key={u.value} value={u.value}>
                                {u.label}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Time">
                            {UNIT_OF_MEASURE.TIME.map((u) => (
                              <option key={u.value} value={u.value}>
                                {u.label}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Cost Section */}
                  <div className="space-y-3">
                    <div className="border-b border-zinc-200 dark:border-zinc-700 pb-2 mb-4">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                        Cost Information
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Unit Cost <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-zinc-500 dark:text-zinc-400">₱</span>
                          <input
                            type="number"
                            value={item.unitCost || ''}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].unitCost = e.target.valueAsNumber || 0;
                                newItems[index].subtotal = (e.target.valueAsNumber || 0) * (newItems[index].quantity || 0);
                              setItems(newItems);
                            }}
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 pl-7 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent"
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          Price per unit
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Subtotal
                        </label>
                        <div className="px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-md">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-500 dark:text-zinc-400">₱</span>
                            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                              {new Intl.NumberFormat('en-PH', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(item.subtotal || 0)}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          Auto-calculated: quantity × unit cost
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-end">
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-md px-6 py-3">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Total Cost:
                    </span>
                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                      ₱
                      {new Intl.NumberFormat('en-PH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(
                        items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0)
                      )}
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
            onClick={() => router.push(`/requisitions/${requisitionId}`)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
    </ProtectedRoute>
  );
}
