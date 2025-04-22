import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BatchProcessingSaga } from '../sagas/batch-processing.saga';
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

  async findAll(skip = 0, take = 10): Promise<any> {
    this.logger.log('Retrieving all batches');
    
    const [batches, total] = await Promise.all([
      this.prisma.batch.findMany({
        where: { type: 'JOURNAL_ENTRY' },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.batch.count({ where: { type: 'JOURNAL_ENTRY' } }),
    ]);
    
    return {
      data: batches,
      meta: {
        total,
        skip,
        take,
      },
    };
  }

  async findOne(id: string): Promise<any> {
    this.logger.log(`Retrieving batch with ID: ${id}`);
    
    const batch = await this.prisma.batch.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });
    
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    
    // Map batch items to a more structured response
    const items = await Promise.all(
      batch.items.map(async (item) => {
        let journalEntry = null;
        
        if (item.journalEntryId) {
          journalEntry = await this.prisma.journalEntry.findUnique({
            where: { id: item.journalEntryId },
            include: { lines: true },
          });
        }
        
        return {
          id: item.id,
          status: item.status,
          errorMessage: item.errorMessage,
          processedAt: item.processedAt,
          journalEntry: journalEntry ? {
            id: journalEntry.id,
            entryNumber: journalEntry.entryNumber,
            date: journalEntry.date,
            status: journalEntry.status,
            lineCount: journalEntry.lines.length,
          } : null,
          entryData: item.entryData,
        };
      })
    );
    
    return {
      id: batch.id,
      batchNumber: batch.batchNumber,
      description: batch.description,
      status: batch.status,
      itemCount: batch.itemCount,
      processedCount: batch.processedCount,
      failedCount: batch.failedCount,
      startedAt: batch.startedAt,
      completedAt: batch.completedAt,
      createdAt: batch.createdAt,
      updatedAt: batch.updatedAt,
      items,
    };
  }

  async process(id: string): Promise<any> {
    this.logger.log(`Processing batch with ID: ${id}`);
    
    const batch = await this.prisma.batch.findUnique({
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
    
    const batch = await this.prisma.batch.findUnique({
      where: { id },
    });
    
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    
    if (batch.status !== BatchStatus.DRAFT && batch.status !== BatchStatus.PENDING) {
      throw new Error(`Cannot cancel batch with ID ${id} because it is not in DRAFT or PENDING status`);
    }
    
    const updatedBatch = await this.prisma.batch.update({
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
} 