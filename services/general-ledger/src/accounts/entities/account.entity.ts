import { ApiProperty } from '@nestjs/swagger';
import { AccountType, AccountSubType } from '../enums/account.enums';

export class Account {
  @ApiProperty({ description: 'Unique identifier' })
  id: string | null;

  @ApiProperty({ description: 'Account code (e?.g., 1000, 2000)' })
  code: string | null;

  @ApiProperty({ description: 'Account name (e?.g., Cash, Accounts Receivable)' })
  name: string | null;

  @ApiProperty({ description: 'Account type (e?.g., ASSET, LIABILITY)' })
  type: AccountType;

  @ApiProperty({ description: 'Account subtype (e?.g., CASH, ACCOUNTS_RECEIVABLE)' })
  subtype: AccountSubType;

  @ApiProperty({ description: 'Account description' })
  description?: string | null;

  @ApiProperty({ description: 'Whether the account is active' })
  isActive: boolean | null;

  @ApiProperty({ description: 'Parent account ID (if this is a child account)' })
  parentId?: string | null;

  @ApiProperty({ description: 'Parent account (if this is a child account)' })
  parent?: Account;

  @ApiProperty({ description: 'Child accounts (if this account has children)' })
  children?: Account[];

  @ApiProperty({ description: 'Current balance of the account' })
  balance?: number | null;

  @ApiProperty({ description: 'Date when the account was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the account was last updated' })
  updatedAt: Date;
  
  constructor(partial: Partial<Account>) {
    Object.assign(this, partial);
  }
}

export class AccountWithHierarchy extends Account {
  @ApiProperty({ description: 'Child accounts (expanded)', type: [Account] })
  children: Account[];

  constructor(partial: Partial<AccountWithHierarchy>) {
    super(partial);
  }
} 