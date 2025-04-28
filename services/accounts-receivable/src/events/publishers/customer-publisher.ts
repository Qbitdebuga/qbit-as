import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { CUSTOMER_EVENTS, EventPayload } from '../events.constants.js';

// Customer entity interface (simplified - should match your actual Customer entity)
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
  creditLimit?: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Customer event payload
export interface CustomerEventPayload {
  id: string;
  name: string;
  email: string;
  status: string;
  metadata?: Record<string, any>;
}

/**
 * Publisher for customer-related events
 */
@Injectable()
export class CustomerPublisher {
  private readonly logger = new Logger(CustomerPublisher.name);
  private readonly SERVICE_NAME = 'accounts-receivable';

  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  /**
   * Publish a customer.created event
   * @param customer The customer that was created
   */
  async publishCustomerCreated(customer: Customer): Promise<void> {
    try {
      this.logger.log(`Publishing ${CUSTOMER_EVENTS.CREATED} event for customer ${customer.id}`);
      
      const payload: EventPayload<CustomerEventPayload> = {
        serviceSource: this.SERVICE_NAME,
        entityType: 'customer',
        entityId: customer.id,
        timestamp: new Date().toISOString(),
        data: this.sanitizeCustomer(customer)
      };
      
      await this.client.emit(CUSTOMER_EVENTS.CREATED, payload).toPromise();
      this.logger.log(`Successfully published ${CUSTOMER_EVENTS.CREATED} event for customer ${customer.id}`);
    } catch (error: any) {
      this.logger.error(`Failed to publish ${CUSTOMER_EVENTS.CREATED} event: ${error.message}`, error.stack);
    }
  }

  /**
   * Publish a customer.updated event
   * @param customer The customer that was updated
   * @param previousData Optional previous state of the customer
   */
  async publishCustomerUpdated(customer: Customer, previousData?: Partial<Customer>): Promise<void> {
    try {
      this.logger.log(`Publishing ${CUSTOMER_EVENTS.UPDATED} event for customer ${customer.id}`);
      
      const payload: EventPayload<CustomerEventPayload> = {
        serviceSource: this.SERVICE_NAME,
        entityType: 'customer',
        entityId: customer.id,
        timestamp: new Date().toISOString(),
        data: {
          ...this.sanitizeCustomer(customer),
          metadata: {
            previousData: previousData ? this.sanitizeCustomer(previousData as Customer) : undefined,
            changedFields: previousData ? this.getChangedFields(customer, previousData) : undefined
          }
        }
      };
      
      await this.client.emit(CUSTOMER_EVENTS.UPDATED, payload).toPromise();
      this.logger.log(`Successfully published ${CUSTOMER_EVENTS.UPDATED} event for customer ${customer.id}`);
    } catch (error: any) {
      this.logger.error(`Failed to publish ${CUSTOMER_EVENTS.UPDATED} event: ${error.message}`, error.stack);
    }
  }

  /**
   * Publish a customer.deleted event
   * @param customerId The ID of the deleted customer
   * @param customerData Optional data about the deleted customer
   */
  async publishCustomerDeleted(customerId: string, customerData?: Partial<Customer>): Promise<void> {
    try {
      this.logger.log(`Publishing ${CUSTOMER_EVENTS.DELETED} event for customer ${customerId}`);
      
      const payload: EventPayload<CustomerEventPayload> = {
        serviceSource: this.SERVICE_NAME,
        entityType: 'customer',
        entityId: customerId,
        timestamp: new Date().toISOString(),
        data: {
          id: customerId,
          name: customerData?.name || 'Unknown Customer',
          email: customerData?.email || 'unknown@email.com',
          status: 'DELETED',
        }
      };
      
      await this.client.emit(CUSTOMER_EVENTS.DELETED, payload).toPromise();
      this.logger.log(`Successfully published ${CUSTOMER_EVENTS.DELETED} event for customer ${customerId}`);
    } catch (error: any) {
      this.logger.error(`Failed to publish ${CUSTOMER_EVENTS.DELETED} event: ${error.message}`, error.stack);
    }
  }

  /**
   * Sanitize a customer object by removing sensitive or unnecessary fields
   */
  private sanitizeCustomer(customer: Customer): CustomerEventPayload {
    const { id, name, email, status } = customer;
    return { id, name, email, status };
  }

  /**
   * Get the list of changed fields between an updated customer and its previous state
   */
  private getChangedFields(current: Customer, previous: Partial<Customer>): string[] {
    return Object.keys(previous).filter(key => {
      return previous[key as keyof Partial<Customer>] !== current[key as keyof Customer];
    });
  }
} 