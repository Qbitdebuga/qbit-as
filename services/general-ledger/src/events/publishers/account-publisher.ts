import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Account } from '../../accounts/entities/account.entity';
import { AccountCreatedPayload, AccountUpdatedPayload, AccountDeletedPayload } from '../models/account.model';

/**
 * Publisher for account-related events
 */
@Injectable()
export class AccountPublisher {
  private readonly logger = new Logger(AccountPublisher.name);

  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  /**
   * Publish an account.created event
   */
  async publishAccountCreated(account: Account): Promise<void> {
    try {
      const payload: AccountCreatedPayload = {
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        serviceSource: 'general-ledger',
        entityType: 'account',
        timestamp: new Date().toISOString(),
      };
      
      await this?.client.emit('account.created', payload).toPromise();
      this?.logger.log(`Published account.created event for account ${account.id}`);
    } catch (error) {
      this?.logger.error(
        `Failed to publish account.created event for account ${account.id}`, 
        error instanceof Error ? error.stack : error
      );
    }
  }

  /**
   * Publish an account.updated event
   */
  async publishAccountUpdated(account: Account): Promise<void> {
    try {
      const payload: AccountUpdatedPayload = {
        id: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        isActive: account.isActive,
        serviceSource: 'general-ledger',
        entityType: 'account',
        timestamp: new Date().toISOString(),
      };
      
      await this?.client.emit('account.updated', payload).toPromise();
      this?.logger.log(`Published account.updated event for account ${account.id}`);
    } catch (error) {
      this?.logger.error(
        `Failed to publish account.updated event for account ${account.id}`, 
        error instanceof Error ? error.stack : error
      );
    }
  }

  /**
   * Publish an account.deleted event
   */
  async publishAccountDeleted(accountId: string): Promise<void> {
    try {
      const payload: AccountDeletedPayload = {
        id: accountId,
        serviceSource: 'general-ledger',
        entityType: 'account',
        timestamp: new Date().toISOString(),
      };
      
      await this?.client.emit('account.deleted', payload).toPromise();
      this?.logger.log(`Published account.deleted event for account ${accountId}`);
    } catch (error) {
      this?.logger.error(
        `Failed to publish account.deleted event for account ${accountId}`, 
        error instanceof Error ? error.stack : error
      );
    }
  }
} 