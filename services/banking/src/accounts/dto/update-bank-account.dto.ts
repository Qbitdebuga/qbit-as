import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  IsBoolean,
  Min,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType } from '../enums/account-type.enum';
import { CurrencyCode } from '../enums/currency-code.enum';

export class UpdateBankAccountDto {
  @ApiProperty({
    description: 'Name of the bank account',
    example: 'Operating Account',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string | null;

  @ApiProperty({
    description: 'Description of the bank account',
    example: 'Main business operating account',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({
    description: 'Bank account number',
    example: '1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  accountNumber?: string | null;

  @ApiProperty({
    description: 'Type of bank account',
    enum: AccountType,
    example: 'CHECKING',
    required: false,
  })
  @IsEnum(AccountType)
  @IsOptional()
  type?: AccountType;

  @ApiProperty({
    description: 'Currency of the bank account',
    enum: CurrencyCode,
    example: 'USD',
    required: false,
  })
  @IsEnum(CurrencyCode)
  @IsOptional()
  currencyCode?: CurrencyCode;

  @ApiProperty({
    description: 'ID of the bank where this account is held',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  bankId?: string | null;

  @ApiProperty({
    description: 'Associated general ledger account ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  glAccountId?: string | null;

  @ApiProperty({
    description: 'Current balance of the account',
    example: 15250.75,
    required: false,
  })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  currentBalance?: number | null;

  @ApiProperty({
    description: 'Date when the account was last reconciled',
    required: false,
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  lastReconciledAt?: Date;

  @ApiProperty({
    description: 'Whether the account is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean | null;

  @ApiProperty({
    description: 'Additional notes about the account',
    example: 'Used for day-to-day operations',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string | null;
}
