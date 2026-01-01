'use client';

import { ApprovalRecord, User, CheckVoucher } from '@docflows/shared';
import { CheckCircle2, XCircle, FileText, Send, Clock, Receipt, ArrowRight, CreditCard, CheckCircle, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from 'react';
import { UploadedFile, getSignedUrl } from '@/services/uploadService';

interface PaymentStatusTimelineProps {
  approvalRecords: ApprovalRecord[];
  createdAt?: string;
  requester?: User;
  attachments?: UploadedFile[];
  checkVoucher?: CheckVoucher | null;
  className?: string;
}

function formatDateOnly(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

function formatTimeOnly(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export default function PaymentStatusTimeline({
  approvalRecords,
  createdAt,
  requester,
  attachments = [],
  checkVoucher,
  className = '',
}: PaymentStatusTimelineProps) {
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState<string | null>(null);
  const [isDocumentsDialogOpen, setIsDocumentsDialogOpen] = useState(false);

  const hasApprovalRecords = approvalRecords && approvalRecords.length > 0;
  const hasAnyTimeline = createdAt || hasApprovalRecords || checkVoucher;

  // Get documents for a specific workflow step
  const getDocumentsForStep = (workflowStep: string | null) => {
    if (!workflowStep) return [];
    
    // Handle multiple possible names for the same workflow step
    const possibleSteps: string[] = [workflowStep];
    
    // If looking for "Approved_Level_X", also check for "Level X"
    if (workflowStep.startsWith('Approved_Level_')) {
      possibleSteps.push(workflowStep.replace('Approved_', ''));
    }
    // If looking for "Level X", also check for "Approved_Level_X"
    if (workflowStep.match(/^Level \d+$/)) {
      possibleSteps.push(`Approved_${workflowStep}`);
    }
    // Handle Rejected workflow steps - bidirectional mapping
    if (workflowStep.startsWith('Rejected_Level_')) {
      possibleSteps.push('Rejected');
    }
    // If looking for "Rejected", also check for "Rejected_Level_X" variants
    if (workflowStep === 'Rejected') {
      possibleSteps.push('Rejected_Level_1', 'Rejected_Level_2', 'Rejected_Level_3');
    }
    
    return attachments.filter(file => possibleSteps.includes(file.workflowStep || ''));
  };

  const showDocuments = (workflowStep: string) => {
    setSelectedWorkflowStep(workflowStep);
    setIsDocumentsDialogOpen(true);
  };

  const handleViewFile = async (file: UploadedFile) => {
    try {
      const url = await getSignedUrl(file.id);
      if (url) {
        window.open(url, '_blank');
      } else {
        alert('Failed to generate download link. Please try again.');
      }
    } catch (error) {
      console.error('Error getting file URL:', error);
      alert('Failed to open file. Please try again.');
    }
  };

  const handleDownloadFile = async (file: UploadedFile) => {
    try {
      const url = await getSignedUrl(file.id);
      if (!url) {
        alert('Failed to generate download link. Please try again.');
        return;
      }

      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalFileName;
      link.click();
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  if (!hasAnyTimeline) {
    return (
      <div className={`text-sm text-gray-500 dark:text-gray-400 text-center py-8 ${className}`}>
        No approval history yet
      </div>
    );
  }

  // Sort by timestamp (earliest first)
  const sortedRecords = hasApprovalRecords 
    ? [...approvalRecords].sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      })
    : [];

  // Separate the disbursed and rejected records from other approval records
  const disbursedRecord = sortedRecords.find(r => r.comments?.includes('Check Disbursed - Payment Complete'));
  const rejectedRecord = sortedRecords.find(r => r.comments?.includes('Payment rejected'));
  const regularRecords = sortedRecords.filter(r => 
    !r.comments?.includes('Check Disbursed - Payment Complete') && 
    !r.comments?.includes('Payment rejected')
  );

  // Calculate max approval level from regular records
  const maxApprovalLevel = regularRecords.length > 0
    ? Math.max(...regularRecords.filter(r => r.approvalLevel > 0).map(r => r.approvalLevel))
    : 1;

  return (
    <div className={`flow-root ${className}`}>
      <ul role="list" className={checkVoucher ? "pb-2" : "-mb-8"}>
        {/* Created Entry */}
        {createdAt && (
          <li key="created">
            <div className="relative pb-8">
              {/* Timeline connector line */}
              {regularRecords.length > 0 && (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center ring-8 ring-white dark:ring-gray-900">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      <span className="font-medium">Created</span>
                    </p>
                    {requester && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {requester.firstName} {requester.lastName}{' '}
                        <span className="text-xs">({requester.role})</span>
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <div className="flex flex-col items-end text-nowrap text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatDateOnly(createdAt)}</span>
                      <span>{formatTimeOnly(createdAt)}</span>
                    </div>
                    {getDocumentsForStep('Created').length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => showDocuments('Created')}
                        className="text-xs"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        View documents ({getDocumentsForStep('Created').length})
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        )}

        {/* Approval Records */}
        {regularRecords.map((record, recordIdx) => {
          const isApproved = !!record.approvedBy;
          const isRejected = !!record.rejectedBy;
          const isCancelled = record.comments?.toLowerCase().includes('cancel');
          const isSubmission = record.approvalLevel === 0 && record.submitter;
          const isPending = !isApproved && !isRejected && !isCancelled && !isSubmission;
          const isLast = recordIdx === regularRecords.length - 1;
          const showLine = !isLast || !!checkVoucher;

          return (
            <li key={record.id}>
              <div className="relative pb-8">
                {showLine && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                  <div className="flex-shrink-0">
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-900 ${
                        isCancelled
                          ? 'bg-gray-500'
                          : isSubmission
                          ? 'bg-blue-500'
                          : isApproved
                          ? 'bg-green-500'
                          : isRejected
                          ? 'bg-red-500'
                          : isPending
                          ? 'bg-yellow-500'
                          : 'bg-gray-400'
                      }`}
                    >
                      {isCancelled ? (
                        <XCircle className="h-5 w-5 text-white" aria-hidden="true" />
                      ) : isSubmission ? (
                        <Send className="h-4 w-4 text-white" aria-hidden="true" />
                      ) : isApproved ? (
                        <CheckCircle2 className="h-5 w-5 text-white" aria-hidden="true" />
                      ) : isRejected ? (
                        <XCircle className="h-5 w-5 text-white" aria-hidden="true" />
                      ) : isPending ? (
                        <Clock className="h-4 w-4 text-white" aria-hidden="true" />
                      ) : (
                        <span className="h-2 w-2 bg-white rounded-full" />
                      )}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {isCancelled ? (
                        <span className="font-medium text-gray-600 dark:text-gray-400">Cancelled</span>
                      ) : record.approvalLevel === 0 && record.submitter ? (
                        <span className="font-medium">Submitted for Approval</span>
                      ) : (
                        <>
                          {!isApproved && !isRejected ? (
                            <span className="font-medium">🕒 Pending Approval - Level {record.approvalLevel} of {maxApprovalLevel}</span>
                          ) : (
                            <>
                              Level {record.approvalLevel}{' '}
                              {isApproved && (
                                <span className="font-medium text-green-600 dark:text-green-400">
                                  Approved
                                </span>
                              )}
                              {isRejected && (
                                <span className="font-medium text-red-600 dark:text-red-400">
                                  Rejected
                                </span>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </p>
                    {record.submitter && !isCancelled && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {record.submitter.firstName} {record.submitter.lastName}{' '}
                        <span className="text-xs">({record.submitter.role})</span>
                      </p>
                    )}
                    {isCancelled && record.submitter && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {record.submitter.firstName} {record.submitter.lastName}{' '}
                        <span className="text-xs">({record.submitter.role})</span>
                      </p>
                    )}
                    {record.approver && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {record.approver.firstName} {record.approver.lastName}{' '}
                        <span className="text-xs">({record.approver.role})</span>
                      </p>
                    )}
                    {record.rejector && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {record.rejector.firstName} {record.rejector.lastName}{' '}
                        <span className="text-xs">({record.rejector.role})</span>
                      </p>
                    )}
                    {!isApproved && !isRejected && record.approvalLevel > 0 && !record.submitter && (
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Awaiting action from: <span className="font-medium">Approver</span>
                      </p>
                    )}
                    {!isApproved && !isRejected && record.approvalLevel > 0 && !record.submitter && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Required role: <span className="font-mono">APPROVER</span>
                      </p>
                    )}
                    {record.comments && record.comments !== 'Submitted for approval' && !record.comments.includes('Awaiting') && (
                      <p className={`mt-1 text-sm ${isRejected ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                        &quot;{record.comments}&quot;
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <time dateTime={record.timestamp} className="text-xs flex flex-col items-end gap-1 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      <span>{formatDateOnly(record.timestamp)}</span>
                      <span>{formatTimeOnly(record.timestamp)}</span>
                    </time>
                    {(() => {
                      // Build possible workflow step names for this approval level
                      const possibleSteps = [
                        `Level ${record.approvalLevel}`,
                        `Approved_Level_${record.approvalLevel}`,
                        record.approvalLevel === 0 ? 'Submitted' : null,
                        isRejected ? `Rejected_Level_${record.approvalLevel}` : null,
                      ].filter(Boolean);
                      
                      const docsForStep = attachments.filter(file => possibleSteps.includes(file.workflowStep || ''));
                      
                      return docsForStep.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => showDocuments(docsForStep[0].workflowStep || `Level ${record.approvalLevel}`)}
                          className="text-xs"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          View documents ({docsForStep.length})
                        </Button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </li>
          );
        })}

        {checkVoucher && (
          <li className="relative">
            <div className={`relative ${checkVoucher.check || rejectedRecord ? 'pb-8' : ''}`}>
              {(checkVoucher.check || rejectedRecord) && (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center ring-8 ring-white dark:ring-gray-950 z-10 relative">
                    <Receipt className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Check Voucher Created
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    CV #: <span className="font-mono font-medium">{checkVoucher.cvNumber}</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Status: <span className="capitalize">{checkVoucher.status.toLowerCase().replace(/_/g, ' ')}</span>
                  </p>
                  <div className="mt-2">
                    <Link 
                      href={`/vouchers/${checkVoucher.id}`}
                      className="text-xs font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 flex items-center gap-1"
                    >
                      View Voucher <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
                <div className="text-right text-gray-500 dark:text-gray-400 flex-shrink-0 flex flex-col items-end gap-2">
                  <time dateTime={checkVoucher.createdAt} className="text-xs flex flex-col gap-1 whitespace-nowrap">
                    <span>{formatDateOnly(checkVoucher.createdAt)}</span>
                    <span>{formatTimeOnly(checkVoucher.createdAt)}</span>
                  </time>
                  {getDocumentsForStep('CV_Generated').length > 0 && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => showDocuments('CV_Generated')}
                      className="text-xs bg-white dark:bg-gray-800"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      View documents ({getDocumentsForStep('CV_Generated').length})
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </li>
        )}

        {checkVoucher?.check && (
          <li className="relative">
            <div className={`relative ${disbursedRecord || rejectedRecord ? 'pb-8' : 'pb-0'}`}>
              {(disbursedRecord || rejectedRecord) && (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center ring-8 ring-white dark:ring-gray-950 z-10 relative">
                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Check Issued
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Check #: <span className="font-mono font-medium">{checkVoucher.check.checkNumber}</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Status: <span className="capitalize">{checkVoucher.check.status.toLowerCase().replace(/_/g, ' ')}</span>
                </p>
                <div className="mt-2">
                  <Link 
                    href={`/checks/${checkVoucher.check.id}`}
                    className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                  >
                    View Check <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
              <div className="text-right text-gray-500 dark:text-gray-400 flex-shrink-0 flex flex-col items-end gap-2">
                <time dateTime={checkVoucher.check.createdAt} className="text-xs flex flex-col gap-1 whitespace-nowrap">
                  <span>{formatDateOnly(checkVoucher.check.createdAt)}</span>
                  <span>{formatTimeOnly(checkVoucher.check.createdAt)}</span>
                </time>
                {getDocumentsForStep('Check_Issued').length > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => showDocuments('Check_Issued')}
                    className="text-xs bg-white dark:bg-gray-800"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    View documents ({getDocumentsForStep('Check_Issued').length})
                  </Button>
                )}
              </div>
              </div>
            </div>
          </li>
        )}

        {/* Check Disbursed - Payment Complete */}
        {disbursedRecord && checkVoucher?.check && (
          <li>
            <div className="relative pb-0">
              <div className="relative flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-950 z-10 relative">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                    ✓ Check Disbursed - Payment Complete
                  </p>
                  {checkVoucher.check.receivedBy && (
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Received by: <span className="font-medium">{checkVoucher.check.receivedBy}</span>
                    </p>
                  )}
                  {createdAt && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Payment cycle completed in {' '}
                      {Math.ceil((new Date(disbursedRecord.timestamp).getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  )}
                </div>
                <div className="text-right text-green-600 dark:text-green-400 flex-shrink-0 flex flex-col items-end gap-2">
                  <time dateTime={disbursedRecord.timestamp} className="text-xs flex flex-col gap-1 whitespace-nowrap">
                    <span>{formatDateOnly(disbursedRecord.timestamp)}</span>
                    <span>{formatTimeOnly(disbursedRecord.timestamp)}</span>
                  </time>
                  {getDocumentsForStep('Disbursed').length > 0 && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => showDocuments('Disbursed')}
                      className="text-xs bg-white dark:bg-gray-800"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      View documents ({getDocumentsForStep('Disbursed').length})
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </li>
        )}

        {/* Payment Rejected */}
        {rejectedRecord && (
          <li>
            <div className="relative pb-0">
              <div className="relative flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-950 z-10 relative">
                    <XCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                    ✗ Payment Rejected
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Reason
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {rejectedRecord.comments?.replace('Payment rejected - ', '')}
                  </p>
                  {createdAt && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                      Payment cycle ended after {Math.ceil((new Date(rejectedRecord.timestamp).getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  )}
                </div>
                <div className="text-right text-red-600 dark:text-red-400 flex-shrink-0 flex flex-col items-end gap-2">
                  <time dateTime={rejectedRecord.timestamp} className="text-xs flex flex-col gap-1 whitespace-nowrap">
                    <span>{formatDateOnly(rejectedRecord.timestamp)}</span>
                    <span>{formatTimeOnly(rejectedRecord.timestamp)}</span>
                  </time>
                  {getDocumentsForStep('Rejected').length > 0 && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => showDocuments('Rejected')}
                      className="text-xs bg-white dark:bg-gray-800"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      View documents ({getDocumentsForStep('Rejected').length})
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </li>
        )}
      </ul>

    {/* View Documents Dialog */}
    <Dialog open={isDocumentsDialogOpen} onOpenChange={setIsDocumentsDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Documents - {selectedWorkflowStep}</DialogTitle>
          <DialogDescription>
            Files attached at this workflow step
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {selectedWorkflowStep && getDocumentsForStep(selectedWorkflowStep).map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{file.originalFileName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(file.fileSize / 1024).toFixed(2)} KB
                    {file.uploadedBy && ` • Uploaded by ${file.uploadedBy.firstName} ${file.uploadedBy.lastName}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewFile(file)}
                  title="Open file in new tab"
                >
                  <FileText className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownloadFile(file)}
                  title="Download file"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {selectedWorkflowStep && getDocumentsForStep(selectedWorkflowStep).length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No documents attached at this step
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </div>
  );
}
