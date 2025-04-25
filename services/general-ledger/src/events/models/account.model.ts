import { Account as EntityAccount } from '../../accounts/entities/account.entity';
import { AccountType, AccountSubType } from '../../accounts/enums/account.enums';

/**
 * Interface representing an Account entity for event messages
 */
export interface AccountEventData {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: AccountType;
  subtype: AccountSubType;
  isActive: boolean;
  parentId?: string;
}

/**
 * Base event payload structure for account events
 */
export interface AccountEventPayload {
  id: string;
  serviceSource: string;
  entityType: string;
  timestamp: string;
}

/**
 * Created event payload
 */
export interface AccountCreatedPayload extends AccountEventPayload {
  code: string;
  name: string;
  type: AccountType;
  subtype: AccountSubType;
}

/**
 * Updated event payload
 */
export interface AccountUpdatedPayload extends AccountEventPayload {
  code: string;
  name: string;
  type: AccountType;
  subtype: AccountSubType;
  isActive: boolean;
}

/**
 * Deleted event payload - only contains the ID reference
 */
export interface AccountDeletedPayload extends AccountEventPayload {
  // No additional fields beyond the base payload
} 