import { Account as EntityAccount } from '../../accounts/entities/account.entity';
import { AccountType, AccountSubType } from '../../accounts/enums/account.enums';

/**
 * Interface representing an Account entity for event messages
 */
export interface AccountEventData {
  id: string | null;
  code: string | null;
  name: string | null;
  description?: string | null;
  type: AccountType;
  subtype: AccountSubType;
  isActive: boolean | null;
  parentId?: string | null;
}

/**
 * Base event payload structure for account events
 */
export interface AccountEventPayload {
  id: string | null;
  serviceSource: string | null;
  entityType: string | null;
  timestamp: string | null;
}

/**
 * Created event payload
 */
export interface AccountCreatedPayload extends AccountEventPayload {
  code: string | null;
  name: string | null;
  type: AccountType;
  subtype: AccountSubType;
}

/**
 * Updated event payload
 */
export interface AccountUpdatedPayload extends AccountEventPayload {
  code: string | null;
  name: string | null;
  type: AccountType;
  subtype: AccountSubType;
  isActive: boolean | null;
}

/**
 * Deleted event payload - only contains the ID reference
 */
export interface AccountDeletedPayload extends AccountEventPayload {
  // No additional fields beyond the base payload
} 