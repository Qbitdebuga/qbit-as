import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { PrismaService } from '../../prisma/prisma.service';

// Sample account event payload structure
interface AccountEventPayload {
  serviceSource: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  data: {
    id: string;
    code: string;
    name: string;
    type: string;
    subtype: string;
    isActive: boolean;
  };
}

/**
 * Consumer for account events from the General Ledger Service
 */
@Injectable()
export class AccountEventConsumer implements OnModuleInit {
  private readonly logger = new Logger(AccountEventConsumer.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Setup event connections when the module initializes
   */
  async onModuleInit() {
    this.logger.log('Account event consumer initialized');
  }

  /**
   * Handle account.created events
   */
  @EventPattern('account.created')
  async handleAccountCreated(@Payload() payload: AccountEventPayload, @Ctx() context: RmqContext): Promise<void> {
    try {
      this.logger.log(`Received account.created event from ${payload.serviceSource} for account ${payload.entityId}`);
      
      // TODO: Implement business logic for account creation
      // Example: Create an account reference in the accounts_receivable database
      
      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(`Error handling account.created event: ${error.message}`, error.stack);
    }
  }

  /**
   * Handle account.updated events
   */
  @EventPattern('account.updated')
  async handleAccountUpdated(@Payload() payload: AccountEventPayload, @Ctx() context: RmqContext): Promise<void> {
    try {
      this.logger.log(`Received account.updated event from ${payload.serviceSource} for account ${payload.entityId}`);
      
      // TODO: Implement business logic for account update
      // Example: Update an account reference in the accounts_receivable database
      
      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(`Error handling account.updated event: ${error.message}`, error.stack);
    }
  }

  /**
   * Handle account.deleted events
   */
  @EventPattern('account.deleted')
  async handleAccountDeleted(@Payload() payload: AccountEventPayload, @Ctx() context: RmqContext): Promise<void> {
    try {
      this.logger.log(`Received account.deleted event from ${payload.serviceSource} for account ${payload.entityId}`);
      
      // TODO: Implement business logic for account deletion
      // Example: Mark an account reference as deleted in the accounts_receivable database
      
      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(`Error handling account.deleted event: ${error.message}`, error.stack);
    }
  }
} 