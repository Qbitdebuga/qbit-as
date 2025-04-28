import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { PrismaService } from '../../prisma/prisma.service.js';

interface JournalEntryEventPayload {
  id: string;
  serviceSource: string;
  entityType: string;
  timestamp: string;
  date?: Date;
  reference?: string;
  description?: string;
  status?: string;
  totalAmount?: number;
  lines?: any[];
}

/**
 * Consumer for journal entry events from the General Ledger Service
 */
@Injectable()
export class JournalEntryConsumer implements OnModuleInit {
  private readonly logger = new Logger(JournalEntryConsumer.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Setup event connections when the module initializes
   */
  async onModuleInit() {
    this.logger.log('Journal Entry event consumer initialized');
  }

  /**
   * Handle journal-entry.created events
   */
  @EventPattern('journal-entry.created')
  async handleJournalEntryCreated(@Payload() payload: JournalEntryEventPayload, @Ctx() context: RmqContext): Promise<void> {
    try {
      this.logger.log(`Received journal-entry.created event for entry ${payload.id}`);
      
      // TODO: Implement journal entry creation logic
      // Example: Update financial data based on the journal entry
      
      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(`Error handling journal-entry.created event: ${error.message}`, error.stack);
    }
  }

  /**
   * Handle journal-entry.updated events
   */
  @EventPattern('journal-entry.updated')
  async handleJournalEntryUpdated(@Payload() payload: JournalEntryEventPayload, @Ctx() context: RmqContext): Promise<void> {
    try {
      this.logger.log(`Received journal-entry.updated event for entry ${payload.id}`);
      
      // TODO: Implement journal entry update logic
      
      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(`Error handling journal-entry.updated event: ${error.message}`, error.stack);
    }
  }

  /**
   * Handle journal-entry.deleted events
   */
  @EventPattern('journal-entry.deleted')
  async handleJournalEntryDeleted(@Payload() payload: JournalEntryEventPayload, @Ctx() context: RmqContext): Promise<void> {
    try {
      this.logger.log(`Received journal-entry.deleted event for entry ${payload.id}`);
      
      // TODO: Implement journal entry deletion logic
      
      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(`Error handling journal-entry.deleted event: ${error.message}`, error.stack);
    }
  }

  /**
   * Handle journal-entry.posted events
   */
  @EventPattern('journal-entry.posted')
  async handleJournalEntryPosted(@Payload() payload: JournalEntryEventPayload, @Ctx() context: RmqContext): Promise<void> {
    try {
      this.logger.log(`Received journal-entry.posted event for entry ${payload.id}`);
      
      // TODO: Implement journal entry posted logic
      // Example: Update financial reports based on the posted journal entry
      
      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(`Error handling journal-entry.posted event: ${error.message}`, error.stack);
    }
  }
} 