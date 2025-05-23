import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  ParseUUIDPipe, 
  Logger 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { DepreciationService } from './depreciation.service.js';
import { CalculateDepreciationDto, CalculateDepreciationResponseDto } from './dto/calculate-depreciation.dto.js';
import { CreateDepreciationEntryDto, DepreciationEntryResponseDto } from './dto/create-depreciation-entry.dto.js';
import { DepreciationScheduleEntity } from './entities/depreciation-schedule.entity.js';
import { DepreciationMethodEntity } from './entities/depreciation-method.entity.js';
import { DepreciationMethod } from './enums/depreciation-method.enum.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@ApiTags('depreciation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('depreciation')
export class DepreciationController {
  private readonly logger = new Logger(DepreciationController.name);

  constructor(private readonly depreciationService: DepreciationService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate depreciation for an asset' })
  @ApiResponse({ 
    status: 200, 
    description: 'Depreciation calculation results',
    type: CalculateDepreciationResponseDto 
  })
  calculateDepreciation(@Body() calculateDto: CalculateDepreciationDto): Promise<CalculateDepreciationResponseDto> {
    this.logger.log(`Calculating depreciation for asset: ${calculateDto.assetId}`);
    return this.depreciationService.calculateDepreciation(calculateDto);
  }

  @Get('schedule/:assetId')
  @ApiOperation({ summary: 'Generate a depreciation schedule for an asset' })
  @ApiParam({ name: 'assetId', description: 'Asset ID to generate schedule for' })
  @ApiResponse({ 
    status: 200, 
    description: 'Depreciation schedule',
    type: DepreciationScheduleEntity 
  })
  getDepreciationSchedule(@Param('assetId', ParseUUIDPipe) assetId: string): Promise<DepreciationScheduleEntity> {
    this.logger.log(`Generating depreciation schedule for asset: ${assetId}`);
    return this.depreciationService.generateDepreciationSchedule(assetId);
  }

  @Post('record')
  @ApiOperation({ summary: 'Record a depreciation entry for an asset' })
  @ApiResponse({ 
    status: 201, 
    description: 'Depreciation entry recorded',
    type: DepreciationEntryResponseDto
  })
  async recordDepreciation(
    @Body() createEntryDto: CreateDepreciationEntryDto,
  ): Promise<DepreciationEntryResponseDto> {
    const { assetId, date = new Date(), amount, note } = createEntryDto;
    
    // If amount is not provided, calculate it based on the depreciation method
    let recordAmount = amount;
    if (!recordAmount) {
      // Get current depreciation values but we don't need to use them directly
      await this.depreciationService.getCurrentDepreciation(assetId);
      
      const asset = await this.depreciationService.calculateDepreciation({
        assetId,
        asOfDate: date.toISOString(),
      });

      // Use the calculated monthly depreciation
      const originalCost = asset.originalCost || 0;
      const residualValue = asset.residualValue || 0;
      const depreciableAmount = originalCost - residualValue;
      const monthlyDepreciation =
        depreciableAmount / (asset?.entries?.length > 0 ? asset?.entries.length : 12);
      recordAmount = monthlyDepreciation;
    }

    this.logger.log(
      `Recording depreciation of ${recordAmount} for asset: ${assetId} on date: ${date.toISOString()}`,
    );
    
    // Record the depreciation and create a DTO response
    await this.depreciationService.recordDepreciation(assetId, date, recordAmount);
    
    // Create a response object since the service doesn't return one directly
    return {
      id: 'generated-uuid', // This would normally be returned from the service
      assetId,
      date,
      amount: recordAmount,
      bookValue: 0, // This would be calculated or returned from the service
      note: note || '',
      createdAt: new Date()
    };
  }

  @Get('methods')
  @ApiOperation({ summary: 'Get all available depreciation methods' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of depreciation methods',
    type: [DepreciationMethodEntity] 
  })
  getDepreciationMethods(): DepreciationMethodEntity[] {
    const methods = Object.values(DepreciationMethod);
    return methods.map(method => new DepreciationMethodEntity(method));
  }

  @Get('current/:assetId')
  @ApiOperation({ summary: 'Get current depreciation values for an asset' })
  @ApiParam({ name: 'assetId', description: 'Asset ID to get current depreciation for' })
  @ApiResponse({ 
    status: 200, 
    description: 'Current depreciation values',
    schema: {
      properties: {
        currentBookValue: { type: 'number' },
        accumulatedDepreciation: { type: 'number' },
      }
    }
  })
  async getCurrentDepreciation(
    @Param('assetId', ParseUUIDPipe) assetId: string
  ): Promise<{ currentBookValue: number | null; accumulatedDepreciation: number }> {
    this.logger.log(`Getting current depreciation for asset: ${assetId}`);
    const result = await this.depreciationService.getCurrentDepreciation(assetId);
    
    return {
      currentBookValue: parseFloat(result?.currentBookValue.toString()),
      accumulatedDepreciation: parseFloat(result?.accumulatedDepreciation.toString()),
    };
  }
} 