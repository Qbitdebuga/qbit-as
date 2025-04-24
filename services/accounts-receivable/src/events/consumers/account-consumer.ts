import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { PrismaService } from '../../prisma/prisma.service';

interface AccountEventPayload {
  id: string;
  serviceSource: string;
  entityType: string;
  timestamp: string;
  code?: string;
  name?: string;
  type?: string;
  subtype?: string;
  isActive?: boolean;
}

/**
 * Consumer for account events from the General Ledger Service
 */
@Injectable()
export class AccountConsumer implements OnModuleInit {
  private readonly logger = new Logger(AccountConsumer.name);

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
      this.logger.log(`Received account.created event for account ${payload.id}`);
      
      // TODO: Implement account creation logic
      // Example: Create a local reference to the account
      
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
      this.logger.log(`Received account.updated event for account ${payload.id}`);
      
      // TODO: Implement account update logic
      // Example: Update the local reference to the account
      
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
      this.logger.log(`Received account.deleted event for account ${payload.id}`);
      
      // TODO: Implement account deletion logic
      // Example: Delete the local reference to the account
      
      // Acknowledge the message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(`Error handling account.deleted event: ${error.message}`, error.stack);
    }
  }
} 