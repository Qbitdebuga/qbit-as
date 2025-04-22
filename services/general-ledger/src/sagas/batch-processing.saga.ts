import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JournalEntryPublisher } from '../events/publishers/journal-entry-publisher';
import { JournalEntryCreationSaga } from './journal-entry-creation.saga';
import { Prisma } from '@prisma/client';
import { BatchStatus } from '@qbit/shared-types';
import { generateBatchNumber } from '../utils/id-generator';

/**
 * Batch Processing Saga
 * 
 * This saga handles the processing of batches of journal entries.
 * It processes each journal entry in the batch using the JournalEntryCreationSaga
 * and keeps track of the overall batch status.
 */
@Injectable()
export class BatchProcessingSaga {
  private readonly logger = new Logger(BatchProcessingSaga.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly journalEntryPublisher: JournalEntryPublisher,
    private readonly journalEntryCreationSaga: JournalEntryCreationSaga
  ) {}

  /**
   * Execute the batch processing saga
   * @param batchId The ID of the batch to process
   */
  async execute(batchId: string): Promise<any> {
    this.logger.log(`Starting batch processing saga for batch: ${batchId}`);
    
    try {
      // Get the batch
      const batch = await this.prisma.batch.findUnique({
        where: { id: batchId },
        include: { items: true }
      });
      
      if (!batch) {
        throw new Error(`Batch with ID ${batchId} not found`);
      }
      
      if (batch.status !== 'DRAFT' && batch.status !== 'PENDING') {
        throw new Error(`Batch with ID ${batchId} has already been processed or is in progress`);
      }
      
      // Update batch status to PROCESSING
      await this.prisma.batch.update({
        where: { id: batchId },
        data: {
          status: BatchStatus.PROCESSING,
          startedAt: new Date()
        }
      });
      
      // Track processing metrics
      let processedCount = 0;
      let failedCount = 0;
      
      // Process each item in the batch
      for (const item of batch.items) {
        if (item.status === 'COMPLETED') {
          // Skip already processed items
          processedCount++;
          continue;
        }
        
        try {
          // Update item status to PROCESSING
          await this.prisma.batchItem.update({
            where: { id: item.id },
            data: { status: BatchStatus.PROCESSING }
          });
          
          // Parse entry data from JSON
          const entryData = item.entryData as Record<string, any>;
          
          // Use the journal entry creation saga to create the journal entry
          const result = await this.journalEntryCreationSaga.execute(entryData);
          
          // Update the batch item with the result
          await this.prisma.batchItem.update({
            where: { id: item.id },
            data: {
              journalEntryId: result.id,
              status: BatchStatus.COMPLETED,
              processedAt: new Date()
            }
          });
          
          processedCount++;
        } catch (error) {
          this.logger.error(`Error processing batch item ${item.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          
          // Update the batch item with the error
          await this.prisma.batchItem.update({
            where: { id: item.id },
            data: {
              status: BatchStatus.FAILED,
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
              processedAt: new Date()
            }
          });
          
          failedCount++;
        }
        
        // Update the batch progress
        await this.prisma.batch.update({
          where: { id: batchId },
          data: {
            processedCount,
            failedCount
          }
        });
      }
      
      // Determine final batch status
      const finalStatus = failedCount === 0 ? BatchStatus.COMPLETED : 
                          processedCount > 0 ? BatchStatus.COMPLETED : BatchStatus.FAILED;
      
      // Update the batch with the final status
      await this.prisma.batch.update({
        where: { id: batchId },
        data: {
          status: finalStatus,
          completedAt: new Date()
        }
      });
      
      // Publish batch completion event
      await this.journalEntryPublisher.publishBatchProcessed({
        batchId,
        success: failedCount === 0,
        processedCount,
        failedCount
      });
      
      this.logger.log(`Batch processing completed for batch ${batchId}. Processed: ${processedCount}, Failed: ${failedCount}`);
      
      return {
        batchId,
        success: failedCount === 0,
        processedCount,
        failedCount
      };
    } catch (error) {
      this.logger.error(`Error in batch processing saga: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Update the batch status to FAILED
      await this.prisma.batch.update({
        where: { id: batchId },
        data: {
          status: BatchStatus.FAILED,
          completedAt: new Date()
        }
      });
      
      throw error;
    }
  }

  /**
   * Create a new batch of journal entries
   */
  async createBatch(data: { description?: string, entries: any[] }): Promise<any> {
    this.logger.log(`Creating new batch with ${data.entries.length} entries`);
    
    const batchNumber = await generateBatchNumber(this.prisma);
    
    // Create the batch in a transaction
    return this.prisma.$transaction(async (prisma) => {
      // Create the batch
      const batch = await prisma.batch.create({
        data: {
          batchNumber,
          description: data.description,
          status: BatchStatus.DRAFT,
          type: 'JOURNAL_ENTRY',
          itemCount: data.entries.length,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      // Create batch items for each entry
      const batchItems = await Promise.all(
        data.entries.map(entry => 
          prisma.batchItem.create({
            data: {
              batchId: batch.id,
              entryData: entry as Prisma.InputJsonValue,
              status: BatchStatus.PENDING,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
        )
      );
      
      return {
        ...batch,
        items: batchItems
      };
    });
  }
} 