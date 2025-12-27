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
  await prisma.businessUnit.deleteMany();
  await prisma.approver.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // Create Departments
  console.log('📁 Creating departments...');
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Administration',
        code: 'ADMIN',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Finance',
        code: 'FIN',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Operations',
        code: 'OPS',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Human Resources',
        code: 'HR',
      },
    }),
    prisma.department.create({
      data: {
        name: 'IT Department',
        code: 'IT',
      },
    }),
  ]);

  const [adminDept, financeDept, opsDept, hrDept, itDept] = departments;
  console.log(`✅ Created ${departments.length} departments`);

  // Create Business Units
  console.log('🏢 Creating business units...');
  const chemBusinessUnit = await prisma.businessUnit.create({
    data: {
      unitCode: 'CHEM',
      name: 'CHEMICALS',
      description: 'Chemicals Business Unit',
      status: 'ACTIVE',
      budgetAmount: 5000000,
    },
  });

  const labBusinessUnit = await prisma.businessUnit.create({
    data: {
      unitCode: 'LAB',
      name: 'LABORATORY',
      description: 'Laboratory Business Unit',
      status: 'ACTIVE',
      budgetAmount: 3000000,
    },
  });

  const waterBusinessUnit = await prisma.businessUnit.create({
    data: {
      unitCode: 'WATER',
      name: 'WATER',
      description: 'Water Business Unit',
      status: 'ACTIVE',
      budgetAmount: 4000000,
    },
  });
  console.log('✅ Created 3 business units');

  // Create Projects
  console.log('📊 Creating projects...');
  const project1 = await prisma.project.create({
    data: {
      projectCode: 'PROJ-2025-001',
      name: 'Infrastructure Upgrade 2025',
      description: 'Company-wide infrastructure modernization',
      status: 'ACTIVE',
      businessUnitId: chemBusinessUnit.id,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      budgetAmount: 2000000,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      projectCode: 'PROJ-2025-002',
      name: 'Quality Assurance Initiative',
      description: 'Quality improvement across all units',
      status: 'ACTIVE',
      businessUnitId: labBusinessUnit.id,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-06-30'),
      budgetAmount: 1500000,
    },
  });
  console.log('✅ Created 2 projects');

  // Create Cost Centers
  console.log('💰 Creating cost centers...');
  await Promise.all([
    prisma.costCenter.create({
      data: {
        type: 'BUSINESS_UNIT',
        code: 'CHEM',
        name: 'CHEMICALS',
        description: 'Chemicals Business Unit Cost Center',
        businessUnitId: chemBusinessUnit.id,
        isActive: true,
      },
    }),
    prisma.costCenter.create({
      data: {
        type: 'BUSINESS_UNIT',
        code: 'LAB',
        name: 'LABORATORY',
        description: 'Laboratory Business Unit Cost Center',
        businessUnitId: labBusinessUnit.id,
        isActive: true,
      },
    }),
    prisma.costCenter.create({
      data: {
        type: 'BUSINESS_UNIT',
        code: 'WATER',
        name: 'WATER',
        description: 'Water Business Unit Cost Center',
        businessUnitId: waterBusinessUnit.id,
        isActive: true,
      },
    }),
    prisma.costCenter.create({
      data: {
        type: 'PROJECT',
        code: 'PROJ-2025-001',
        name: 'Infrastructure Upgrade 2025',
        description: 'Infrastructure project cost center',
        projectId: project1.id,
        isActive: true,
      },
    }),
    prisma.costCenter.create({
      data: {
        type: 'PROJECT',
        code: 'PROJ-2025-002',
        name: 'Quality Assurance Initiative',
        description: 'QA project cost center',
        projectId: project2.id,
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Created 5 cost centers');

  // Create Users
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

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

  const financeManager = await prisma.user.create({
    data: {
      email: 'finance.manager@docflow.com',
      password: hashedPassword,
      firstName: 'Finance',
      lastName: 'Manager',
      role: UserRole.FINANCE,
      departmentId: financeDept.id,
    },
  });

  const deptHead = await prisma.user.create({
    data: {
      email: 'dept.head@docflow.com',
      password: hashedPassword,
      firstName: 'Department',
      lastName: 'Head',
      role: UserRole.DEPARTMENT_HEAD,
      departmentId: opsDept.id,
    },
  });

  const approverUser = await prisma.user.create({
    data: {
      email: 'approver@docflow.com',
      password: hashedPassword,
      firstName: 'Approver',
      lastName: 'One',
      role: UserRole.APPROVER,
      departmentId: opsDept.id,
    },
  });

  const regularUser1 = await prisma.user.create({
    data: {
      email: 'user1@docflow.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.USER,
      departmentId: opsDept.id,
    },
  });

  const regularUser2 = await prisma.user.create({
    data: {
      email: 'user2@docflow.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.USER,
      departmentId: itDept.id,
    },
  });

  const hrManager = await prisma.user.create({
    data: {
      email: 'hr.manager@docflow.com',
      password: hashedPassword,
      firstName: 'HR',
      lastName: 'Manager',
      role: UserRole.DEPARTMENT_HEAD,
      departmentId: hrDept.id,
    },
  });

  console.log(`✅ Created 7 users`);

  // Update departments with head of department
  console.log('🔗 Updating department heads...');
  await prisma.department.update({
    where: { id: opsDept.id },
    data: { headOfDepartmentId: deptHead.id },
  });

  await prisma.department.update({
    where: { id: financeDept.id },
    data: { headOfDepartmentId: financeManager.id },
  });

  await prisma.department.update({
    where: { id: hrDept.id },
    data: { headOfDepartmentId: hrManager.id },
  });

  // Create Approvers with hierarchy
  // Note: Each user can only be one approver, but we set departmentId for context
  console.log('✅ Creating approvers...');
  await Promise.all([
    // Level 1 approver for Operations
    prisma.approver.create({
      data: {
        userId: approverUser.id,
        departmentId: opsDept.id,
        approvalLevel: 1,
        approvalLimit: 50000, // $50,000 limit
        isActive: true,
      },
    }),
    // Level 2 approver (Department Head)
    prisma.approver.create({
      data: {
        userId: deptHead.id,
        departmentId: opsDept.id,
        approvalLevel: 2,
        approvalLimit: 200000, // $200,000 limit
        isActive: true,
      },
    }),
    // Level 3 approver (Finance Manager - highest authority)
    prisma.approver.create({
      data: {
        userId: financeManager.id,
        departmentId: opsDept.id,
        approvalLevel: 3,
        approvalLimit: 1000000, // $1,000,000 limit
        isActive: true,
      },
    }),
    // Admin user as approver for IT
    prisma.approver.create({
      data: {
        userId: adminUser.id,
        departmentId: itDept.id,
        approvalLevel: 1,
        approvalLimit: 100000, // $100,000 limit
        isActive: true,
      },
    }),
    // HR Manager as approver
    prisma.approver.create({
      data: {
        userId: hrManager.id,
        departmentId: hrDept.id,
        approvalLevel: 1,
        approvalLimit: 75000, // $75,000 limit
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created 5 approvers with hierarchy`);

  // Create sample requisitions
  console.log('📝 Creating sample requisitions...');

  // Draft requisition
  const draftReq = await prisma.requisitionSlip.create({
    data: {
      requisitionNumber: 'TEMP',
      requesterId: regularUser1.id,
      departmentId: opsDept.id,
      dateRequested: new Date(),
      dateNeeded: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      purpose: 'Office supplies for Q1 2025',
      status: RequisitionStatus.DRAFT,
      items: {
        create: [
          {
            quantity: 10,
            unit: 'boxes',
            particulars: 'A4 Paper (500 sheets per box)',
            unitCost: 25,
            subtotal: 250,
          },
          {
            quantity: 5,
            unit: 'pcs',
            particulars: 'Whiteboard markers (black)',
            unitCost: 15,
            subtotal: 75,
          },
        ],
      },
    },
  });

  // Update with formatted number
  await prisma.requisitionSlip.update({
    where: { id: draftReq.id },
    data: { requisitionNumber: `REQ-${draftReq.reqSeq.toString().padStart(6, '0')}` },
  });

  // Submitted requisition
  const submittedReq = await prisma.requisitionSlip.create({
    data: {
      requisitionNumber: 'TEMP',
      requesterId: regularUser2.id,
      departmentId: itDept.id,
      dateRequested: new Date(),
      dateNeeded: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      purpose: 'Computer equipment upgrade',
      status: RequisitionStatus.PENDING_APPROVAL,
      currentApprovalLevel: 0,
      items: {
        create: [
          {
            quantity: 3,
            unit: 'units',
            particulars: 'Dell Laptop - i7, 16GB RAM, 512GB SSD',
            unitCost: 15000,
            subtotal: 45000,
          },
          {
            quantity: 3,
            unit: 'units',
            particulars: 'External Monitor 27" 4K',
            unitCost: 3000,
            subtotal: 9000,
          },
        ],
      },
    },
  });

  // Update with formatted number
  await prisma.requisitionSlip.update({
    where: { id: submittedReq.id },
    data: { requisitionNumber: `REQ-${submittedReq.reqSeq.toString().padStart(6, '0')}` },
  });

  // Pending approval requisition with first level approved
  const pendingReq = await prisma.requisitionSlip.create({
    data: {
      requisitionNumber: 'TEMP',
      requesterId: regularUser1.id,
      departmentId: opsDept.id,
      dateRequested: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      dateNeeded: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      purpose: 'Team building event supplies',
      status: RequisitionStatus.PENDING_APPROVAL,
      currentApprovalLevel: 1,
      items: {
        create: [
          {
            quantity: 1,
            unit: 'lot',
            particulars: 'Team building event package (50 pax)',
            unitCost: 75000,
            subtotal: 75000,
          },
          {
            quantity: 50,
            unit: 'pcs',
            particulars: 'T-shirts with company logo',
            unitCost: 300,
            subtotal: 15000,
          },
        ],
      },
    },
  });

  // Update with formatted number
  await prisma.requisitionSlip.update({
    where: { id: pendingReq.id },
    data: { requisitionNumber: `REQ-${pendingReq.reqSeq.toString().padStart(6, '0')}` },
  });

  // Create approval record for the pending requisition
  await prisma.approvalRecord.create({
    data: {
      entityType: 'RequisitionSlip',
      entityId: pendingReq.id,
      approvalLevel: 1,
      approvedBy: approverUser.id,
      comments: 'Approved - Good initiative for team morale',
    },
  });

  // Approved requisition
  const approvedReq = await prisma.requisitionSlip.create({
    data: {
      requisitionNumber: 'TEMP',
      requesterId: regularUser2.id,
      departmentId: itDept.id,
      dateRequested: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      dateNeeded: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      purpose: 'Network infrastructure maintenance',
      status: RequisitionStatus.APPROVED,
      currentApprovalLevel: 2,
      items: {
        create: [
          {
            quantity: 2,
            unit: 'units',
            particulars: 'Network Switch 48-port Gigabit',
            unitCost: 17500,
            subtotal: 35000,
          },
          {
            quantity: 500,
            unit: 'meters',
            particulars: 'Cat6 Ethernet Cable',
            unitCost: 16,
            subtotal: 8000,
          },
        ],
      },
    },
  });

  // Update with formatted number
  await prisma.requisitionSlip.update({
    where: { id: approvedReq.id },
    data: { requisitionNumber: `REQ-${approvedReq.reqSeq.toString().padStart(6, '0')}` },
  });

  // Create approval records for approved requisition
  await prisma.approvalRecord.createMany({
    data: [
      {
        entityType: 'RequisitionSlip',
        entityId: approvedReq.id,
        approvalLevel: 1,
        approvedBy: adminUser.id,
        comments: 'Approved - Critical infrastructure',
      },
      {
        entityType: 'RequisitionSlip',
        entityId: approvedReq.id,
        approvalLevel: 2,
        approvedBy: financeManager.id,
        comments: 'Final approval granted',
      },
    ],
  });

  console.log(`✅ Created 4 sample requisitions with different statuses`);

  // Create Bank Accounts
  console.log('\n💳 Creating bank accounts...');
  const bankAccounts = await Promise.all([
    prisma.bankAccount.create({
      data: {
        accountName: 'Main Operating Account',
        accountNumber: '1001-2345-6789',
        bankName: 'BDO',
        isActive: true,
      },
    }),
    prisma.bankAccount.create({
      data: {
        accountName: 'Payroll Account',
        accountNumber: '2001-3456-7890',
        bankName: 'BPI',
        isActive: true,
      },
    }),
    prisma.bankAccount.create({
      data: {
        accountName: 'Savings Account',
        accountNumber: '3001-4567-8901',
        bankName: 'PNB',
        isActive: true,
      },
    }),
    prisma.bankAccount.create({
      data: {
        accountName: 'Old Account (Inactive)',
        accountNumber: '0001-0000-0000',
        bankName: 'Metrobank',
        isActive: false,
      },
    }),
  ]);

  console.log(`✅ Created ${bankAccounts.length} bank accounts`);

  // Create Sample RFPs
  console.log('\n💰 Creating sample requisitions for payment...');

  const rfp1 = await prisma.requisitionForPayment.create({
    data: {
      rfpNumber: 'TEMP',
      requesterId: regularUser1.id,
      departmentId: adminDept.id,
      seriesCode: 'S',
      dateRequested: new Date('2025-12-20'),
      dateNeeded: new Date('2025-12-25'),
      payee: 'Acme Supplies Inc.',
      particulars: 'Office supplies and equipment',
      amount: 15000,
      status: 'DRAFT',
      currentApprovalLevel: 0,
    },
  });
  await prisma.requisitionForPayment.update({
    where: { id: rfp1.id },
    data: { rfpNumber: `RFP-${rfp1.rfpSeq.toString().padStart(6, '0')}` },
  });

  const rfp2 = await prisma.requisitionForPayment.create({
    data: {
      rfpNumber: 'TEMP',
      requesterId: regularUser1.id,
      departmentId: adminDept.id,
      seriesCode: 'U',
      dateRequested: new Date('2025-12-15'),
      dateNeeded: new Date('2025-12-20'),
      payee: 'Tech Solutions Ltd.',
      particulars: 'Software licenses',
      amount: 25000,
      status: 'SUBMITTED',
      currentApprovalLevel: 1,
    },
  });
  await prisma.requisitionForPayment.update({
    where: { id: rfp2.id },
    data: { rfpNumber: `RFP-${rfp2.rfpSeq.toString().padStart(6, '0')}` },
  });

  const rfp3 = await prisma.requisitionForPayment.create({
    data: {
      rfpNumber: 'TEMP',
      requesterId: regularUser1.id,
      departmentId: financeDept.id,
      seriesCode: 'G',
      dateRequested: new Date('2025-12-18'),
      dateNeeded: new Date('2025-12-22'),
      payee: 'Consulting Partners Co.',
      particulars: 'Professional services',
      amount: 50000,
      status: 'APPROVED',
      currentApprovalLevel: 2,
    },
  });
  await prisma.requisitionForPayment.update({
    where: { id: rfp3.id },
    data: { rfpNumber: `RFP-${rfp3.rfpSeq.toString().padStart(6, '0')}` },
  });

  console.log(`✅ Created 3 sample requisitions for payment`);

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Departments: ${departments.length}`);
  console.log(`   - Users: 7`);
  console.log(`   - Approvers: 5 (with 3-level hierarchy for Ops dept)`);
  console.log(`   - Requisitions: 4 (various statuses)`);
  console.log(`   - Approval Records: 3`);
  console.log(`   - Bank Accounts: ${bankAccounts.length}`);
  console.log(`   - Requisitions for Payment: 3`);
  console.log('\n🔐 Test Credentials:');
  console.log('   Admin: admin@docflow.com / admin123');
  console.log('   User: user1@docflow.com / password123');
  console.log('   Approver: approver@docflow.com / password123');
  console.log('   Finance Manager: finance.manager@docflow.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
