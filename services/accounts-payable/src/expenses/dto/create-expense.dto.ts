import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsDate,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
  ArrayMinSize,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseStatus, PaymentMethod } from '../entities/expense.entity';

export class CreateExpenseTagDto {
  @ApiProperty({
    example: 'Travel',
    description: 'Tag name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string | null;
}

export class CreateExpenseDto {
  @ApiPropertyOptional({
    example: 'EXP-00001',
    description: 'Unique expense number (will be auto-generated if not provided)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  expenseNumber?: string | null;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID of the expense category',
  })
  @IsNumber()
  @IsOptional()
  categoryId?: number | null;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID of the vendor associated with this expense',
  })
  @IsNumber()
  @IsOptional()
  vendorId?: number | null;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID of the employee who incurred the expense',
  })
  @IsNumber()
  @IsOptional()
  employeeId?: number | null;

  @ApiProperty({
    example: 'Office supplies',
    description: 'Description of the expense',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string | null;

  @ApiProperty({
    example: 85.5,
    description: 'Amount before tax',
  })
  @IsNumber()
  @Min(0)
  amount: number | null;

  @ApiPropertyOptional({
    example: 14.5,
    description: 'Tax amount',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  taxAmount?: number | null;

  @ApiProperty({
    example: 100.0,
    description: 'Total amount including tax',
  })
  @IsNumber()
  @Min(0)
  totalAmount: number | null;

  @ApiPropertyOptional({
    example: 'https://storage?.example.com/receipts/receipt-123.jpg',
    description: 'URL to the receipt image or file',
  })
  @IsUrl()
  @IsOptional()
  receiptUrl?: string | null;

  @ApiProperty({
    example: '2023-01-15',
    description: 'Date the expense was incurred',
  })
  @IsDate()
  @Type(() => Date)
  expenseDate: Date;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
    description: 'Method of payment used for the expense',
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({
    example: 'CARD-4567',
    description: 'Reference to payment details',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  paymentReference?: string | null;

  @ApiPropertyOptional({
    enum: ExpenseStatus,
    example: ExpenseStatus.PENDING,
    description: 'Current status of the expense',
    default: ExpenseStatus.PENDING,
  })
  @IsEnum(ExpenseStatus)
  @IsOptional()
  status?: ExpenseStatus;

  @ApiPropertyOptional({
    example: 'Monthly team lunch',
    description: 'Additional notes about the expense',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string | null;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether this expense is reimbursable',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isReimbursable?: boolean | null;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether this expense has been reconciled',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isReconciled?: boolean | null;

  @ApiPropertyOptional({
    type: [CreateExpenseTagDto],
    description: 'Tags to associate with this expense',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExpenseTagDto)
  @IsOptional()
  tags?: CreateExpenseTagDto[];
}
