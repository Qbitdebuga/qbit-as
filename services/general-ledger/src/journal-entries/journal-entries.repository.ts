import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto.js';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto.js';
import { generateEntryNumber } from '../utils/id-generator.js';

@Injectable()
export class JournalEntriesRepository {
  private readonly logger = new Logger(JournalEntriesRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: any = {}) {
    return this.prisma.db.journalEntry.findMany({
      where: params.where,
      include: { lines: true },
      orderBy: { date: 'desc' },
      skip: params.skip,
      take: params.take
    });
  }

  async findOne(id: string) {
    return this.prisma.db.journalEntry.findUnique({
      where: { id },
      include: {
        lines: {
          include: { account: true }
        }
      }
    });
  }

  async create(data: CreateJournalEntryDto) {
    const entryNumber = await generateEntryNumber(this.prisma);

    return this.prisma.db.journalEntry.create({
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
    const updatedEntry = await this.prisma.db.journalEntry.update({
      where: { id },
      data: {
        date: data.date ? new Date(data.date) : undefined,
        description: data.description,
        reference: data.reference,
        status: data.status,
        isAdjustment: data.isAdjustment,
      },
      include: {
        lines: true
      }
    });

    if (data.lines) {
      // Delete existing lines
      await this.prisma.db.journalEntryLine.deleteMany({
        where: { journalEntryId: id }
      });

      // Create new lines
      await this.prisma.db.journalEntryLine.createMany({
        data: data.lines.map((line: any) => ({
          journalEntryId: id,
          accountId: line.accountId,
          description: line.description || '',
          debit: line.debit ? parseFloat(line.debit.toString()) : null,
          credit: line.credit ? parseFloat(line.credit.toString()) : null,
        }))
      });
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    return this.prisma.db.journalEntry.delete({
      where: { id }
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.db.journalEntry.update({
      where: { id },
      data: { status }
    });
  }

  async createReversalEntry(originalEntryId: string) {
    const originalEntry = await this.findOne(originalEntryId);
    
    if (!originalEntry) {
      throw new Error(`Journal entry with id ${originalEntryId} not found`);
    }

    return this.prisma.db.journalEntry.create({
      data: {
        date: new Date(),
        reference: `REV-${originalEntry.reference || originalEntry.id}`,
        description: `Reversal of: ${originalEntry.description || 'journal entry'}`,
        status: 'POSTED',
        isAdjustment: originalEntry.isAdjustment,
        lines: {
          create: originalEntry.lines.map((line: any) => ({
            accountId: line.accountId,
            description: `Reversal: ${line.description || ''}`,
            // Swap debits and credits
            debit: line.credit || 0,
            credit: line.debit || 0
          }))
        }
      },
      include: {
        lines: {
          include: { account: true }
        }
      }
    });
  }
} 