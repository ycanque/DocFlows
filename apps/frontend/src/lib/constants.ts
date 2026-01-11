/**
 * DocFlows Frontend Constants
 *
 * This file contains business logic constants for routing and process ownership.
 * Based on Mactan Rock Industries' Document Flow specifications.
 */

import { RequisitionType } from "@docflows/shared";

/**
 * Request Type to Process Owner Mapping
 *
 * Maps each RequisitionType to an array of department codes that are
 * responsible for fulfilling/processing the request.
 *
 * Note: This determines ROUTING (who processes), not APPROVAL (who approves).
 * Approval follows the standard 3-tier hierarchy: Dept Manager -> Unit Manager -> GM
 */
export const REQUEST_TYPE_MAPPING: Record<RequisitionType, string[]> = {
  // ============================================
  // Procurement Related
  // ============================================
  [RequisitionType.PURCHASE_REQUEST]: ["PROCUREMENT"],
  [RequisitionType.REFUND_LIQUIDATION]: ["PROCUREMENT"],
  [RequisitionType.SUBCON_SERVICES]: ["PROCUREMENT", "EBU", "RTSD"],

  // ============================================
  // Maintenance & Facilities
  // ============================================
  [RequisitionType.CLEANING_MAINTENANCE]: [
    "PROCUREMENT",
    "ADMIN",
    "GFS",
    "EBU",
    "MOTORPOOL",
  ],
  [RequisitionType.REPAIR_TROUBLESHOOTING]: ["GFS", "IT", "EBU"],
  [RequisitionType.INSTALLATION_SETUP]: ["GFS", "IT"],
  [RequisitionType.FUEL]: ["ADMIN", "WAREHOUSE"],
  [RequisitionType.FACILITIES_USAGE]: ["ADMIN"],
  [RequisitionType.DOCUMENTS_RECORDS]: ["ADMIN"],

  // ============================================
  // Specialized
  // ============================================
  [RequisitionType.TRAINING]: ["HR"],
  [RequisitionType.PERMITS_LICENSES]: ["COMPLIANCE"],
  [RequisitionType.LAB_TESTING]: ["LABORATORY"],
  [RequisitionType.BORROW_ITEMS]: [
    "CBU",
    "EBU",
    "WBU",
    "LABORATORY",
    "WAREHOUSE",
  ],
  [RequisitionType.ALLOWANCES]: ["HR", "ACCOUNTING"],

  // ============================================
  // Other
  // ============================================
  [RequisitionType.OTHER]: [], // Empty array implies open selection by requester
};

/**
 * Business Unit Codes
 *
 * Standard codes for the company's business units.
 */
export const BUSINESS_UNIT_CODES = {
  CHEMICAL: "CBU", // Chemical Business Unit
  EQUIPMENT: "EBU", // Equipment Business Unit
  WATER: "WBU", // Water Business Unit
  RTSD: "RTSD", // RTSD (Research/Technical Services Division)
  SALES: "SALES", // Sales Unit
  ADMIN: "ADMIN", // Administrative/Support Unit
} as const;

/**
 * Department Codes
 *
 * Standard codes for departments across all business units.
 * These are used for routing and process ownership.
 */
export const DEPARTMENT_CODES = {
  // Core Operations
  PROCUREMENT: "PROCUREMENT",
  WAREHOUSE: "WAREHOUSE",
  PRODUCTION: "PRODUCTION",
  QUALITY: "QA",
  LABORATORY: "LABORATORY",

  // Support Functions
  ADMIN: "ADMIN",
  HR: "HR",
  IT: "IT",
  FINANCE: "FIN",
  ACCOUNTING: "ACCOUNTING",

  // Specialized
  GFS: "GFS", // General Field Services
  MOTORPOOL: "MOTORPOOL",
  COMPLIANCE: "COMPLIANCE",
  SALES: "SALES",
} as const;

/**
 * Approval Level Configuration
 *
 * Defines the approval hierarchy with level numbers.
 * Used to determine which approver level a request is at.
 */
export const APPROVAL_LEVELS = {
  DEPARTMENT_MANAGER: 1, // Level 1: Department Manager / Asst. Manager
  UNIT_MANAGER: 2, // Level 2: Business Unit Manager
  GENERAL_MANAGER: 3, // Level 3: General Manager (Final)
} as const;

/**
 * Approval Level Labels
 *
 * Human-readable labels for approval levels.
 */
export const APPROVAL_LEVEL_LABELS: Record<number, string> = {
  0: "Not Submitted",
  1: "Department Manager",
  2: "Unit Manager",
  3: "General Manager",
};

/**
 * Get process owners for a given requisition type
 *
 * @param type - The requisition type
 * @returns Array of department codes that can process this type
 */
export function getProcessOwners(type: RequisitionType): string[] {
  return REQUEST_TYPE_MAPPING[type] ?? [];
}

/**
 * Check if a department can process a given requisition type
 *
 * @param type - The requisition type
 * @param departmentCode - The department code to check
 * @returns true if the department is a valid process owner
 */
export function canDepartmentProcess(
  type: RequisitionType,
  departmentCode: string
): boolean {
  const owners = REQUEST_TYPE_MAPPING[type];
  // Empty array means any department can be selected
  if (owners.length === 0) return true;
  return owners.includes(departmentCode);
}

/**
 * Get the next approval level label
 *
 * @param currentLevel - The current approval level (0-3)
 * @returns Label for the next approval level, or null if fully approved
 */
export function getNextApprovalLabel(currentLevel: number): string | null {
  const nextLevel = currentLevel + 1;
  if (nextLevel > APPROVAL_LEVELS.GENERAL_MANAGER) return null;
  return APPROVAL_LEVEL_LABELS[nextLevel] ?? null;
}

/**
 * Currency options for requisitions
 */
export const CURRENCY_OPTIONS = [
  { value: "PHP", label: "Philippine Peso (₱)" },
  { value: "USD", label: "US Dollar ($)" },
] as const;

/**
 * Default currency for new requisitions
 */
export const DEFAULT_CURRENCY = "PHP";
