import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';
import { generateEntryNumber } from '../utils/id-generator';

@Injectable()
export class JournalEntriesRepository {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.journalEntry.findMany({
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.journalEntry.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
    });
  }

  async create(data: CreateJournalEntryDto) {
    const entryNumber = await generateEntryNumber(this.prisma);

    return this.prisma.journalEntry.create({
      data: {
        entryNumber,
        date: new Date(data.date),
        description: data.description,
        reference: data.reference,
        status: 'DRAFT',
        isAdjustment: data.isAdjustment || false,
        lines: {
          create: data.lines.map((line) => ({
            accountId: line.accountId,
            description: line.description,
            debit: line.debit ? parseFloat(line.debit.toString()) : null,
            credit: line.credit ? parseFloat(line.credit.toString()) : null,
          })),
        },
      },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateJournalEntryDto) {
    // First, update the journal entry
    const updatedEntry = await this.prisma.journalEntry.update({
      where: { id },
      data: {
        date: data.date ? new Date(data.date) : undefined,
        description: data.description,
        reference: data.reference,
        status: data.status,
        isAdjustment: data.isAdjustment,
      },
    });

    // If lines are updated, handle them separately
    if (data.lines && data.lines.length > 0) {
      // Delete existing lines
      await this.prisma.journalEntryLine.deleteMany({
        where: { journalEntryId: id },
      });

      // Create new lines
      await this.prisma.journalEntryLine.createMany({
        data: data.lines.map((line) => ({
          journalEntryId: id,
          accountId: line.accountId,
          description: line.description,
          debit: line.debit ? parseFloat(line.debit.toString()) : null,
          credit: line.credit ? parseFloat(line.credit.toString()) : null,
        })),
      });
    }

    // Return the updated entry with its lines
    return this.findOne(id);
  }

  async remove(id: string) {
    // Delete the journal entry (cascades to lines due to the relation)
    return this.prisma.journalEntry.delete({
      where: { id },
    });
  }

  async post(id: string) {
    return this.prisma.journalEntry.update({
      where: { id },
      data: {
        status: 'POSTED',
      },
    });
  }

  async reverse(id: string, reason: string) {
    const originalEntry = await this.findOne(id);
    
    if (!originalEntry || originalEntry.status !== 'POSTED') {
      throw new Error('Only posted journal entries can be reversed');
    }

    // Create a new reversing entry
    const entryNumber = await generateEntryNumber(this.prisma);
    
    return this.prisma.journalEntry.create({
      data: {
        entryNumber,
        date: new Date(),
        description: `Reversal of ${originalEntry.entryNumber}: ${reason}`,
        reference: originalEntry.reference,
        status: 'POSTED',
        isAdjustment: true,
        lines: {
          create: originalEntry.lines.map((line) => ({
            accountId: line.accountId,
            description: line.description,
            // Swap debit and credit
            debit: line.credit,
            credit: line.debit,
          })),
        },
      },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
    });
  }
} 