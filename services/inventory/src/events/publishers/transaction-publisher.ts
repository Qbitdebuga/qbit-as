import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { TransactionStatus, TransactionType } from '../../transactions/dto/create-transaction.dto';

export interface TransactionEvent {
  serviceSource: string;
  entityType: string;
  timestamp: Date;
  action: 'created' | 'processed' | 'cancelled';
  id: string;
  transactionType: TransactionType;
  status: TransactionStatus;
  data?: any;
}

@Injectable()
export class TransactionPublisher {
  constructor(
    @Inject('INVENTORY_SERVICE') private readonly client: ClientProxy,
  ) {}

  async publishTransactionCreated(
    transactionId: string,
    transactionType: TransactionType,
    transactionData: any
  ): Promise<void> {
    const event: TransactionEvent = {
      serviceSource: 'inventory',
      entityType: 'transaction',
      timestamp: new Date(),
      action: 'created',
      id: transactionId,
      transactionType,
      status: TransactionStatus.DRAFT,
      data: transactionData,
    };

    await this.client.emit('inventory.transaction.created', event).toPromise();
  }

  async publishTransactionProcessed(
    transactionId: string,
    transactionType: TransactionType,
    status: TransactionStatus,
    transactionData: any
  ): Promise<void> {
    const event: TransactionEvent = {
      serviceSource: 'inventory',
      entityType: 'transaction',
      timestamp: new Date(),
      action: 'processed',
      id: transactionId,
      transactionType,
      status,
      data: transactionData,
    };

    await this.client.emit('inventory.transaction.processed', event).toPromise();
  }

  async publishTransactionCancelled(
    transactionId: string,
    transactionType: TransactionType,
    transactionData: any
  ): Promise<void> {
    const event: TransactionEvent = {
      serviceSource: 'inventory',
      entityType: 'transaction',
      timestamp: new Date(),
      action: 'cancelled',
      id: transactionId,
      transactionType,
      status: TransactionStatus.CANCELLED,
      data: transactionData,
    };

    await this.client.emit('inventory.transaction.cancelled', event).toPromise();
  }
} 