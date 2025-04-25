import { IsArray, IsBoolean, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateJournalEntryLineDto } from './create-journal-entry.dto';

export class UpdateJournalEntryLineDto extends CreateJournalEntryLineDto {
  @IsOptional()
  @IsString()
  accountId!: string;
}

export class UpdateJournalEntryDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  isAdjustment?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateJournalEntryLineDto)
  lines?: UpdateJournalEntryLineDto[];
} 