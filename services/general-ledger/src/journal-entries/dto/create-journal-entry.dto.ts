import { IsArray, IsBoolean, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJournalEntryLineDto {
  @IsString()
  accountId!: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  debit?: number | null;

  @IsOptional()
  credit?: number | null;
}

export class CreateJournalEntryDto {
  @IsDateString()
  date!: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  reference?: string | null;

  @IsOptional()
  @IsBoolean()
  isAdjustment?: boolean | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJournalEntryLineDto)
  lines!: CreateJournalEntryLineDto[];
}