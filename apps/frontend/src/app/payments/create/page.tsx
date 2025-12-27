'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createRequisitionForPayment, CreateRequisitionForPaymentDto, searchRequisitionSlips } from '@/services/paymentService';
import { getDepartments } from '@/services/departmentService';
import { Department } from '@docflows/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Search } from 'lucide-react';

const SERIES_CODE_OPTIONS = [
  { value: 'S', label: 'S - Standard' },
  { value: 'U', label: 'U - Urgent' },
  { value: 'G', label: 'G - General' },
];

export default function CreatePaymentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [formData, setFormData] = useState({
    requisitionSlipId: '',
    departmentId: '',
    seriesCode: '',
    dateNeeded: new Date().toISOString().split('T')[0],
    payee: '',
    particulars: '',
    amount: '',
    currency: 'PHP',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [requisitionQuery, setRequisitionQuery] = useState('');
  const [requisitionResults, setRequisitionResults] = useState<Array<{ id: string; requisitionNumber: string }>>([]);
  const [showRequisitionDropdown, setShowRequisitionDropdown] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (user?.departmentId) {
      setFormData(prev => ({ ...prev, departmentId: user.departmentId! }));
    }
  }, [user]);

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

  async function handleRequisitionSearch(query: string) {
    setRequisitionQuery(query);
    
    if (query.length < 2) {
      setRequisitionResults([]);
      setShowRequisitionDropdown(false);
      return;
    }

    try {
      const results = await searchRequisitionSlips(query);
      setRequisitionResults(results);
      setShowRequisitionDropdown(true);
    } catch (err) {
      console.error('Error searching requisitions:', err);
      setRequisitionResults([]);
    }
  }

  function handleRequisitionSelect(requisition: { id: string; requisitionNumber: string }) {
    setFormData({ ...formData, requisitionSlipId: requisition.id });
    setRequisitionQuery(requisition.requisitionNumber);
    setShowRequisitionDropdown(false);
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.departmentId) {
      errors.departmentId = 'Department is required';
    }
    if (!formData.seriesCode) {
      errors.seriesCode = 'Series code is required';
    }
    if (!formData.dateNeeded) {
      errors.dateNeeded = 'Date needed is required';
    }
    if (!formData.payee.trim()) {
      errors.payee = 'Payee is required';
    }
    if (!formData.particulars.trim()) {
      errors.particulars = 'Particulars are required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    const data: CreateRequisitionForPaymentDto = {
      requisitionSlipId: formData.requisitionSlipId || undefined,
      requesterId: user.id,
      departmentId: formData.departmentId,
      seriesCode: formData.seriesCode,
      dateNeeded: formData.dateNeeded,
      payee: formData.payee,
      particulars: formData.particulars,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
    };

    try {
      setLoading(true);
      setError(null);
      const payment = await createRequisitionForPayment(data);
      if (payment && payment.id) {
        router.push(`/payments/${payment.id}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment request';
      setError(errorMessage);
      console.error('Error creating payment:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/payments')}
            className="w-fit text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payment Requests
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Create Payment Request
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Fill in the details to create a new payment request
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
          {/* Payment Request Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Request Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Department and Series Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    {loadingDepartments ? (
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">Loading departments...</div>
                    ) : (
                      <select
                        name="departmentId"
                        value={formData.departmentId}
                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
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
                    {formErrors.departmentId && <p className="text-sm text-red-500 mt-1">{formErrors.departmentId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Series Code <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="seriesCode"
                      value={formData.seriesCode}
                      onChange={(e) => setFormData({ ...formData, seriesCode: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent"
                      required
                    >
                      <option value="">Select series code</option>
                      {SERIES_CODE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.seriesCode && <p className="text-sm text-red-500 mt-1">{formErrors.seriesCode}</p>}
                  </div>
                </div>

                {/* Date Needed */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Date Needed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateNeeded"
                    value={formData.dateNeeded}
                    onChange={(e) => setFormData({ ...formData, dateNeeded: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent"
                  />
                  {formErrors.dateNeeded && <p className="text-sm text-red-500 mt-1">{formErrors.dateNeeded}</p>}
                </div>

                {/* Payee */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Payee <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="payee"
                    value={formData.payee}
                    onChange={(e) => setFormData({ ...formData, payee: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent"
                    placeholder="Enter payee name"
                  />
                  {formErrors.payee && <p className="text-sm text-red-500 mt-1">{formErrors.payee}</p>}
                </div>

                {/* Particulars */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Particulars <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="particulars"
                    value={formData.particulars}
                    onChange={(e) => setFormData({ ...formData, particulars: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent"
                    placeholder="Enter payment details"
                    rows={4}
                  />
                  {formErrors.particulars && <p className="text-sm text-red-500 mt-1">{formErrors.particulars}</p>}
                </div>

                {/* Amount and Currency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                    {formErrors.amount && <p className="text-sm text-red-500 mt-1">{formErrors.amount}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Currency <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent"
                    >
                      <option value="PHP">PHP (Philippine Peso)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="GBP">GBP (British Pound)</option>
                    </select>
                  </div>
                </div>

                {/* Requisition Slip ID - Searchable */}
                <div className="relative">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Requisition Slip (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={requisitionQuery}
                      onChange={(e) => handleRequisitionSearch(e.target.value)}
                      onFocus={() => requisitionQuery.length >= 2 && setShowRequisitionDropdown(true)}
                      onBlur={() => setTimeout(() => setShowRequisitionDropdown(false), 200)}
                      className="w-full px-3 py-2 pr-10 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent"
                      placeholder="Search by requisition number..."
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  </div>
                  {showRequisitionDropdown && requisitionResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {requisitionResults.map((req) => (
                        <button
                          key={req.id}
                          type="button"
                          onClick={() => handleRequisitionSelect(req)}
                          className="w-full px-4 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-700 last:border-0"
                        >
                          {req.requisitionNumber}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Link this payment request to an existing requisition slip
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/payments')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Payment Request'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </ProtectedRoute>
  );}