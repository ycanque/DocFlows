'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRequisitionForPayment } from '@/services/paymentService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import RFPForm from '@/components/payments/RFPForm';
import { ArrowLeft } from 'lucide-react';

export default function CreatePaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  async function handleSubmit(data: any) {
    try {
      setLoading(true);
      setError(null);
      const payment = await createRequisitionForPayment(data);
      if (payment && payment.id) {
        setSuccess('Payment request created successfully!');
        router.push(`/payments/${payment.id}`);
      } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create payment request');
      console.error('Error creating payment:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.push('/payments');
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-900">
        <Sidebar 
          currentView="payments"
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900" role="main">
            <div className="p-6 sm:p-8 space-y-8">
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
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Create Payment Request
                  </h1>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Fill in the details below to create a new RFP
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

        {success && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="pt-6">
              <p className="text-green-600 dark:text-green-400">{success}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Payment Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <RFPForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          </CardContent>
        </Card>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
