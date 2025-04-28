import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateExpenseDto } from './create-expense.dto.js';

export class UpdateExpenseDto extends PartialType(
  OmitType(CreateExpenseDto, ['expenseNumber'] as const)
) {} 