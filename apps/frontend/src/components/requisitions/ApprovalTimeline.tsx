import { ApprovalRecord } from '@docflows/shared';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ApprovalTimelineProps {
  approvalRecords: ApprovalRecord[];
}

export default function ApprovalTimeline({ approvalRecords }: ApprovalTimelineProps) {
  if (!approvalRecords || approvalRecords.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        No approval history yet
      </div>
    );
  }

  // Sort by approval level
  const sortedRecords = [...approvalRecords].sort((a, b) => a.approvalLevel - b.approvalLevel);

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {sortedRecords.map((record, recordIdx) => {
          const isApproved = !!record.approvedBy;
          const isRejected = !!record.rejectedBy;
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
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-900 ${
                        isApproved
                          ? 'bg-green-500'
                          : isRejected
                          ? 'bg-red-500'
                          : 'bg-gray-400'
                      }`}
                    >
                      {isApproved ? (
                        <CheckCircle2 className="h-5 w-5 text-white" aria-hidden="true" />
                      ) : isRejected ? (
                        <XCircle className="h-5 w-5 text-white" aria-hidden="true" />
                      ) : (
                        <span className="h-2 w-2 bg-white rounded-full" />
                      )}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
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
                        {!isApproved && !isRejected && (
                          <span className="font-medium text-gray-500 dark:text-gray-400">
                            Pending
                          </span>
                        )}
                      </p>
                      {record.approver && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          by {record.approver.firstName} {record.approver.lastName}
                        </p>
                      )}
                      {record.rejector && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          by {record.rejector.firstName} {record.rejector.lastName}
                        </p>
                      )}
                      {record.comments && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          "{record.comments}"
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                      <time dateTime={record.timestamp}>
                        {new Date(record.timestamp).toLocaleString()}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
