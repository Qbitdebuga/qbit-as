import { PrismaService } from '../prisma/prisma.service';
import { format } from 'date-fns';
import { Prisma } from '@prisma/client';

/**
 * Generates a sequential entry number for journal entries
 * Format: JE-YYYYMM-XXXX (JE-202504-0001)
 */
export async function generateEntryNumber(prisma: PrismaService): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Get the highest entry number for today
  const highestEntry = await prisma.journalEntry.findFirst({
    where: {
      entryNumber: {
        startsWith: `JE-${dateStr}`,
      },
    },
    orderBy: {
      entryNumber: 'desc',
    },
  });
  
  let sequence = 1;
  if (highestEntry) {
    const currentSequence = parseInt(highestEntry.entryNumber.split('-')[2]);
    sequence = currentSequence + 1;
  }
  
  return `JE-${dateStr}-${sequence.toString().padStart(4, '0')}`;
}

/**
 * Generate a unique batch number for batches
 * Format: BAT-YYYYMMDD-XXXX (where XXXX is a sequential number)
 */
export async function generateBatchNumber(prisma: PrismaService): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Get the highest batch number for today
  const highestBatch = await prisma.batch.findFirst({
    where: {
      batchNumber: {
        startsWith: `BAT-${dateStr}`,
      },
    },
    orderBy: {
      batchNumber: 'desc',
    },
  });
  
  let sequence = 1;
  if (highestBatch) {
    const currentSequence = parseInt(highestBatch.batchNumber.split('-')[2]);
    sequence = currentSequence + 1;
  }
  
  return `BAT-${dateStr}-${sequence.toString().padStart(4, '0')}`;
} 