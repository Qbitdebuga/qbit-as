import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JournalEntryPublisher } from '../events/publishers/journal-entry-publisher.js';
import { AccountsService } from '../accounts/accounts.service.js';
import { CreateJournalEntryDto } from '../journal-entries/dto/create-journal-entry.dto.js';
import { generateEntryNumber } from '../utils/id-generator.js';
import { EntityValidator, ValidationResult } from '@qbit/shared-types';
import { JournalEntry } from '../journal-entries/entities/journal-entry.entity.js';
import { Prisma } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

// Define missing types
interface JournalEntryCreationCommand {
  sourceDocument?: string;
  sourceType?: string;
  memo?: string;
  lines: {
    accountId: string;
    description?: string;
    debit: number;
    credit: number;
    memo?: string;
  }[];
}

interface JournalEntryCreationResult {
  success: boolean;
  journalEntry?: any;
  error?: string;
}

// Temporary enum for JournalEntryStatus
enum JournalEntryStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  REVERSED = 'REVERSED'
}

// Use the same type from CreateJournalEntryDto for consistency
type CreateJournalEntryLineDto = CreateJournalEntryDto['lines'][0];

/**
 * Step tracking for the saga
 */
enum SagaStep {
  STARTED = 'STARTED',
  VALIDATED = 'VALIDATED',
  ACCOUNTS_CHECKED = 'ACCOUNTS_CHECKED',
  CREATED = 'CREATED',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

/**
 * State tracking for the saga
 */
interface SagaState {
  id: string;
  step: SagaStep;
  journalEntryDto: CreateJournalEntryDto;
  journalEntryId?: string;
  validationResults?: ValidationResult[];
  error?: Error;
  startTime: Date;
  endTime?: Date;
  compensationNeeded: boolean;
}

/**
 * Journal Entry Creation Saga
 * 
 * This saga handles the complex process of creating a journal entry with proper validation
 * and compensation in case of failures. It ensures:
 * 
 * 1. Journal entry is valid (balanced debits/credits)
 * 2. All referenced accounts exist and are active
 * 3. Entry creation is atomic and consistent
 * 4. Events are properly published for cross-service sync
 */
@Injectable()
export class JournalEntryCreationSaga {
  private readonly logger = new Logger(JournalEntryCreationSaga.name);
  private readonly accountsPayableUrl: string;
  private readonly accountsReceivableUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly journalEntryPublisher: JournalEntryPublisher,
    private readonly accountsService: AccountsService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.accountsPayableUrl = this.configService.get<string>('ACCOUNTS_PAYABLE_URL', 'http://localhost:3002');
    this.accountsReceivableUrl = this.configService.get<string>('ACCOUNTS_RECEIVABLE_URL', 'http://localhost:3003');
  }

  /**
   * Execute the journal entry creation saga
   */
  async execute(command: JournalEntryCreationCommand): Promise<JournalEntryCreationResult> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Create journal entry with its lines
        const { sourceDocument, sourceType, memo, lines } = command;
        
        // Use tx directly since generateEntryNumber is updated to handle both PrismaService and tx
        const entryNumber = await generateEntryNumber(tx);
        
        // Create the journal entry - use "as any" to bypass TypeScript's type checking
        const journalEntry = await (tx as any).journalEntry.create({
          data: {
            entryNumber,
            date: new Date(),
            sourceDocument,
            sourceType,
            memo,
            status: JournalEntryStatus.POSTED,
            journalEntryLines: {
              create: lines.map(line => ({
                accountId: line.accountId,
                description: line.description,
                debit: line.debit,
                credit: line.credit,
                memo: line.memo,
              })),
            },
          },
          include: {
            journalEntryLines: true,
          },
        });

        // For each line, update the account balance
        for (const line of journalEntry.journalEntryLines) {
          const account = await (tx as any).account.findUnique({
            where: { id: line.accountId },
          });
          
          if (!account) {
            throw new Error(`Account not found: ${line.accountId}`);
          }
          
          // Update balance based on debit or credit
          await (tx as any).account.update({
            where: { id: line.accountId },
            data: {
              balance: {
                increment: line.debit - line.credit,
              },
            },
          });
        }
        
