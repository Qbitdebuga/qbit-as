import { ApiProperty } from '@nestjs/swagger';
import { BankAccount as PrismaBankAccount, AccountType, CurrencyCode } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { BankEntity } from './bank.entity';

export class BankAccountEntity implements PrismaBankAccount {
  @ApiProperty({ description: 'Unique identifier of the bank account' })
  id: string;

  @ApiProperty({ description: 'Bank account number', example: '1234567890' })
  accountNumber: string;

  @ApiProperty({ description: 'Name of the bank account', example: 'Operating Account' })
  name: string;

  @ApiProperty({
    description: 'Description of the bank account',
    example: 'Main business operating account',
    required: false,
  })
  description: string | null;

  @ApiProperty({
    description: 'Type of bank account',
    enum: AccountType,
    example: AccountType.CHECKING,
  })
  type: AccountType;

  @ApiProperty({
    description: 'Currency of the bank account',
    enum: CurrencyCode,
    example: CurrencyCode.USD,
  })
  currencyCode: CurrencyCode;

  @ApiProperty({ description: 'ID of the bank where this account is held' })
  bankId: string;

  @ApiProperty({
    description: 'Associated general ledger account ID',
    required: false,
  })
  glAccountId: string | null;

  @ApiProperty({
    description: 'Initial opening balance of the account',
    example: 10000.00,
  })
  openingBalance: Decimal;

  @ApiProperty({
    description: 'Current balance of the account',
    example: 15250.75,
  })
  currentBalance: Decimal;

  @ApiProperty({
    description: 'Whether the account is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Date when the account was last reconciled',
    required: false,
  })
  lastReconciledAt: Date | null;

  @ApiProperty({
    description: 'Additional notes about the account',
    example: 'Used for day-to-day operations',
    required: false,
  })
  notes: string | null;

  @ApiProperty({ description: 'Date when the account was created in the system' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the account was last updated' })
  updatedAt: Date;

  // Relations not directly part of the interface
  @ApiProperty({ 
    type: () => BankEntity,
    description: 'The bank where this account is held'
  })
  bank?: BankEntity;
} 