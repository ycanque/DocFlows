import { RequisitionStatus } from '@docflows/shared';

interface StatusBadgeProps {
  status: RequisitionStatus;
  className?: string;
}

const statusConfig: Record<
  RequisitionStatus,
  { label: string; className: string }
> = {
  [RequisitionStatus.DRAFT]: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  [RequisitionStatus.SUBMITTED]: {
    label: 'Submitted',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  [RequisitionStatus.PENDING_APPROVAL]: {
    label: 'Pending Approval',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  },
  [RequisitionStatus.APPROVED]: {
    label: 'Approved',
    className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
  [RequisitionStatus.REJECTED]: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  },
  [RequisitionStatus.CANCELLED]: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  },
  [RequisitionStatus.COMPLETED]: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
