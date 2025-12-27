import { 
  RequisitionStatus, 
  RFPStatus, 
  CheckVoucherStatus, 
  CheckStatus 
} from '@docflows/shared';

type AllStatusTypes = RequisitionStatus | RFPStatus | CheckVoucherStatus | CheckStatus | string;

interface StatusBadgeProps {
  status: AllStatusTypes;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Requisition Statuses
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

  // RFP (Request for Payment) Statuses
  [RFPStatus.DRAFT]: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  [RFPStatus.SUBMITTED]: {
    label: 'Pending Approval',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  },
  [RFPStatus.PENDING_APPROVAL]: {
    label: 'Pending Approval',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  },
  [RFPStatus.APPROVED]: {
    label: 'Approved',
    className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
  [RFPStatus.CV_GENERATED]: {
    label: 'CV Generated',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  },
  [RFPStatus.CHECK_ISSUED]: {
    label: 'Check Issued',
    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  },
  [RFPStatus.DISBURSED]: {
    label: 'Disbursed',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  },
  [RFPStatus.REJECTED]: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  },
  [RFPStatus.CANCELLED]: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  },

  // Check Voucher Statuses
  [CheckVoucherStatus.DRAFT]: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  [CheckVoucherStatus.PENDING_VERIFICATION]: {
    label: 'Pending Verification',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  },
  [CheckVoucherStatus.VERIFIED]: {
    label: 'Verified',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  [CheckVoucherStatus.APPROVED]: {
    label: 'Approved',
    className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
  [CheckVoucherStatus.CHECK_ISSUED]: {
    label: 'Check Issued',
    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  },
  [CheckVoucherStatus.REJECTED]: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  },

  // Check Statuses
  [CheckStatus.ISSUED]: {
    label: 'Issued',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  [CheckStatus.DISBURSED]: {
    label: 'Disbursed',
    className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
  [CheckStatus.VOIDED]: {
    label: 'Voided',
    className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  },
  [CheckStatus.CANCELLED]: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
