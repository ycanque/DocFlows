import { PrismaClient, UserRole, RequisitionStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

// Load environment variables
config();

// Ensure DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// Create Prisma client with PostgreSQL adapter (Prisma 7)
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('📋 Foundation Phase: Setting up Organizational Hierarchy\n');

  // Clear existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...');
  await prisma.approvalRecord.deleteMany();
  await prisma.check.deleteMany();
  await prisma.checkVoucher.deleteMany();
  await prisma.requisitionForPayment.deleteMany();
  await prisma.requestItem.deleteMany();
  await prisma.requisitionSlip.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.costCenter.deleteMany();
  await prisma.project.deleteMany();
  await prisma.approver.deleteMany();
  await prisma.fileUpload.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.businessUnit.deleteMany();

  // ============================================
  // Step 1: Create Business Units
  // ============================================
  console.log('\n🏢 Creating Business Units...');

  // Main Business Units
  const chemicalBU = await prisma.businessUnit.create({
    data: {
      unitCode: 'CBU',
      name: 'Chemical Business Unit',
      description: 'Chemicals production and distribution',
      status: 'ACTIVE',
      budgetAmount: 10000000,
    },
  });

  const equipmentBU = await prisma.businessUnit.create({
    data: {
      unitCode: 'EBU',
      name: 'Equipment Business Unit',
      description: 'Equipment sales, rental, and maintenance',
      status: 'ACTIVE',
      budgetAmount: 8000000,
    },
  });

  const waterBU = await prisma.businessUnit.create({
    data: {
      unitCode: 'WBU',
      name: 'Water Business Unit',
      description: 'Water treatment and distribution',
      status: 'ACTIVE',
      budgetAmount: 7000000,
    },
  });

  // Support Units
  const rtsdBU = await prisma.businessUnit.create({
    data: {
      unitCode: 'RTSD',
      name: 'Research & Technical Services Division',
      description: 'R&D, technical support, and laboratory services',
      status: 'ACTIVE',
      budgetAmount: 5000000,
    },
  });

  const salesBU = await prisma.businessUnit.create({
    data: {
      unitCode: 'SALES',
      name: 'Sales Unit',
      description: 'Sales and marketing operations',
      status: 'ACTIVE',
      budgetAmount: 6000000,
    },
  });

  const adminBU = await prisma.businessUnit.create({
    data: {
      unitCode: 'ADMIN',
      name: 'Administrative Support Unit',
      description: 'Corporate services and administration',
      status: 'ACTIVE',
      budgetAmount: 4000000,
    },
  });

  console.log('✅ Created 6 Business Units (CBU, EBU, WBU, RTSD, SALES, ADMIN)');

  // ============================================
  // Step 2: Create Departments linked to BUs
  // ============================================
  console.log('\n📁 Creating Departments with BU linkage...');

  // Chemical BU Departments
  const chemProduction = await prisma.department.create({
    data: {
      name: 'Chemical Production',
      code: 'CHEM-PROD',
      businessUnitId: chemicalBU.id,
    },
  });

  const chemQA = await prisma.department.create({
    data: {
      name: 'Chemical Quality Assurance',
      code: 'CHEM-QA',
      businessUnitId: chemicalBU.id,
    },
  });

  // Equipment BU Departments
  const equipOps = await prisma.department.create({
    data: {
      name: 'Equipment Operations',
      code: 'EQUIP-OPS',
      businessUnitId: equipmentBU.id,
    },
  });

  // Water BU Departments
  const waterOps = await prisma.department.create({
    data: {
      name: 'Water Operations',
      code: 'WATER-OPS',
      businessUnitId: waterBU.id,
    },
  });

  // RTSD Departments
  const laboratory = await prisma.department.create({
    data: {
      name: 'Laboratory',
      code: 'LABORATORY',
      businessUnitId: rtsdBU.id,
    },
  });

  // Support Departments (under Admin BU)
  const adminDept = await prisma.department.create({
    data: {
      name: 'Administration',
      code: 'ADMIN',
      businessUnitId: adminBU.id,
    },
  });

  const financeDept = await prisma.department.create({
    data: {
      name: 'Finance',
      code: 'FIN',
      businessUnitId: adminBU.id,
    },
  });

  const hrDept = await prisma.department.create({
    data: {
      name: 'Human Resources',
      code: 'HR',
      businessUnitId: adminBU.id,
    },
  });

  const itDept = await prisma.department.create({
    data: {
      name: 'IT Department',
      code: 'IT',
      businessUnitId: adminBU.id,
    },
  });

  const procurementDept = await prisma.department.create({
    data: {
      name: 'Procurement',
      code: 'PROCUREMENT',
      businessUnitId: adminBU.id,
    },
  });

  const warehouseDept = await prisma.department.create({
    data: {
      name: 'Warehouse',
      code: 'WAREHOUSE',
      businessUnitId: adminBU.id,
    },
  });

  const complianceDept = await prisma.department.create({
    data: {
      name: 'Compliance',
      code: 'COMPLIANCE',
      businessUnitId: adminBU.id,
    },
  });

  const accountingDept = await prisma.department.create({
    data: {
      name: 'Accounting',
      code: 'ACCOUNTING',
      businessUnitId: adminBU.id,
    },
  });

  const gfsDept = await prisma.department.create({
    data: {
      name: 'General Field Services',
      code: 'GFS',
      businessUnitId: adminBU.id,
    },
  });

  const motorpoolDept = await prisma.department.create({
    data: {
      name: 'Motorpool',
      code: 'MOTORPOOL',
      businessUnitId: adminBU.id,
    },
  });

  const salesDept = await prisma.department.create({
    data: {
      name: 'Sales',
      code: 'SALES',
      businessUnitId: salesBU.id,
    },
  });

  console.log('✅ Created 16 Departments linked to Business Units');

  // ============================================
  // Step 3: Create Users with roles
  // ============================================
  console.log('\n👤 Creating Users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // General Manager (Level 3 - Top of approval hierarchy)
  const gmUser = await prisma.user.create({
    data: {
      email: 'gm@mactan.com',
      password: await bcrypt.hash('gm123', 10),
      firstName: 'General',
      lastName: 'Manager',
      role: UserRole.ADMIN,
      departmentId: adminDept.id,
    },
  });

  // Chemical BU Users
  const chemUnitManager = await prisma.user.create({
    data: {
      email: 'cbu.manager@mactan.com',
      password: hashedPassword,
      firstName: 'Carlos',
      lastName: 'Santos',
      role: UserRole.DEPARTMENT_HEAD,
      departmentId: chemProduction.id,
    },
  });

  const chemDeptManager = await prisma.user.create({
    data: {
      email: 'chem.prod.manager@mactan.com',
      password: hashedPassword,
      firstName: 'Maria',
      lastName: 'Cruz',
      role: UserRole.DEPARTMENT_HEAD,
      departmentId: chemProduction.id,
    },
  });

  const chemUser1 = await prisma.user.create({
    data: {
      email: 'chem.user1@mactan.com',
      password: hashedPassword,
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      role: UserRole.USER,
      departmentId: chemProduction.id,
    },
  });

  const chemUser2 = await prisma.user.create({
    data: {
      email: 'chem.user2@mactan.com',
      password: hashedPassword,
      firstName: 'Ana',
      lastName: 'Reyes',
      role: UserRole.USER,
      departmentId: chemQA.id,
    },
  });

  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@docflow.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      departmentId: adminDept.id,
    },
  });

  // Finance Users
  const financeManager = await prisma.user.create({
    data: {
      email: 'finance.manager@mactan.com',
      password: hashedPassword,
      firstName: 'Finance',
      lastName: 'Manager',
      role: UserRole.FINANCE,
      departmentId: financeDept.id,
    },
  });

  const accountingUser = await prisma.user.create({
    data: {
      email: 'accounting@mactan.com',
      password: hashedPassword,
      firstName: 'Accounting',
      lastName: 'Staff',
      role: UserRole.ACCOUNTING,
      departmentId: accountingDept.id,
    },
  });

  // HR Users
  const hrManager = await prisma.user.create({
    data: {
      email: 'hr.manager@mactan.com',
      password: hashedPassword,
      firstName: 'HR',
      lastName: 'Manager',
      role: UserRole.DEPARTMENT_HEAD,
      departmentId: hrDept.id,
    },
  });

  // IT Users
  const itManager = await prisma.user.create({
    data: {
      email: 'it.manager@mactan.com',
      password: hashedPassword,
      firstName: 'IT',
      lastName: 'Manager',
      role: UserRole.DEPARTMENT_HEAD,
      departmentId: itDept.id,
    },
  });

  const itUser = await prisma.user.create({
    data: {
      email: 'it.user@mactan.com',
      password: hashedPassword,
      firstName: 'Tech',
      lastName: 'Support',
      role: UserRole.USER,
      departmentId: itDept.id,
    },
  });

  // Procurement User
  const procurementManager = await prisma.user.create({
    data: {
      email: 'procurement@mactan.com',
      password: hashedPassword,
      firstName: 'Procurement',
      lastName: 'Manager',
      role: UserRole.DEPARTMENT_HEAD,
      departmentId: procurementDept.id,
    },
  });

  // Regular users for different BUs
  const equipUser = await prisma.user.create({
    data: {
      email: 'equip.user@mactan.com',
      password: hashedPassword,
      firstName: 'Equipment',
      lastName: 'Operator',
      role: UserRole.USER,
      departmentId: equipOps.id,
    },
  });

  const waterUser = await prisma.user.create({
    data: {
      email: 'water.user@mactan.com',
      password: hashedPassword,
      firstName: 'Water',
      lastName: 'Technician',
      role: UserRole.USER,
      departmentId: waterOps.id,
    },
  });

  const labUser = await prisma.user.create({
    data: {
      email: 'lab.user@mactan.com',
      password: hashedPassword,
      firstName: 'Lab',
      lastName: 'Analyst',
      role: UserRole.USER,
      departmentId: laboratory.id,
    },
  });

  console.log('✅ Created 15 Users across Business Units');

  // Update Business Units with Unit Managers
  await prisma.businessUnit.update({
    where: { id: chemicalBU.id },
    data: { unitManagerId: chemUnitManager.id },
  });

  // Update departments with heads
  await prisma.department.update({
    where: { id: chemProduction.id },
    data: { headOfDepartmentId: chemDeptManager.id },
  });
  await prisma.department.update({
    where: { id: financeDept.id },
    data: { headOfDepartmentId: financeManager.id },
  });
  await prisma.department.update({
    where: { id: hrDept.id },
    data: { headOfDepartmentId: hrManager.id },
  });
  await prisma.department.update({
    where: { id: itDept.id },
    data: { headOfDepartmentId: itManager.id },
  });
  await prisma.department.update({
    where: { id: procurementDept.id },
    data: { headOfDepartmentId: procurementManager.id },
  });

  console.log('✅ Linked department heads and unit managers');

  // ============================================
  // Step 4: Create Approvers (3-Level Hierarchy)
  // ============================================
  console.log('\n✅ Creating Approvers with 3-Level Hierarchy...');

  // Chemical BU - Test case with full 3-level approval chain
  // Level 1: Department Manager (Production)
  await prisma.approver.create({
    data: {
      userId: chemDeptManager.id,
      departmentId: chemProduction.id,
      approvalLevel: 1, // DEPARTMENT_MANAGER
      approvalLimit: 50000,
      isActive: true,
    },
  });

  // Level 2: Unit Manager (Chemical BU)
  await prisma.approver.create({
    data: {
      userId: chemUnitManager.id,
      departmentId: chemProduction.id,
      approvalLevel: 2, // UNIT_MANAGER
      approvalLimit: 200000,
      isActive: true,
    },
  });

  // Level 3: General Manager
  await prisma.approver.create({
    data: {
      userId: gmUser.id,
      departmentId: null, // GM approves across all departments
      approvalLevel: 3, // GENERAL_MANAGER
      approvalLimit: 999999999, // Effectively unlimited
      isActive: true,
    },
  });

  // Additional departmental approvers
  await prisma.approver.create({
    data: {
      userId: hrManager.id,
      departmentId: hrDept.id,
      approvalLevel: 1,
      approvalLimit: 75000,
      isActive: true,
    },
  });

  await prisma.approver.create({
    data: {
      userId: itManager.id,
      departmentId: itDept.id,
      approvalLevel: 1,
      approvalLimit: 100000,
      isActive: true,
    },
  });

  await prisma.approver.create({
    data: {
      userId: financeManager.id,
      departmentId: financeDept.id,
      approvalLevel: 1,
      approvalLimit: 150000,
      isActive: true,
    },
  });

  await prisma.approver.create({
    data: {
      userId: procurementManager.id,
      departmentId: procurementDept.id,
      approvalLevel: 1,
      approvalLimit: 100000,
      isActive: true,
    },
  });

  console.log('✅ Created 7 Approvers with 3-level hierarchy for Chemical BU');

  // ============================================
  // Step 5: Create Cost Centers
  // ============================================
  console.log('\n💰 Creating Cost Centers...');
  await Promise.all([
    prisma.costCenter.create({
      data: {
        type: 'BUSINESS_UNIT',
        code: 'CBU',
        name: 'Chemical BU',
        description: 'Chemical Business Unit Cost Center',
        businessUnitId: chemicalBU.id,
        isActive: true,
      },
    }),
    prisma.costCenter.create({
      data: {
        type: 'BUSINESS_UNIT',
        code: 'EBU',
        name: 'Equipment BU',
        description: 'Equipment Business Unit Cost Center',
        businessUnitId: equipmentBU.id,
        isActive: true,
      },
    }),
    prisma.costCenter.create({
      data: {
        type: 'BUSINESS_UNIT',
        code: 'WBU',
        name: 'Water BU',
        description: 'Water Business Unit Cost Center',
        businessUnitId: waterBU.id,
        isActive: true,
      },
    }),
    prisma.costCenter.create({
      data: {
        type: 'BUSINESS_UNIT',
        code: 'RTSD',
        name: 'RTSD',
        description: 'Research & Technical Services Cost Center',
        businessUnitId: rtsdBU.id,
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Created 4 Cost Centers');

  // ============================================
  // Step 6: Create Projects
  // ============================================
  console.log('\n📊 Creating Projects...');
  const project1 = await prisma.project.create({
    data: {
      projectCode: 'PROJ-2026-001',
      name: 'Chemical Plant Expansion',
      description: 'Expansion of chemical production capacity',
      status: 'ACTIVE',
      businessUnitId: chemicalBU.id,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      budgetAmount: 5000000,
    },
  });

  await prisma.project.create({
    data: {
      projectCode: 'PROJ-2026-002',
      name: 'Water Treatment Upgrade',
      description: 'Modernization of water treatment facilities',
      status: 'ACTIVE',
      businessUnitId: waterBU.id,
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-08-31'),
      budgetAmount: 3000000,
    },
  });
  console.log('✅ Created 2 Projects');

  // ============================================
  // Step 7: Create Bank Accounts
  // ============================================
  console.log('\n💳 Creating Bank Accounts...');
  const bankAccounts = await Promise.all([
    prisma.bankAccount.create({
      data: {
        accountName: 'Mactan Rock Main Account',
        accountNumber: 'MRI-001-2345-6789',
        bankName: 'BDO',
        isActive: true,
      },
    }),
    prisma.bankAccount.create({
      data: {
        accountName: 'Payroll Account',
        accountNumber: 'MRI-002-3456-7890',
        bankName: 'BPI',
        isActive: true,
      },
    }),
    prisma.bankAccount.create({
      data: {
        accountName: 'Operations Account',
        accountNumber: 'MRI-003-4567-8901',
        bankName: 'Metrobank',
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${bankAccounts.length} Bank Accounts`);

  // ============================================
  // Step 8: Create Sample Requisitions (with new type field)
  // ============================================
  console.log('\n📝 Creating Sample Requisitions with Types...');

  // Purchase Request - Chemical Supplies
  const purchaseReq = await prisma.requisitionSlip.create({
    data: {
      requisitionNumber: 'TEMP',
      requesterId: chemUser1.id,
      departmentId: chemProduction.id,
      businessUnitId: chemicalBU.id,
      type: 'PURCHASE_REQUEST',
      processOwnerDeptCode: 'PROCUREMENT',
      dateRequested: new Date(),
      dateNeeded: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      purpose: 'Chemical reagents for Q1 2026 production',
      status: RequisitionStatus.DRAFT,
      items: {
        create: [
          {
            quantity: 100,
            unit: 'kg',
            particulars: 'Sodium Hydroxide (Industrial Grade)',
            unitCost: 150,
            subtotal: 15000,
          },
          {
            quantity: 50,
            unit: 'kg',
            particulars: 'Hydrochloric Acid (35%)',
            unitCost: 200,
            subtotal: 10000,
          },
        ],
      },
    },
  });
  await prisma.requisitionSlip.update({
    where: { id: purchaseReq.id },
    data: { requisitionNumber: `REQ-${purchaseReq.reqSeq.toString().padStart(6, '0')}` },
  });

  // Training Request
  const trainingReq = await prisma.requisitionSlip.create({
    data: {
      requisitionNumber: 'TEMP',
      requesterId: chemUser2.id,
      departmentId: chemQA.id,
      businessUnitId: chemicalBU.id,
      type: 'TRAINING',
      processOwnerDeptCode: 'HR',
      dateRequested: new Date(),
      dateNeeded: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      purpose: 'ISO 9001:2015 Internal Auditor Training',
      status: RequisitionStatus.PENDING_APPROVAL,
      currentApprovalLevel: 1,
      items: {
        create: [
          {
            quantity: 3,
            unit: 'pax',
            particulars: 'ISO 9001:2015 Internal Auditor Course - 3 days',
            unitCost: 15000,
            subtotal: 45000,
          },
        ],
      },
    },
  });
  await prisma.requisitionSlip.update({
    where: { id: trainingReq.id },
    data: { requisitionNumber: `REQ-${trainingReq.reqSeq.toString().padStart(6, '0')}` },
  });

  // Repair/Troubleshooting Request - IT
  const repairReq = await prisma.requisitionSlip.create({
    data: {
      requisitionNumber: 'TEMP',
      requesterId: itUser.id,
      departmentId: itDept.id,
      businessUnitId: adminBU.id,
      type: 'REPAIR_TROUBLESHOOTING',
      processOwnerDeptCode: 'IT',
      dateRequested: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      dateNeeded: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      purpose: 'Server room AC unit repair',
      status: RequisitionStatus.APPROVED,
      currentApprovalLevel: 3,
      items: {
        create: [
          {
            quantity: 1,
            unit: 'lot',
            particulars: 'AC Unit Repair - Server Room (compressor replacement)',
            unitCost: 35000,
            subtotal: 35000,
          },
        ],
      },
    },
  });
  await prisma.requisitionSlip.update({
    where: { id: repairReq.id },
    data: { requisitionNumber: `REQ-${repairReq.reqSeq.toString().padStart(6, '0')}` },
  });

  // Create approval records for the approved request
  await prisma.approvalRecord.createMany({
    data: [
      {
        entityType: 'RequisitionSlip',
        entityId: repairReq.id,
        approvalLevel: 1,
        approvedBy: itManager.id,
        comments: 'Approved - Critical for server operations',
      },
      {
        entityType: 'RequisitionSlip',
        entityId: repairReq.id,
        approvalLevel: 2,
        approvedBy: adminUser.id,
        comments: 'Approved - Within budget',
      },
      {
        entityType: 'RequisitionSlip',
        entityId: repairReq.id,
        approvalLevel: 3,
        approvedBy: gmUser.id,
        comments: 'Final approval granted',
      },
    ],
  });

  // Lab Testing Request
  const labReq = await prisma.requisitionSlip.create({
    data: {
      requisitionNumber: 'TEMP',
      requesterId: labUser.id,
      departmentId: laboratory.id,
      businessUnitId: rtsdBU.id,
      type: 'LAB_TESTING',
      processOwnerDeptCode: 'LABORATORY',
      dateRequested: new Date(),
      dateNeeded: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      purpose: 'Water quality testing reagents',
      status: RequisitionStatus.SUBMITTED,
      currentApprovalLevel: 0,
      items: {
        create: [
          {
            quantity: 10,
            unit: 'bottles',
            particulars: 'pH Buffer Solution Set',
            unitCost: 1200,
            subtotal: 12000,
          },
          {
            quantity: 5,
            unit: 'kits',
            particulars: 'Chlorine Test Kit',
            unitCost: 2500,
            subtotal: 12500,
          },
        ],
      },
    },
  });
  await prisma.requisitionSlip.update({
    where: { id: labReq.id },
    data: { requisitionNumber: `REQ-${labReq.reqSeq.toString().padStart(6, '0')}` },
  });

  console.log('✅ Created 4 Sample Requisitions with various types and statuses');

  // ============================================
  // Step 9: Create Sample RFPs
  // ============================================
  console.log('\n💰 Creating Sample Requisitions for Payment...');

  const rfp1 = await prisma.requisitionForPayment.create({
    data: {
      rfpNumber: 'TEMP',
      requesterId: chemUser1.id,
      departmentId: chemProduction.id,
      seriesCode: 'S',
      dateRequested: new Date(),
      dateNeeded: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      payee: 'Chemical Supplies Inc.',
      particulars: 'Chemical reagents delivery',
      amount: 25000,
      status: 'SUBMITTED',
      currentApprovalLevel: 1,
    },
  });
  await prisma.requisitionForPayment.update({
    where: { id: rfp1.id },
    data: { rfpNumber: `RFP-${rfp1.rfpSeq.toString().padStart(6, '0')}` },
  });

  const rfp2 = await prisma.requisitionForPayment.create({
    data: {
      rfpNumber: 'TEMP',
      requesterId: itUser.id,
      departmentId: itDept.id,
      seriesCode: 'U',
      dateRequested: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      dateNeeded: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      payee: 'Tech Solutions Corp.',
      particulars: 'Annual software license renewal',
      amount: 150000,
      status: 'APPROVED',
      currentApprovalLevel: 3,
    },
  });
  await prisma.requisitionForPayment.update({
    where: { id: rfp2.id },
    data: { rfpNumber: `RFP-${rfp2.rfpSeq.toString().padStart(6, '0')}` },
  });

  console.log('✅ Created 2 Sample Requisitions for Payment');

  // ============================================
  // Summary
  // ============================================
  console.log('\n🎉 Foundation Phase Seed Completed Successfully!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 SUMMARY:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🏢 Business Units:     6 (CBU, EBU, WBU, RTSD, SALES, ADMIN)');
  console.log('📁 Departments:        16 (linked to respective BUs)');
  console.log('👤 Users:              15 (across all BUs)');
  console.log('✅ Approvers:          7 (3-level hierarchy for CBU)');
  console.log('💰 Cost Centers:       4');
  console.log('📊 Projects:           2');
  console.log('💳 Bank Accounts:      3');
  console.log('📝 Requisitions:       4 (with types: Purchase, Training, Repair, Lab)');
  console.log('💵 RFPs:               2');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n🔐 TEST CREDENTIALS:');
  console.log('───────────────────────────────────────────────────────────');
  console.log('👑 General Manager:    gm@mactan.com / gm123');
  console.log('🔧 Admin:              admin@docflow.com / admin123');
  console.log('🧪 Chemical User:      chem.user1@mactan.com / password123');
  console.log('📋 CBU Unit Manager:   cbu.manager@mactan.com / password123');
  console.log('🏭 Dept Manager:       chem.prod.manager@mactan.com / password123');
  console.log('💼 Finance:            finance.manager@mactan.com / password123');
  console.log('👥 HR:                 hr.manager@mactan.com / password123');
  console.log('💻 IT:                 it.manager@mactan.com / password123');
  console.log('───────────────────────────────────────────────────────────');
  console.log('\n📋 APPROVAL HIERARCHY (Chemical BU Test Case):');
  console.log('   Level 1: Department Manager (chem.prod.manager@mactan.com)');
  console.log('   Level 2: Unit Manager (cbu.manager@mactan.com)');
  console.log('   Level 3: General Manager (gm@mactan.com)');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
