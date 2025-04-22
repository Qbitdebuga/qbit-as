import { PrismaService } from '../prisma/prisma.service';
import { format } from 'date-fns';

/**
 * Generates a sequential entry number for journal entries
 * Format: JE-YYYYMM-XXXX (JE-202504-0001)
 */
export async function generateEntryNumber(prisma: PrismaService): Promise<string> {
  const today = new Date();
  const yearMonth = format(today, 'yyyyMM');
  const prefix = `JE-${yearMonth}-`;
  
  // Get the latest entry with the same prefix
  const latestEntry = await prisma.journalEntry.findFirst({
    where: {
      entryNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      entryNumber: 'desc'
    }
  });

  let sequence = 1;
  
  if (latestEntry) {
    // Extract the sequence number from the latest entry number
    const latestSequence = parseInt(latestEntry.entryNumber.split('-')[2]);
    sequence = latestSequence + 1;
  }
  
  // Pad the sequence number with leading zeros
  const paddedSequence = sequence.toString().padStart(4, '0');
  
  return `${prefix}${paddedSequence}`;
} 