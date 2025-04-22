import { ApiProperty } from '@nestjs/swagger';

// Define enum types locally
export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export enum AccountSubType {
  CASH = 'CASH',
  ACCOUNTS_RECEIVABLE = 'ACCOUNTS_RECEIVABLE',
  INVENTORY = 'INVENTORY',
  FIXED_ASSET = 'FIXED_ASSET',
  ACCUMULATED_DEPRECIATION = 'ACCUMULATED_DEPRECIATION',
  ACCOUNTS_PAYABLE = 'ACCOUNTS_PAYABLE',
  ACCRUED_LIABILITIES = 'ACCRUED_LIABILITIES',
  LONG_TERM_DEBT = 'LONG_TERM_DEBT',
  COMMON_STOCK = 'COMMON_STOCK',
  RETAINED_EARNINGS = 'RETAINED_EARNINGS',
  SALES = 'SALES',
  COST_OF_GOODS_SOLD = 'COST_OF_GOODS_SOLD',
  OPERATING_EXPENSE = 'OPERATING_EXPENSE',
  PAYROLL_EXPENSE = 'PAYROLL_EXPENSE',
  DEPRECIATION_EXPENSE = 'DEPRECIATION_EXPENSE',
  INTEREST_EXPENSE = 'INTEREST_EXPENSE',
  OTHER_EXPENSE = 'OTHER_EXPENSE',
  OTHER_INCOME = 'OTHER_INCOME',
  TAX_EXPENSE = 'TAX_EXPENSE',
  OTHER = 'OTHER',
}

export class Account {
  @ApiProperty({ description: 'Unique identifier for the account' })
  id!: string;

  @ApiProperty({ description: 'Account code, must be unique' })
  code!: string;

  @ApiProperty({ description: 'Account name' })
  name!: string;

  @ApiProperty({ description: 'Account description', required: false })
  description!: string | null;

  @ApiProperty({ 
    description: 'Account type',
    enum: AccountType,
    enumName: 'AccountType'
  })
  type!: AccountType;

  @ApiProperty({ 
    description: 'Account subtype',
    enum: AccountSubType,
    enumName: 'AccountSubType'
  })
  subtype!: AccountSubType;

  @ApiProperty({ description: 'Whether the account is active' })
  isActive!: boolean;

  @ApiProperty({ description: 'Parent account ID, if any', required: false })
  parentId!: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;
}

export class AccountWithHierarchy extends Account {
  @ApiProperty({ description: 'Parent account', required: false, type: Account })
  parent?: Account;

  @ApiProperty({ description: 'Child accounts', required: false, type: [Account] })
  children?: Account[];
} 