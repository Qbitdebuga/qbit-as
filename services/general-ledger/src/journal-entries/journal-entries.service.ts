import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { JournalEntriesRepository } from './journal-entries.repository.js';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto.js';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto.js';
import { JournalEntryPublisher } from '../events/publishers/journal-entry-publisher.js';
import { JournalEntryLine } from '../events/models/journal-entry.model.js';
import { JournalEntry } from './entities/journal-entry.entity.js';

@Injectable()
export class JournalEntriesService {
  private readonly logger = new Logger(JournalEntriesService.name);

  constructor(
    private readonly repository: JournalEntriesRepository,
    private readonly journalEntryPublisher: JournalEntryPublisher
  ) {}

  async findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const entry = await this.repository.findOne(id);
    if (!entry) {
      throw new NotFoundException(`Journal entry with ID ${id} not found`);
    }
    return entry;
  }

  async create(createJournalEntryDto: CreateJournalEntryDto) {
    // Validate that the entry is balanced
    if (!this.isBalanced(createJournalEntryDto.lines)) {
      throw new BadRequestException('Journal entry must be balanced (debits = credits)');
    }
    
    const journalEntry = await this.repository.create(createJournalEntryDto);

    try {
      // Publish journal-entry.created event
      if (journalEntry.lines) {
        const simplifiedLines: JournalEntryLine[] = journalEntry.lines.map(line => ({
          id: line.id,
          journalEntryId: line.journalEntryId,
          accountId: line.accountId,
          description: line.description || undefined,
          debit: line.debit ? Number(line.debit) : 0,
          credit: line.credit ? Number(line.credit) : 0
        }));
        
        await this.journalEntryPublisher.publishJournalEntryCreated(
          {
            ...journalEntry,
            totalAmount: this.calculateTotalAmount(journalEntry.lines),
            createdBy: 'system'
          }, 
          simplifiedLines
        );
      }
    } catch (error: any) {
      this.logger.warn(`Failed to publish journal-entry.created event: ${error.message}`);
      // Don't fail the operation if publishing fails
    }
    
    return journalEntry;
  }

  async update(id: string, updateJournalEntryDto: UpdateJournalEntryDto) {
    // Check if the entry exists
    await this.findOne(id);
    
    // If lines are updated, validate that they are balanced
    if (updateJournalEntryDto.lines && updateJournalEntryDto.lines.length > 0) {
      if (!this.isBalanced(updateJournalEntryDto.lines)) {
        throw new BadRequestException('Journal entry must be balanced (debits = credits)');
      }
    }
    
    const updatedEntry = await this.repository.update(id, updateJournalEntryDto);

    try {
      // Publish journal-entry.updated event
      if (updatedEntry && updatedEntry.lines) {
        const simplifiedLines: JournalEntryLine[] = updatedEntry.lines.map(line => ({
          id: line.id,
          journalEntryId: line.journalEntryId,
          accountId: line.accountId,
          description: line.description || undefined,
          debit: line.debit ? Number(line.debit) : 0,
          credit: line.credit ? Number(line.credit) : 0
        }));
        
        await this.journalEntryPublisher.publishJournalEntryUpdated(
          {
            ...updatedEntry,
            totalAmount: this.calculateTotalAmount(updatedEntry.lines),
            updatedBy: 'system'
          }, 
          simplifiedLines
        );
      }
    } catch (error: any) {
      this.logger.warn(`Failed to publish journal-entry.updated event: ${error.message}`);
      // Don't fail the operation if publishing fails
    }
    
    return updatedEntry;
  }

  async remove(id: string) {
    // Check if the entry exists
    const entry = await this.findOne(id);
    
    // Only draft entries can be deleted
    if (entry.status !== 'DRAFT') {
      throw new BadRequestException('Only draft journal entries can be deleted');
    }
    
    const deletedEntry = await this.repository.remove(id);

    try {
      // Publish journal-entry.deleted event
      await this.journalEntryPublisher.publishJournalEntryDeleted(id);
    } catch (error: any) {
      this.logger.warn(`Failed to publish journal-entry.deleted event: ${error.message}`);
      // Don't fail the operation if publishing fails
    }
    
    return deletedEntry;
  }

  async post(id: string): Promise<JournalEntry> {
    const journalEntry = await this.findOne(id);
    
    if (journalEntry.status !== 'DRAFT') {
      throw new BadRequestException(`Journal entry must be in DRAFT status to post. Current status: ${journalEntry.status}`);
    }
    
    // Check for balanced entry (debits = credits)
    this.verifyEntryIsBalanced(journalEntry);
    
    // Update status to POSTED
    const postedEntry = await this.repository.updateStatus(id, 'POSTED');
    
    // Get the journal entry with its lines to pass to the publisher
    const postedEntryWithLines = await this.repository.findOne(id);
    
    // Now include the lines in the publisher call
    this.journalEntryPublisher.publishJournalEntryUpdated(postedEntry, postedEntryWithLines.lines);
    
    return postedEntry;
  }

  async reverse(id: string): Promise<JournalEntry> {
    const journalEntry = await this.findOne(id);
    
    if (journalEntry.status !== 'POSTED') {
      throw new BadRequestException('Only posted journal entries can be reversed');
    }
    
    // Create a reversal entry using the repository
    return this.repository.createReversalEntry(id);
  }

  /**
   * Validates if the journal entry lines are balanced (debits = credits)
   */
  private isBalanced(lines: any[]): boolean {
    if (!lines || lines.length === 0) {
      return false;
    }
    
    let totalDebits = 0;
    let totalCredits = 0;
    
    for (const line of lines) {
      if (line.debit) {
        totalDebits += parseFloat(line.debit.toString());
      }
      if (line.credit) {
        totalCredits += parseFloat(line.credit.toString());
      }
    }
    
    // Allow for small rounding errors
    return Math.abs(totalDebits - totalCredits) < 0.001;
  }

  /**
   * Calculates the total amount of a journal entry (sum of debits or credits)
   */
  private calculateTotalAmount(lines: any[]): number {
    if (!lines || lines.length === 0) {
      return 0;
    }
    
    let totalDebits = 0;
    
    for (const line of lines) {
      if (line.debit) {
        totalDebits += parseFloat(line.debit.toString());
      }
    }
    
    return totalDebits;
  }

  private verifyEntryIsBalanced(entry: JournalEntry) {
    if (!this.isBalanced(entry.lines)) {
      throw new BadRequestException('Journal entry must be balanced (debits = credits) to be posted');
    }
  }
} 