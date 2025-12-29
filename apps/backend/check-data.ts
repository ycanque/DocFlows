import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from 'dotenv';

config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkData() {
  const requisitions = await prisma.requisitionSlip.findMany({
    select: {
      dateRequested: true,
      requisitionNumber: true,
    },
    orderBy: {
      dateRequested: 'asc',
    },
  });

  requisitions.forEach((req) => {
    console.log(`- ${req.requisitionNumber}: ${req.dateRequested}`);
  });

  await prisma.$disconnect();
}

checkData().catch(console.error);
