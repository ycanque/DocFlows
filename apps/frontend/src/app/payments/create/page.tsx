'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createRequisitionForPayment, CreateRequisitionForPaymentDto } from '@/services/paymentService';
import { getDepartments } from '@/services/departmentService';
import { Department } from '@docflows/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { NumericInput } from '@/components/ui/numeric-input';
import { ArrowLeft, FileText, Paperclip } from 'lucide-react';
import FileAttachments from '@/components/FileAttachments';
import RichTextEditor from '@/components/RichTextEditor';
import type { UploadedFile } from '@/services/uploadService';

const SERIES_CODE_OPTIONS = [
  { value: 'S', label: 'S - Standard' },
  { value: 'U', label: 'U - Urgent' },
  { value: 'G', label: 'G - General' },
];

function getTodayDateString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function CreatePaymentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const [formData, setFormData] = useState({
    departmentId: '',
    seriesCode: '',
    dateRequested: '',
    dateNeeded: '',
    payee: '',
    particulars: '',
    amount: '',
    currency: 'PHP',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize dates on client side to avoid timezone issues
    const today = getTodayDateString();
    setFormData(prev => ({
      ...prev,
      dateRequested: today,
      dateNeeded: today,
      departmentId: user?.departmentId || '',
    }));
    loadDepartments();
  }, [user?.departmentId, user?.id]);

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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.departmentId) {
      errors.departmentId = 'Department is required';
    }
    if (!formData.seriesCode) {
      errors.seriesCode = 'Series code is required';
    }
    if (!formData.dateRequested) {
      errors.dateRequested = 'Date requested is required';
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
      requesterId: user.id,
      departmentId: formData.departmentId,
      seriesCode: formData.seriesCode,
      dateRequested: formData.dateRequested,
      dateNeeded: formData.dateNeeded,
      payee: formData.payee,
      particulars: formData.particulars,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      fileIds: attachedFiles.map(f => f.id),
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
          {/* Tabs for form and attachments */}
          <Tabs defaultValue="form" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="form" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Payment Details
              </TabsTrigger>
              <TabsTrigger value="attachments" className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Attachments {attachedFiles.length > 0 && `(${attachedFiles.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="space-y-6 mt-6">
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

                {/* Date Requested and Date Needed */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Date Requested <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateRequested"
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
                      min={getTodayDateString()}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent"
                      required
                    />
                    {formErrors.dateRequested && <p className="text-sm text-red-500 mt-1">{formErrors.dateRequested}</p>}
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Today or later</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Date Needed <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateNeeded"
                      value={formData.dateNeeded}
                      onChange={(e) => setFormData({ ...formData, dateNeeded: e.target.value })}
                      min={formData.dateRequested}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent"
                      required
                    />
                    {formErrors.dateNeeded && <p className="text-sm text-red-500 mt-1">{formErrors.dateNeeded}</p>}
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Must be on or after date requested</p>
                  </div>
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
                  <RichTextEditor
                    value={formData.particulars}
                    onChange={(value) => setFormData({ ...formData, particulars: value })}
                    placeholder="Enter payment details"
                  />
                  {formErrors.particulars && <p className="text-sm text-red-500 mt-1">{formErrors.particulars}</p>}
                </div>

                {/* Amount and Currency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <NumericInput
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
            </TabsContent>

            <TabsContent value="attachments" className="mt-6">
              <FileAttachments 
                files={attachedFiles}
                onFilesChange={setAttachedFiles}
                mode="draft"
                workflowStep="Created"
              />
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </ProtectedRoute>
  );}