import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { BatchProcessingSaga } from '../sagas/batch-processing.saga.js';
import { BatchStatus, JournalEntryBatchCreate } from '@qbit/shared-types';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly batchProcessingSaga: BatchProcessingSaga,
  ) {}

  async create(data: JournalEntryBatchCreate, userId?: string): Promise<any> {
    this.logger.log(`Creating new batch with ${data.entries.length} entries`);
    
    // Use the saga to create the batch
    const batch = await this.batchProcessingSaga.createBatch({
      description: data.description,
      entries: data.entries
    });
    
    return {
      id: batch.id,
      batchNumber: batch.batchNumber,
      description: batch.description,
      status: batch.status,
      itemCount: batch.itemCount,
    };
  }

  // Helper function to get batch with appropriate query parameters
  private getBatchQuery(status?: string, type?: string, dateRange?: { from: Date, to: Date }, skip = 0, take = 10) {
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (dateRange) {
      where.createdAt = {
        gte: dateRange.from,
        lte: dateRange.to
      };
    }
    
    return {
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        items: true
      }
    };
  }

  async findAll(status?: string, type?: string, dateRange?: { from: Date, to: Date }, skip = 0, take = 10) {
    const query = this.getBatchQuery(status, type, dateRange, skip, take);
    
    const [batches, totalCount] = await Promise.all([
      this.prisma.db.batch.findMany(query),
      this.prisma.db.batch.count({ where: query.where })
    ]);
    
    return { 
      batches,
      totalCount,
      journalEntryCount: await this.prisma.db.batch.count({ where: { type: 'JOURNAL_ENTRY' } })
    };
  }

  async findOne(id: string) {
    const batch = await this.prisma.db.batch.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            journalEntry: true
          }
        }
      }
    });
    
    if (!batch) {
      return null;
    }
    
    // For each batch item, if its a journal entry, enrich with account data
    const enrichedItems = await Promise.all(
      batch.items.map(async (item: any) => {
        let journalEntry = null;
        
        if (item.type === 'JOURNAL_ENTRY' && item.journalEntryId) {
          journalEntry = await this.prisma.db.journalEntry.findUnique({
            where: { id: item.journalEntryId },
            include: {
              lines: {
                include: {
                  account: true
                }
              }
            }
          });
        }
        
        return {
          ...item,
          journalEntry
        };
      })
    );
    
    return {
      ...batch,
      items: enrichedItems
    };
  }

  async process(id: string): Promise<any> {
    this.logger.log(`Processing batch with ID: ${id}`);
    
    const batch = await this.prisma.db.batch.findUnique({
      where: { id },
    });
    
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    
    if (batch.status !== BatchStatus.DRAFT && batch.status !== BatchStatus.PENDING) {
      throw new Error(`Batch with ID ${id} has already been processed or is in progress`);
    }
    
    // Start the batch processing in the background
    this.batchProcessingSaga.execute(id).catch(error => {
      this.logger.error(`Error processing batch ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    });
    
    return {
      id: batch.id,
      status: BatchStatus.PROCESSING,
      message: 'Batch processing started',
    };
  }

  async cancel(id: string): Promise<any> {
    this.logger.log(`Canceling batch with ID: ${id}`);
    
    const batch = await this.prisma.db.batch.findUnique({
      where: { id },
    });
    
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    
    if (batch.status !== BatchStatus.DRAFT && batch.status !== BatchStatus.PENDING) {
      throw new Error(`Cannot cancel batch with ID ${id} because it is not in DRAFT or PENDING status`);
    }
    
    const updatedBatch = await this.prisma.db.batch.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });
    
    return {
      id: updatedBatch.id,
      status: updatedBatch.status,
      message: 'Batch cancelled successfully',
    };
  }

  async approve(id: string) {
    const batch = await this.prisma.db.batch.findUnique({
      where: { id },
      include: {
        items: true
      }
    });
    
    if (!batch) {
      return null;
    }
    
    // Update batch status to APPROVED
    return this.prisma.db.batch.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date()
      },
      include: {
        items: true
      }
    });
  }

  async reject(id: string, reason: string) {
    const batch = await this.prisma.db.batch.findUnique({
      where: { id },
      include: {
        items: true
      }
    });
    
    if (!batch) {
      return null;
    }
    
    // Update batch status to REJECTED
    const updatedBatch = await this.prisma.db.batch.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason
      },
      include: {
        items: true
      }
    });
    
    return updatedBatch;
  }
} 