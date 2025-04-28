import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  IsBoolean,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType } from '../enums/account-type.enum';
import { CurrencyCode } from '../enums/currency-code.enum';

export class CreateBankAccountDto {
  @ApiProperty({ description: 'Bank account number', example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string | null;

  @ApiProperty({ description: 'Name of the bank account', example: 'Operating Account' })
  @IsString()
  @IsNotEmpty()
  name: string | null;

  @ApiProperty({
    description: 'Description of the bank account',
    example: 'Main business operating account',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({
    description: 'Type of bank account',
    enum: AccountType,
    example: 'CHECKING',
  })
  @IsEnum(AccountType)
  @IsNotEmpty()
  type: AccountType;

  @ApiProperty({
    description: 'Currency of the bank account',
    enum: CurrencyCode,
    example: 'USD',
    required: false,
  })
  @IsEnum(CurrencyCode)
  @IsOptional()
  currencyCode?: CurrencyCode;

  @ApiProperty({ description: 'ID of the bank where this account is held' })
  @IsUUID()
  @IsNotEmpty()
  bankId: string | null;

  @ApiProperty({
    description: 'Associated general ledger account ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  glAccountId?: string | null;

  @ApiProperty({
    description: 'Initial opening balance of the account',
    example: 10000.00,
    required: false,
    default: 0,
  })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  openingBalance?: number = 0;

  @ApiProperty({
    description: 'Whether the account is active',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiProperty({
    description: 'Additional notes about the account',
    example: 'Used for day-to-day operations',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string | null;
} 