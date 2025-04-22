import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AggregationService } from './aggregation.service';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccountDetailsResponseDto, DashboardResponseDto } from './dto';

@ApiTags('Aggregation')
@Controller('api/aggregation')
export class AggregationController {
  constructor(private readonly aggregationService: AggregationService) {}

  @Get('dashboard/:userId')
  @ApiOperation({ summary: 'Get dashboard data for a user combining multiple services' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dashboard data returned successfully',
    type: DashboardResponseDto
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getDashboard(@Param('userId') userId: string) {
    return this.aggregationService.getUserFinancialOverview(userId);
  }

  @Get('financial-overview/:userId')
  @ApiOperation({ summary: 'Get financial overview for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Financial overview returned successfully',
    type: DashboardResponseDto
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getFinancialOverview(@Param('userId') userId: string) {
    return this.aggregationService.getUserFinancialOverview(userId);
  }

  @Get('account-details/:accountId')
  @ApiOperation({ summary: 'Get account details with transaction history' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  @ApiQuery({ 
    name: 'fromDate', 
    required: false, 
    description: 'Start date for transactions (YYYY-MM-DD)' 
  })
  @ApiQuery({ 
    name: 'toDate', 
    required: false, 
    description: 'End date for transactions (YYYY-MM-DD)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Account details returned successfully',
    type: AccountDetailsResponseDto
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAccountDetails(
    @Param('accountId') accountId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ) {
    return this.aggregationService.getAccountWithTransactions(accountId, fromDate, toDate);
  }
} 