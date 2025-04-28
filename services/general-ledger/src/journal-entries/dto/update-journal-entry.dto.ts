import { IsArray, IsBoolean, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateJournalEntryLineDto } from './create-journal-entry.dto';

export class UpdateJournalEntryLineDto extends CreateJournalEntryLineDto {
  @IsOptional()
  @IsString()
  accountId!: string | null;
}

export class UpdateJournalEntryDto {
  @IsOptional()
  @IsDateString()
  date?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  reference?: string | null;

  @IsOptional()
  @IsString()
  status?: string | null;

  @IsOptional()
  @IsBoolean()
  isAdjustment?: boolean | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateJournalEntryLineDto)
  lines?: UpdateJournalEntryLineDto[];
} 