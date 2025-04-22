import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JournalEntry } from '@prisma/client';
import { 
  JournalEntryWithExtraFields, 
  JournalEntryLine,
  JournalEntryCreatedPayload,
  JournalEntryUpdatedPayload,
  JournalEntryDeletedPayload,
  JournalEntryPostedPayload
} from '../models/journal-entry.model';
import { InjectClient } from '../decorators/inject-client.decorator';
import { BatchProcessResult } from '@qbit/shared-types';

/**
 * Publisher for journal entry-related events
 */
@Injectable()
export class JournalEntryPublisher {
  private readonly logger = new Logger(JournalEntryPublisher.name);

  constructor(
    @InjectClient('JOURNAL_ENTRY_SERVICE') private readonly client: ClientProxy,
  ) {}

  /**
   * Publish a journal-entry.created event
   */
  async publishJournalEntryCreated(
    journalEntry: JournalEntryWithExtraFields,
    lines: JournalEntryLine[]
  ): Promise<void> {
    try {
      const payload: JournalEntryCreatedPayload = {
        id: journalEntry.id,
        date: journalEntry.date,
        reference: journalEntry.reference || '',
        description: journalEntry.description || '',
        status: journalEntry.status,
        totalAmount: journalEntry.totalAmount || 0,
        createdBy: journalEntry.createdBy || 'system',
        lines,
        serviceSource: 'general-ledger',
        entityType: 'journal-entry',
        timestamp: new Date().toISOString(),
      };
      
      await this.client.emit('journal-entry.created', payload).toPromise();
      this.logger.log(`Published journal-entry.created event for entry ${journalEntry.id}`);
    } catch (error: any) {
      this.logger.error(`Failed to publish journal-entry.created event for entry ${journalEntry.id}`, error.stack);
    }
  }

  /**
   * Publish a journal-entry.updated event
   */
  async publishJournalEntryUpdated(
    journalEntry: JournalEntryWithExtraFields,
    lines: JournalEntryLine[]
  ): Promise<void> {
    try {
      const payload: JournalEntryUpdatedPayload = {
        id: journalEntry.id,
        date: journalEntry.date,
        reference: journalEntry.reference || '',
        description: journalEntry.description || '',
        status: journalEntry.status,
        totalAmount: journalEntry.totalAmount || 0,
        updatedBy: journalEntry.updatedBy || 'system',
        lines,
        serviceSource: 'general-ledger',
        entityType: 'journal-entry',
        timestamp: new Date().toISOString(),
      };
      
      await this.client.emit('journal-entry.updated', payload).toPromise();
      this.logger.log(`Published journal-entry.updated event for entry ${journalEntry.id}`);
    } catch (error: any) {
      this.logger.error(`Failed to publish journal-entry.updated event for entry ${journalEntry.id}`, error.stack);
    }
  }

  /**
   * Publish a journal-entry.deleted event
   */
  async publishJournalEntryDeleted(journalEntryId: string): Promise<void> {
    try {
      const payload: JournalEntryDeletedPayload = {
        id: journalEntryId,
        serviceSource: 'general-ledger',
        entityType: 'journal-entry',
        timestamp: new Date().toISOString(),
      };
      
      await this.client.emit('journal-entry.deleted', payload).toPromise();
      this.logger.log(`Published journal-entry.deleted event for entry ${journalEntryId}`);
    } catch (error: any) {
      this.logger.error(`Failed to publish journal-entry.deleted event for entry ${journalEntryId}`, error.stack);
    }
  }

  /**
   * Publish a journal-entry.posted event
   */
  async publishJournalEntryPosted(journalEntry: JournalEntry): Promise<void> {
    try {
      const payload: JournalEntryPostedPayload = {
        id: journalEntry.id,
        date: journalEntry.date,
        reference: journalEntry.reference || '',
        status: journalEntry.status,
        serviceSource: 'general-ledger',
        entityType: 'journal-entry',
        timestamp: new Date().toISOString(),
      };
      
      await this.client.emit('journal-entry.posted', payload).toPromise();
      this.logger.log(`Published journal-entry.posted event for entry ${journalEntry.id}`);
    } catch (error: any) {
      this.logger.error(`Failed to publish journal-entry.posted event for entry ${journalEntry.id}`, error.stack);
    }
  }

  async publishJournalEntryStatusChanged(journalEntry: JournalEntry, previousStatus: string): Promise<void> {
    this.logger.log(`Publishing journal.entry.status.changed event for entry: ${journalEntry.id}`);
    
    try {
      await this.client.emit('journal.entry.status.changed', {
        serviceSource: 'general-ledger',
        entityType: 'journal-entry',
        timestamp: new Date().toISOString(),
        data: {
          journalEntryId: journalEntry.id,
          entryNumber: journalEntry.entryNumber,
          previousStatus,
          currentStatus: journalEntry.status,
          updatedAt: journalEntry.updatedAt.toISOString()
        }
      });
      
      this.logger.debug(`Successfully published journal.entry.status.changed event for entry: ${journalEntry.id}`);
    } catch (error) {
      this.logger.error(`Failed to publish journal.entry.status.changed event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async publishBatchProcessed(result: BatchProcessResult): Promise<void> {
    this.logger.log(`Publishing batch.processed event for batch: ${result.batchId}`);
    
    try {
      await this.client.emit('batch.processed', {
        serviceSource: 'general-ledger',
        entityType: 'batch',
        timestamp: new Date().toISOString(),
        data: {
          batchId: result.batchId,
          success: result.success,
          processedCount: result.processedCount,
          failedCount: result.failedCount,
          errors: result.errors || []
        }
      });
      
      this.logger.debug(`Successfully published batch.processed event for batch: ${result.batchId}`);
    } catch (error) {
      this.logger.error(`Failed to publish batch.processed event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 