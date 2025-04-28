import { PartialType } from '@nestjs/swagger';
import { CreateWarehouseLocationDto } from './create-warehouse-location.dto.js';

export class UpdateWarehouseLocationDto extends PartialType(CreateWarehouseLocationDto) {} 