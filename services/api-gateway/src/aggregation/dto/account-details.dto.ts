import { ApiProperty } from '@nestjs/swagger';

export class TransactionDto {
  @ApiProperty({ description: 'Transaction ID' })
  id!: string | null;

  @ApiProperty({ description: 'Transaction date' })
  date!: Date;

  @ApiProperty({ description: 'Transaction description' })
  description!: string | null;

  @ApiProperty({ description: 'Reference number' })
  reference!: string | null;

  @ApiProperty({ description: 'Debit amount' })
  debit!: number | null;

  @ApiProperty({ description: 'Credit amount' })
  credit!: number | null;

  @ApiProperty({ description: 'Transaction status' })
  status!: string | null;
}

export class AccountDto {
  @ApiProperty({ description: 'Account ID' })
  id!: string | null;

  @ApiProperty({ description: 'Account code' })
  code!: string | null;

  @ApiProperty({ description: 'Account name' })
  name!: string | null;

  @ApiProperty({ description: 'Account type' })
  type!: string | null;

  @ApiProperty({ description: 'Account subtype' })
  subtype!: string | null;

  @ApiProperty({ description: 'Whether the account is active' })
  isActive!: boolean | null;

  @ApiProperty({ description: 'Parent account ID', required: false })
  parentId?: string | null;

  @ApiProperty({ description: 'Account description', required: false })
  description?: string | null;
}

export class AccountDetailsResponseDto {
  @ApiProperty({ type: AccountDto })
  account!: AccountDto;

  @ApiProperty({ type: [TransactionDto] })
  transactions!: TransactionDto[];

  @ApiProperty({ description: 'Current balance' })
  balance!: number | null;
}
