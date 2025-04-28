import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateProductVariantDto } from './create-product-variant.dto.js';

export class UpdateProductVariantDto extends PartialType(
  OmitType(CreateProductVariantDto, ['sku'] as const)
) {} 