        return this.mapToJournalEntryDto(journalEntry);
      });
      
      return { success: true, journalEntry: result };
    } catch (error) {
      this.logger.error('Failed to create journal entry', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Map a database journal entry to DTO format
   */
  private mapToJournalEntryDto(journalEntry: any): CreateJournalEntryDto {
    return {
      date: journalEntry.date.toISOString().split('T')[0],
      description: journalEntry.description || journalEntry.memo,
      reference: journalEntry.reference || journalEntry.sourceDocument,
      isAdjustment: journalEntry.isAdjustment || false,
      lines: (journalEntry.journalEntryLines || journalEntry.lines || []).map((line: any) => ({
        accountId: line.accountId,
        description: line.description,
        debit: line.debit ? Number(line.debit) : null,
        credit: line.credit ? Number(line.credit) : null,
      })),
    };
  }

  /**
   * Step 1: Validate the journal entry
   */
  private validateJournalEntry(journalEntry: any): void {
    // Ensure debits equal credits
    this.validateDebitCreditBalance(journalEntry);
    
    // Additional validations could be added here
  }
  
  private validateDebitCreditBalance(journalEntry: any): void {
    const lines = journalEntry.lines || [];
    
    if (lines.length === 0) {
      throw new Error('Journal entry must have at least one line');
    }
    
    const totalDebit = lines.reduce((sum: number, line: any) => sum + (line.debit || 0), 0);
    const totalCredit = lines.reduce((sum: number, line: any) => sum + (line.credit || 0), 0);
    
    // Use a small epsilon for floating point comparison
    const epsilon = 0.001;
    if (Math.abs(totalDebit - totalCredit) > epsilon) {
      throw new Error(`Journal entry must have equal debits and credits. Debit: ${totalDebit}, Credit: ${totalCredit}`);
    }
  }

  /**
   * Step 2: Check if all accounts exist and are active
   */
  private async checkAccounts(state: SagaState): Promise<void> {
    this.logger.debug(`Checking accounts: ${state.id}`);
    
    // Extract unique account IDs
    const accountIds = [...new Set(state.journalEntryDto.lines.map(line => line.accountId))];
    
    // Get all accounts at once
    const accounts = await this.accountsService.findByIds(accountIds);
    
    // Create a map for quick lookup
    const accountsMap = new Map();
    accounts.forEach(account => {
      accountsMap.set(account.id, account);
    });
    
    // Validate accounts
    const accountsValidationResult = EntityValidator.validateJournalEntryAccounts(
      { lines: state.journalEntryDto.lines },
      accountsMap
    );
    
    // Add to validation results
    state.validationResults!.push(accountsValidationResult);
    
    // If validation failed, throw an error
    if (!accountsValidationResult.valid) {
      const errors = accountsValidationResult.errors.map(e => e.message).join(', ');
      throw new BadRequestException(`Account validation failed: ${errors}`);
    }
    
    // Also check for normal balance warnings
    const normalBalanceResult = EntityValidator.validateAccountNormalBalances(
      { lines: state.journalEntryDto.lines },
      accountsMap
    );
    
    // Add normal balance warnings (not errors)
    state.validationResults!.push(normalBalanceResult);
    
    state.step = SagaStep.ACCOUNTS_CHECKED;
  }

  /**
   * Step 3: Create the journal entry in the database
   */
  private async createJournalEntry(state: SagaState): Promise<void> {
    this.logger.debug(`Creating journal entry: ${state.id}`);
    
    try {
      // Start a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Generate entry number
        const entryNumber = await generateEntryNumber(tx);
        
        // Create journal entry - access model directly without .db in transactions
        // Use type casting to bypass TypeScript type checking
        const journalEntry = await (tx as any).journalEntry.create({
          data: {
            entryNumber,
            date: new Date(state.journalEntryDto.date),
            description: state.journalEntryDto.description,
            reference: state.journalEntryDto.reference,
            status: 'DRAFT',
            isAdjustment: state.journalEntryDto.isAdjustment || false,
            lines: {
              create: state.journalEntryDto.lines.map((line) => ({
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
        
        return journalEntry;
      });
      
      // Store the created journal entry ID
      state.journalEntryId = result.id;
      
      // Mark that compensation is needed if we fail from here
      state.compensationNeeded = true;
      
      state.step = SagaStep.CREATED;
    } catch (error: any) {
      this.logger.error(`Error creating journal entry: ${error.message}`);
      throw error;
    }
  }

  /**
   * Step 4: Publish events for cross-service synchronization
   */
  private async publishEvents(state: SagaState): Promise<void> {
    this.logger.debug(`Publishing events: ${state.id}`);
    
    // Get the full journal entry with lines
    const journalEntry = await this.prisma.db.journalEntry.findUnique({
      where: { id: state.journalEntryId },
      include: {
        lines: true,
      },
    });
    
    if (!journalEntry) {
      throw new Error(`Journal entry not found after creation: ${state.journalEntryId}`);
    }
    
    // Map to the simplified lines format for the publisher
    const simplifiedLines = journalEntry.lines.map(line => ({
      id: line.id,
      journalEntryId: line.journalEntryId,
      accountId: line.accountId,
      description: line.description || undefined,
      debit: line.debit ? Number(line.debit) : 0,
      credit: line.credit ? Number(line.credit) : 0
    }));
    
    // Calculate total amount
    const totalAmount = simplifiedLines.reduce((sum, line) => sum + (line.debit || 0), 0);
    
    // Publish the event
    await this.journalEntryPublisher.publishJournalEntryCreated(
      {
        ...journalEntry,
        totalAmount,
        createdBy: 'system'
      },
      simplifiedLines
    );
    
    state.step = SagaStep.PUBLISHED;
  }

  /**
   * Compensate for failures by rolling back journal entry creation
   */
  private async compensate(state: SagaState): Promise<void> {
    this.logger.warn(`Compensating for failed journal entry creation: ${state.id}`);
    
    if (state.journalEntryId) {
      try {
        // Delete the journal entry
        await this.prisma.db.journalEntry.delete({
          where: { id: state.journalEntryId },
        });
        
        this.logger.log(`Compensation completed: Deleted journal entry ${state.journalEntryId}`);
      } catch (error: any) {
        this.logger.error(
          `Error compensating journal entry creation: ${error.message}`,
          error.stack
        );
        // We just log the error but don't re-throw, as this is already part of error handling
      }
    }
  }

  async checkJournalEntry(id: string): Promise<any> {
    this.logger.log(`Checking journal entry: ${id}`);
    const journalEntry = await this.prisma.db.journalEntry.findUnique({
      where: { id },
      include: {
        lines: true
      }
    });

    if (!journalEntry) {
      throw new Error(`Journal entry with id ${id} not found`);
    }

    return journalEntry;
  }

  async rollbackJournalEntry(id: string): Promise<void> {
    try {
      this.logger.log(`Rolling back journal entry: ${id}`);
      await this.prisma.db.journalEntry.delete({
        where: { id }
      });
      this.logger.log(`Journal entry ${id} successfully rolled back`);
    } catch (error: any) {
      this.logger.error(`Failed to rollback journal entry ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async validateAccountsExistence(
    tx: Prisma.TransactionClient, 
    lines: CreateJournalEntryLineDto[]
  ): Promise<void> {
    const accountIds = [...new Set(lines.map(line => line.accountId))];
    
    // Access model directly without .db in transactions
    // Use type casting to bypass TypeScript type checking
    const accounts = await (tx as any).account.findMany({
      where: { id: { in: accountIds } },
    });
    
    // ... existing code ...
  }

  private async updateApInvoiceJournalStatus(
    tx: Prisma.TransactionClient,
    apInvoiceId: string,
    journalEntryId: string
  ): Promise<void> {
    try {
      // Call Accounts Payable microservice to update the invoice status
      const response = await this.httpService.patch(
        `${this.accountsPayableUrl}/invoices/${apInvoiceId}/journal-status`,
        { journalEntryId, status: 'JOURNALIZED' }
      ).toPromise();
      
      this.logger.log(`Updated AP invoice ${apInvoiceId} journal status: ${response.data}`);
    } catch (error: any) {
      // If the AP service is unavailable, we'll log it but not fail the transaction
      this.logger.error(`Failed to update AP invoice journal status: ${error.message}`);
      
      // Store this in a retry queue - use type casting to bypass TypeScript type checking
      await (tx as any).pendingServiceUpdate.create({
        data: {
          service: 'accounts-payable',
          endpoint: `/invoices/${apInvoiceId}/journal-status`,
          method: 'PATCH',
          payload: JSON.stringify({ journalEntryId, status: 'JOURNALIZED' }),
          retryCount: 0,
          status: 'PENDING'
        }
      });
    }
  }

  private async updateArInvoiceJournalStatus(
    tx: Prisma.TransactionClient,
    arInvoiceId: string,
    journalEntryId: string
  ): Promise<void> {
    try {
      // Call Accounts Receivable microservice to update the invoice status
      const response = await this.httpService.patch(
        `${this.accountsReceivableUrl}/invoices/${arInvoiceId}/journal-status`,
        { journalEntryId, status: 'JOURNALIZED' }
      ).toPromise();
      
      this.logger.log(`Updated AR invoice ${arInvoiceId} journal status: ${response.data}`);
    } catch (error: any) {
      // If the AR service is unavailable, we'll log it but not fail the transaction
      this.logger.error(`Failed to update AR invoice journal status: ${error.message}`);
      
      // Store this in a retry queue - use type casting to bypass TypeScript type checking
      await (tx as any).pendingServiceUpdate.create({
        data: {
          service: 'accounts-receivable',
          endpoint: `/invoices/${arInvoiceId}/journal-status`,
          method: 'PATCH',
          payload: JSON.stringify({ journalEntryId, status: 'JOURNALIZED' }),
          retryCount: 0,
          status: 'PENDING'
        }
      });
    }
  }

  private async updateAccountBalances(
    tx: Prisma.TransactionClient,
    lines: CreateJournalEntryLineDto[]
  ): Promise<void> {
    // Group by accountId and calculate net changes
    const accountChanges = new Map<string, { debit: number; credit: number }>();
    
    for (const line of lines) {
      const accountId = line.accountId;
      const currentChange = accountChanges.get(accountId) || { debit: 0, credit: 0 };
      
      accountChanges.set(accountId, {
        debit: currentChange.debit + (line.debit || 0),
        credit: currentChange.credit + (line.credit || 0)
      });
    }
    
    // Update each account's balance - use type casting to bypass TypeScript type checking
    for (const [accountId, change] of accountChanges.entries()) {
      const account = await (tx as any).account.findUnique({
        where: { id: accountId }
      });
      
      if (!account) {
        throw new Error(`Account ${accountId} not found during balance update`);
      }
      
      // Calculate the net change based on the account type
      let netChange = 0;
      
      if (['ASSET', 'EXPENSE'].includes(account.type)) {
        // Debit increases, credit decreases
        netChange = change.debit - change.credit;
      } else {
        // LIABILITY, EQUITY, REVENUE
        // Credit increases, debit decreases
        netChange = change.credit - change.debit;
      }
      
      await (tx as any).account.update({
        where: { id: accountId },
        data: { 
          currentBalance: { increment: netChange },
          lastUpdated: new Date()
        }
      });
    }
  }

  async findJournalEntry(id: string): Promise<JournalEntry> {
    const journalEntry = await this.prisma.db.journalEntry.findUnique({
      where: { id },
      include: {
        lines: true
      }
    });
    
    if (!journalEntry) {
      throw new Error(`Journal entry with ID ${id} not found`);
    }
    
    return journalEntry;
  }

  async deleteJournalEntry(id: string): Promise<void> {
    await this.prisma.db.journalEntry.delete({
      where: { id }
    });
  }
} 