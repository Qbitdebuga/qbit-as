import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JournalEntriesRepository } from './journal-entries.repository';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';

@Injectable()
export class JournalEntriesService {
  constructor(private readonly repository: JournalEntriesRepository) {}

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
    
    return this.repository.create(createJournalEntryDto);
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
    
    return this.repository.update(id, updateJournalEntryDto);
  }

  async remove(id: string) {
    // Check if the entry exists
    const entry = await this.findOne(id);
    
    // Only draft entries can be deleted
    if (entry.status !== 'DRAFT') {
      throw new BadRequestException('Only draft journal entries can be deleted');
    }
    
    return this.repository.remove(id);
  }

  async post(id: string) {
    // Check if the entry exists and is in draft status
    const entry = await this.findOne(id);
    
    if (entry.status !== 'DRAFT') {
      throw new BadRequestException('Only draft journal entries can be posted');
    }
    
    // Ensure the entry is balanced
    if (!this.isBalanced(entry.lines)) {
      throw new BadRequestException('Journal entry must be balanced (debits = credits) to be posted');
    }
    
    return this.repository.post(id);
  }

  async reverse(id: string, reason: string) {
    // Check if the entry exists and is posted
    const entry = await this.findOne(id);
    
    if (entry.status !== 'POSTED') {
      throw new BadRequestException('Only posted journal entries can be reversed');
    }
    
    return this.repository.reverse(id, reason);
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
} 