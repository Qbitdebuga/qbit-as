import { ApiProperty } from '@nestjs/swagger';
import { AccountType, AccountSubType } from '../enums/account.enums.js';

export class Account {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Account code (e.g., 1000, 2000)' })
  code: string;

  @ApiProperty({ description: 'Account name (e.g., Cash, Accounts Receivable)' })
  name: string;

  @ApiProperty({ description: 'Account type (e.g., ASSET, LIABILITY)' })
  type: AccountType;

  @ApiProperty({ description: 'Account subtype (e.g., CASH, ACCOUNTS_RECEIVABLE)' })
  subtype: AccountSubType;

  @ApiProperty({ description: 'Account description' })
  description?: string;

  @ApiProperty({ description: 'Whether the account is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Parent account ID (if this is a child account)' })
  parentId?: string;

  @ApiProperty({ description: 'Parent account (if this is a child account)' })
  parent?: Account;

  @ApiProperty({ description: 'Child accounts (if this account has children)' })
  children?: Account[];

  @ApiProperty({ description: 'Current balance of the account' })
  balance?: number;

  @ApiProperty({ description: 'Date when the account was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the account was last updated' })
  updatedAt: Date;
  
  constructor(partial: Partial<Account>) {
    Object.assign(this, partial);
  }
}

export class AccountWithHierarchy extends Account {
  declare children: Account[];

  constructor(partial: Partial<AccountWithHierarchy>) {
    super(partial);
  }
} 