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
import { DepreciationService } from './depreciation.service';
import { CalculateDepreciationDto, CalculateDepreciationResponseDto } from './dto/calculate-depreciation.dto';
import { DepreciationScheduleEntity } from './entities/depreciation-schedule.entity';
import { DepreciationMethodEntity } from './entities/depreciation-method.entity';
import { DepreciationMethod } from './enums/depreciation-method.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
    this?.logger.log(`Calculating depreciation for asset: ${calculateDto.assetId}`);
    return this?.depreciationService.calculateDepreciation(calculateDto);
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
    this?.logger.log(`Generating depreciation schedule for asset: ${assetId}`);
    return this?.depreciationService.generateDepreciationSchedule(assetId);
  }

  @Post('record/:assetId')
  @ApiOperation({ summary: 'Record a depreciation entry for an asset' })
  @ApiParam({ name: 'assetId', description: 'Asset ID to record depreciation for' })
  @ApiQuery({ name: 'date', description: 'Date for the depreciation entry', required: false })
  @ApiResponse({ status: 200, description: 'Depreciation entry recorded' })
  async recordDepreciation(
    @Param('assetId', ParseUUIDPipe) assetId: string,
    @Query('date') dateString?: string,
    @Body('amount') amount?: number,
  ): Promise<{ success: boolean | null; message: string }> {
    const date = dateString ? new Date(dateString) : new Date();
    
    // If amount is not provided, calculate it based on the depreciation method
    if (!amount) {
      const { currentBookValue, accumulatedDepreciation } = await this?.depreciationService.getCurrentDepreciation(assetId);
      const asset = await this?.depreciationService.calculateDepreciation({ assetId, asOfDate: date.toISOString() });
      
      // Use the calculated monthly depreciation
      const depreciableAmount = asset.originalCost - asset.residualValue;
      const monthlyDepreciation = depreciableAmount / (asset?.entries.length > 0 ? asset?.entries.length : 12);
      amount = monthlyDepreciation;
    }
    
    this?.logger.log(`Recording depreciation of ${amount} for asset: ${assetId} on date: ${date.toISOString()}`);
    await this?.depreciationService.recordDepreciation(assetId, date, amount);
    
    return { 
      success: true, 
      message: `Depreciation of ${amount} recorded for asset ${assetId}` 
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
    this?.logger.log(`Getting current depreciation for asset: ${assetId}`);
    const result = await this?.depreciationService.getCurrentDepreciation(assetId);
    
    return {
      currentBookValue: parseFloat(result?.currentBookValue.toString()),
      accumulatedDepreciation: parseFloat(result?.accumulatedDepreciation.toString()),
    };
  }
} 