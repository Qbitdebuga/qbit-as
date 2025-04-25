import { IsArray, IsBoolean, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJournalEntryLineDto {
  @IsString()
  accountId!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  debit?: number;

  @IsOptional()
  credit?: number;
}

export class CreateJournalEntryDto {
  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsBoolean()
  isAdjustment?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJournalEntryLineDto)
  lines!: CreateJournalEntryLineDto[];
}