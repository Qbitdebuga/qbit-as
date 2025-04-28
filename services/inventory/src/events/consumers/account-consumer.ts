import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

interface AccountEvent {
  serviceSource: string | null;
  entityType: string | null;
  timestamp: Date;
  action: string | null;
  id: number | null;
  data?: any;
}

@Injectable()
export class AccountConsumer {
  private readonly logger = new Logger(AccountConsumer.name);

  @OnEvent('account.created')
  handleAccountCreated(event: AccountEvent) {
    this?.logger.log(`Received account.created event: ${JSON.stringify(event)}`);
    // This is where we would handle account creation events
    // For example, we might want to:
    // - Store account details locally for reference
    // - Update UI components that display account information
    // - Create related inventory GL entries
  }

  @OnEvent('account.updated')
  handleAccountUpdated(event: AccountEvent) {
    this?.logger.log(`Received account.updated event: ${JSON.stringify(event)}`);
    // This is where we would handle account update events
    // For example, we might want to:
    // - Update locally stored account details
    // - Refresh any cached account information
  }

  @OnEvent('account.deleted')
  handleAccountDeleted(event: AccountEvent) {
    this?.logger.log(`Received account.deleted event: ${JSON.stringify(event)}`);
    // This is where we would handle account deletion events
    // For example, we might want to:
    // - Remove locally stored account details
    // - Handle any impacts on inventory accounting
  }
} 