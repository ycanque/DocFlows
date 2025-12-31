import { ApprovalRecord, User } from '@docflows/shared';
import { CheckCircle2, XCircle, FileText, Send, Clock, Download } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadedFile, getSignedUrl } from '@/services/uploadService';

interface ApprovalTimelineProps {
  approvalRecords: ApprovalRecord[];
  createdAt?: string;
  requester?: User;
  attachments?: UploadedFile[];
  requisitionId?: string;
}

function formatTimestamp(timestamp: string, format: 'short' | 'full' = 'full'): string {
  const date = new Date(timestamp);
  
  if (format === 'short') {
    // Short format: "12/16" or "Today" or "Yesterday"
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
    }
  }
  
  // Full format with time
  return date.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
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

export default function ApprovalTimeline({ approvalRecords, createdAt, requester, attachments = [], requisitionId }: ApprovalTimelineProps) {
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState<string | null>(null);
  const [isDocumentsDialogOpen, setIsDocumentsDialogOpen] = useState(false);

  const hasApprovalRecords = approvalRecords && approvalRecords.length > 0;
  const hasAnyTimeline = createdAt || hasApprovalRecords;

  // Get documents for a specific workflow step
  const getDocumentsForStep = (workflowStep: string) => {
    return attachments.filter(file => file.workflowStep === workflowStep);
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
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        No approval history yet
      </div>
    );
  }

  // Sort by timestamp to show chronological order
  const sortedRecords = hasApprovalRecords 
    ? [...approvalRecords].sort((a, b) => {
        // Sort by timestamp (earliest first)
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      })
    : [];

  // Helper to get workflow step name
  const getWorkflowStepName = (record: ApprovalRecord) => {
    if (record.approvalLevel === -1) return 'Cancelled';
    if (record.approvalLevel === 0) return 'Submitted';
    if (record.approvedBy) return `Approved_Level_${record.approvalLevel}`;
    if (record.rejectedBy) return `Rejected_Level_${record.approvalLevel}`;
    return `Pending_Level_${record.approvalLevel}`;
  };

  return (
    <>
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

    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {/* Created Entry */}
        {createdAt && (
          <li key="created">
            <div className="relative pb-8">
              {/* Timeline connector line */}
              {sortedRecords.length > 0 && (
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
                      <span className="sm:hidden">{formatDateOnly(createdAt)}</span>
                      <span className="sm:hidden">{formatTimeOnly(createdAt)}</span>
                      <span className="hidden sm:inline">{formatDateOnly(createdAt)}</span>
                      <span className="hidden sm:inline">{formatTimeOnly(createdAt)}</span>
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
        {sortedRecords.map((record, recordIdx) => {
          const isApproved = !!record.approvedBy;
          const isRejected = !!record.rejectedBy;
          const isCancelled = record.approvalLevel === -1;
          const isSubmission = record.approvalLevel === 0 && record.submitter;
          const isPending = !isApproved && !isRejected && !isCancelled && !isSubmission && record.approvalLevel > 0;
          const isLast = recordIdx === sortedRecords.length - 1;

          return (
            <li key={record.id}>
              <div className="relative pb-8">
                {!isLast && (
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
                      ) : record.approvalLevel === 0 ? (
                        <span className="font-medium">Submitted for Approval</span>
                      ) : (
                        <>
                          {!isApproved && !isRejected ? (
                            <span className="font-medium">🕒 Pending Approval - Level {record.approvalLevel} of 1</span>
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
                    {!isApproved && !isRejected && record.approvalLevel > 0 && (
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Awaiting action from: <span className="font-medium">Department Head</span>
                      </p>
                    )}
                    {!isApproved && !isRejected && record.approvalLevel > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Required role: <span className="font-mono">DEPARTMENT_HEAD</span>
                      </p>
                    )}
                    {record.comments && record.comments !== 'Submitted for approval' && record.comments !== `Awaiting approval at level ${record.approvalLevel}` && (
                      <p className={`mt-1 text-sm ${isRejected ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                        &quot;{record.comments}&quot;
                      </p>
                    )}
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                      <time dateTime={record.timestamp} title={formatTimestamp(record.timestamp, 'full')}>
                        {formatTimestamp(record.timestamp, 'short')}
                      </time>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <div className="hidden sm:block text-right text-gray-500 dark:text-gray-400">
                      <time dateTime={record.timestamp} className="text-xs md:text-sm flex flex-col gap-1 whitespace-nowrap">
                        <span>{formatDateOnly(record.timestamp)}</span>
                        <span>{formatTimeOnly(record.timestamp)}</span>
                      </time>
                    </div>
                    {getDocumentsForStep(getWorkflowStepName(record)).length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => showDocuments(getWorkflowStepName(record))}
                        className="text-xs"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        View documents ({getDocumentsForStep(getWorkflowStepName(record)).length})
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
    </>
  );
}
