'use client';

import { useState, useEffect } from 'react';
import { CreateRequisitionForPaymentDto, UpdateRequisitionForPaymentDto } from '@/services/paymentService';
import { RequisitionForPayment } from '@docflows/shared';
import { parseISO } from 'date-fns';

interface RFPFormProps {
  initialData?: RequisitionForPayment;
  onSubmit: (data: CreateRequisitionForPaymentDto | UpdateRequisitionForPaymentDto) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  className?: string;
}

export default function RFPForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Create Request',
  className = '',
}: RFPFormProps) {
  const [formData, setFormData] = useState({
    requisitionSlipId: initialData?.requisitionSlipId || '',
    seriesCode: initialData?.seriesCode || '',
    dateNeeded: initialData?.dateNeeded 
      ? parseISO(initialData.dateNeeded).toISOString().split('T')[0] 
      : '',
    payee: initialData?.payee || '',
    particulars: initialData?.particulars || '',
    amount: initialData?.amount?.toString() || '',
    currency: initialData?.currency || 'PHP',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.seriesCode.trim()) {
      newErrors.seriesCode = 'Series code is required';
    }

    if (!formData.dateNeeded) {
      newErrors.dateNeeded = 'Date needed is required';
    }

    if (!formData.payee.trim()) {
      newErrors.payee = 'Payee is required';
    }

    if (!formData.particulars.trim()) {
      newErrors.particulars = 'Particulars are required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData: CreateRequisitionForPaymentDto | UpdateRequisitionForPaymentDto = {
        requisitionSlipId: formData.requisitionSlipId || undefined,
        seriesCode: formData.seriesCode,
        dateNeeded: formData.dateNeeded,
        payee: formData.payee,
        particulars: formData.particulars,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
      };

      await onSubmit(submitData);
    } catch (error: unknown) {
      console.error('Form submission error:', error);
      // Handle error - could set a general error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Series Code */}
      <div>
        <label htmlFor="seriesCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Series Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="seriesCode"
          value={formData.seriesCode}
          onChange={(e) => handleChange('seriesCode', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm ${
            errors.seriesCode ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
          }`}
          placeholder="e.g., RFP-2025-001"
        />
        {errors.seriesCode && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.seriesCode}</p>
        )}
      </div>

      {/* Payee */}
      <div>
        <label htmlFor="payee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Payee <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="payee"
          value={formData.payee}
          onChange={(e) => handleChange('payee', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm ${
            errors.payee ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
          }`}
          placeholder="Enter payee name"
        />
        {errors.payee && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.payee}</p>
        )}
      </div>

      {/* Date Needed */}
      <div>
        <label htmlFor="dateNeeded" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Date Needed <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="dateNeeded"
          value={formData.dateNeeded}
          onChange={(e) => handleChange('dateNeeded', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm ${
            errors.dateNeeded ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
          }`}
        />
        {errors.dateNeeded && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.dateNeeded}</p>
        )}
      </div>

      {/* Amount and Currency */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Amount <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="amount"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm ${
              errors.amount ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
            }`}
            placeholder="0.00"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
          )}
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Currency
          </label>
          <select
            id="currency"
            value={formData.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          >
            <option value="PHP">PHP</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      {/* Particulars */}
      <div>
        <label htmlFor="particulars" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Particulars <span className="text-red-500">*</span>
        </label>
        <textarea
          id="particulars"
          rows={4}
          value={formData.particulars}
          onChange={(e) => handleChange('particulars', e.target.value)}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm ${
            errors.particulars ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
          }`}
          placeholder="Enter payment details and purpose"
        />
        {errors.particulars && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.particulars}</p>
        )}
      </div>

      {/* Optional Requisition Slip ID */}
      <div>
        <label htmlFor="requisitionSlipId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Linked Requisition Slip (Optional)
        </label>
        <input
          type="text"
          id="requisitionSlipId"
          value={formData.requisitionSlipId}
          onChange={(e) => handleChange('requisitionSlipId', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          placeholder="Enter requisition slip ID if applicable"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Link this payment request to an existing requisition slip
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
