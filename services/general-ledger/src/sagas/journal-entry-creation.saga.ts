import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JournalEntryPublisher } from '../events/publishers/journal-entry-publisher';
import { AccountsService } from '../accounts/accounts.service';
import { CreateJournalEntryDto } from '../journal-entries/dto/create-journal-entry.dto';
import { generateEntryNumber } from '../utils/id-generator';
import { EntityValidator, ValidationResult } from '@qbit/shared-types';

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

  constructor(
    private readonly prisma: PrismaService,
    private readonly journalEntryPublisher: JournalEntryPublisher,
    private readonly accountsService: AccountsService
  ) {}

  /**
   * Execute the journal entry creation saga
   */
  async execute(createJournalEntryDto: CreateJournalEntryDto): Promise<any> {
    // Initialize saga state
    const sagaState: SagaState = {
      id: `je-creation-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      step: SagaStep.STARTED,
      journalEntryDto: createJournalEntryDto,
      startTime: new Date(),
      compensationNeeded: false
    };

    this.logger.log(`Starting journal entry creation saga: ${sagaState.id}`);
    
    try {
      // Step 1: Validate the journal entry
      await this.validateJournalEntry(sagaState);
      
      // Step 2: Check account existence and status
      await this.checkAccounts(sagaState);
      
      // Step 3: Create the journal entry in the database
      await this.createJournalEntry(sagaState);
      
      // Step 4: Publish events
      await this.publishEvents(sagaState);
      
      // Complete the saga
      sagaState.step = SagaStep.COMPLETED;
      sagaState.endTime = new Date();
      
      this.logger.log(`Journal entry creation saga completed: ${sagaState.id}`);
      
      // Return the created journal entry ID
      return { 
        id: sagaState.journalEntryId,
        success: true,
        message: 'Journal entry created successfully' 
      };
    } catch (error) {
      this.logger.error(`Error in journal entry creation saga: ${error.message}`, error.stack);
      
      sagaState.step = SagaStep.FAILED;
      sagaState.error = error;
      sagaState.endTime = new Date();
      
      // If we've already created the journal entry, we need to compensate
      if (sagaState.compensationNeeded) {
        await this.compensate(sagaState);
      }
      
      if (error instanceof BadRequestException) {
        throw error; // Re-throw validation errors
      }
      
      throw new Error(`Failed to create journal entry: ${error.message}`);
    }
  }

  /**
   * Step 1: Validate the journal entry
   */
  private async validateJournalEntry(state: SagaState): Promise<void> {
    this.logger.debug(`Validating journal entry: ${state.id}`);
    
    const validationResults: ValidationResult[] = [];
    
    // Validate entry balance
    const balanceResult = EntityValidator.validateJournalEntryBalance({
      lines: state.journalEntryDto.lines.map(line => ({
        id: '', // ID not assigned yet
        debit: line.debit ? Number(line.debit) : 0,
        credit: line.credit ? Number(line.credit) : 0
      }))
    });
    
    validationResults.push(balanceResult);
    
    // Store validation results for later use
    state.validationResults = validationResults;
    
    // If any validation failed, throw an error
    if (!balanceResult.valid) {
      const errors = balanceResult.errors.map(e => e.message).join(', ');
      throw new BadRequestException(`Journal entry validation failed: ${errors}`);
    }
    
    state.step = SagaStep.VALIDATED;
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
    state.validationResults.push(accountsValidationResult);
    
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
    state.validationResults.push(normalBalanceResult);
    
    state.step = SagaStep.ACCOUNTS_CHECKED;
  }

  /**
   * Step 3: Create the journal entry in the database
   */
  private async createJournalEntry(state: SagaState): Promise<void> {
    this.logger.debug(`Creating journal entry: ${state.id}`);
    
    try {
      // Start a transaction
      const result = await this.prisma.$transaction(async (prisma) => {
        // Generate entry number
        const entryNumber = await generateEntryNumber(prisma);
        
        // Create journal entry
        const journalEntry = await prisma.journalEntry.create({
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
    } catch (error) {
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
    const journalEntry = await this.prisma.journalEntry.findUnique({
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
        await this.prisma.journalEntry.delete({
          where: { id: state.journalEntryId },
        });
        
        this.logger.log(`Compensation completed: Deleted journal entry ${state.journalEntryId}`);
      } catch (error) {
        this.logger.error(
          `Error compensating journal entry creation: ${error.message}`,
          error.stack
        );
        // We just log the error but don't re-throw, as this is already part of error handling
      }
    }
  }
} 