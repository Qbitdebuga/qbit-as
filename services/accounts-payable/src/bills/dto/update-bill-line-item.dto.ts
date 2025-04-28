import { PartialType } from '@nestjs/swagger';
import { CreateBillLineItemDto } from './create-bill-line-item.dto.js';

export class UpdateBillLineItemDto extends PartialType(CreateBillLineItemDto) {} 