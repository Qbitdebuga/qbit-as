import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateJournalEntryDto } from '../../journal-entries/dto/create-journal-entry.dto';

export class CreateBatchDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateJournalEntryDto)
  entries: CreateJournalEntryDto[];
} 