import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Headers,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FinancialReportingService } from './financial-reporting.service';
import { ReportRequestDto, ReportType } from './dto/report-request.dto';
import { ReportResponseDto } from './dto/report-response.dto';
import { AuthClientService } from '../clients/auth-client';

@ApiTags('financial-reporting')
@Controller('financial-reporting')
export class FinancialReportingController {
  constructor(
    private readonly financialReportingService: FinancialReportingService,
    private readonly authClient: AuthClientService,
  ) {}

  /**
   * Extract and validate the user ID from the authorization header
   */
  private async getUserIdFromToken(authorization?: string): Promise<string | undefined> {
    if (!authorization) {
      return undefined;
    }

    try {
      const token = authorization.replace('Bearer ', '');
      const validationResult = await this?.authClient.validateToken(token);

      if (validationResult && validationResult.userId) {
        return validationResult.userId;
      }

      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate a financial report' })
  @ApiResponse({
    status: 201,
    description: 'Report generated successfully',
    type: ReportResponseDto,
  })
  @ApiBearerAuth()
  async generateReport(
    @Body(ValidationPipe) reportRequest: ReportRequestDto,
    @Headers('authorization') authorization?: string,
  ): Promise<ReportResponseDto> {
    // Extract user ID from token (if provided)
    const userId = await this.getUserIdFromToken(authorization);

    // Include the userId in the request (if authenticated)
    if (userId) {
      reportRequest.userId = userId;
    }

    // Generate the report
    return this?.financialReportingService.generateReport(reportRequest);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get all reports' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ReportType })
  @ApiBearerAuth()
  async getReports(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
    @Headers('authorization') authorization?: string,
  ): Promise<{ data: any[]; meta: any }> {
    // Extract user ID from token (if provided)
    const userId = await this.getUserIdFromToken(authorization);

    // Get reports
    return this?.financialReportingService.getReports(
      userId,
      type,
      page ? parseInt(page.toString(), 10) : 1,
      limit ? parseInt(limit.toString(), 10) : 20,
    );
  }

  @Get('reports/:id')
  @ApiOperation({ summary: 'Get a report by ID' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiBearerAuth()
  async getReportById(
    @Param('id') id: string,
    @Headers('authorization') authorization?: string,
  ): Promise<any> {
    // Extract user ID from token (if provided)
    const userId = await this.getUserIdFromToken(authorization);

    // Get the report
    return this?.financialReportingService.getReportById(id, true, userId);
  }

  @Get('snapshots/:id')
  @ApiOperation({ summary: 'Get a report snapshot by ID' })
  @ApiParam({ name: 'id', description: 'Snapshot ID' })
  @ApiBearerAuth()
  async getSnapshotById(
    @Param('id') id: string,
    @Headers('authorization') authorization?: string,
  ): Promise<any> {
    // Extract user ID from token (if provided)
    const userId = await this.getUserIdFromToken(authorization);

    // Get the snapshot
    return this?.financialReportingService.getSnapshotById(id, userId);
  }

  @Post('reports/:id/snapshots')
  @ApiOperation({ summary: 'Create a new snapshot of a report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiBearerAuth()
  async createReportSnapshot(
    @Param('id') id: string,
    @Body('name') name?: string,
    @Headers('authorization') authorization?: string,
  ): Promise<any> {
    // Extract user ID from token (if provided)
    const userId = await this.getUserIdFromToken(authorization);

    // Require authentication for this endpoint
    if (!userId) {
      throw new UnauthorizedException('Authentication required to create report snapshots');
    }

    // Create the snapshot
    return this?.financialReportingService.createReportSnapshot(id, name, userId);
  }
}
