import { PrismaService } from '../prisma/prisma.service';

/**
 * Generates a sequential entry number for journal entries
 * Format: JE-YYYYMM-XXXX (JE-202504-0001)
 */
export async function generateEntryNumber(prismaOrTx: any): Promise<string> {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const prefix = `JE${year}${month}`;
  
  // Find the highest entry number with this prefix
  const db = prismaOrTx.db || prismaOrTx;
  const highestEntry = await db?.journalEntry.findFirst({
    where: {
      entryNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      entryNumber: 'desc',
    },
  });
  
  let counter = 1;
  if (highestEntry) {
    const currentCounter = parseInt(highestEntry?.entryNumber.slice(6), 10);
    counter = currentCounter + 1;
  }
  
  // Format the counter with leading zeros (5 digits)
  const formattedCounter = counter.toString().padStart(5, '0');
  
  return `${prefix}${formattedCounter}`;
}

/**
 * Generate a unique batch number for batches
 * Format: BAT-YYYYMMDD-XXXX (where XXXX is a sequential number)
 */
export async function generateBatchNumber(prismaOrTx: any): Promise<string> {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const prefix = `B${year}${month}`;
  
  // Find the highest batch number with this prefix
  const db = prismaOrTx.db || prismaOrTx;
  const highestBatch = await db?.batch.findFirst({
    where: {
      batchNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      batchNumber: 'desc',
    },
  });
  
  let counter = 1;
  if (highestBatch) {
    const currentCounter = parseInt(highestBatch?.batchNumber.slice(5), 10);
    counter = currentCounter + 1;
  }
  
  // Format the counter with leading zeros (4 digits)
  const formattedCounter = counter.toString().padStart(4, '0');
  
  return `${prefix}${formattedCounter}`;
} 