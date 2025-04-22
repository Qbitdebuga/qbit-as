import { ApiProperty } from '@nestjs/swagger';

export class TransactionDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: string;

  @ApiProperty({ description: 'Transaction date' })
  date: Date;

  @ApiProperty({ description: 'Transaction description' })
  description: string;

  @ApiProperty({ description: 'Reference number' })
  reference: string;

  @ApiProperty({ description: 'Debit amount' })
  debit: number;

  @ApiProperty({ description: 'Credit amount' })
  credit: number;

  @ApiProperty({ description: 'Transaction status' })
  status: string;
}

export class AccountDto {
  @ApiProperty({ description: 'Account ID' })
  id: string;

  @ApiProperty({ description: 'Account code' })
  code: string;

  @ApiProperty({ description: 'Account name' })
  name: string;

  @ApiProperty({ description: 'Account type' })
  type: string;

  @ApiProperty({ description: 'Account subtype' })
  subtype: string;

  @ApiProperty({ description: 'Whether the account is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Parent account ID', required: false })
  parentId?: string;

  @ApiProperty({ description: 'Account description', required: false })
  description?: string;
}

export class AccountDetailsResponseDto {
  @ApiProperty({ type: AccountDto })
  account: AccountDto;

  @ApiProperty({ type: [TransactionDto] })
  transactions: TransactionDto[];

  @ApiProperty({ description: 'Current balance' })
  balance: number;
} 