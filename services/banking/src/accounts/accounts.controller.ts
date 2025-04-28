import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  ParseUUIDPipe,
  Logger,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BankEntity } from './entities/bank.entity';
import { BankAccountEntity } from './entities/bank-account.entity';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  private readonly logger = new Logger(AccountsController.name);
  
  constructor(private readonly accountsService: AccountsService) {}

  // Bank Endpoints
  @Post('banks')
  @ApiOperation({ summary: 'Create a new bank' })
  @ApiResponse({ status: 201, description: 'The bank has been successfully created.', type: BankEntity })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 409, description: 'Conflict. Bank with this code already exists.' })
  createBank(@Body() createBankDto: CreateBankDto): Promise<BankEntity> {
    this?.logger.log('Creating a new bank');
    return this?.accountsService.createBank(createBankDto);
  }

  @Get('banks')
  @ApiOperation({ summary: 'Get all banks' })
  @ApiResponse({ status: 200, description: 'Return all banks.', type: [BankEntity] })
  @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Filter by active status' })
  findAllBanks(@Query('active') active?: string): Promise<BankEntity[]> {
    this?.logger.log('Finding all banks');
    if (active === 'true') {
      return this?.accountsService.findActivebanks();
    }
    return this?.accountsService.findAllBanks();
  }

  @Get('banks/:id')
  @ApiOperation({ summary: 'Get a bank by ID' })
  @ApiResponse({ status: 200, description: 'Return the bank.', type: BankEntity })
  @ApiResponse({ status: 404, description: 'Bank not found.' })
  @ApiParam({ name: 'id', description: 'Bank ID' })
  findBankById(@Param('id', ParseUUIDPipe) id: string): Promise<BankEntity> {
    this?.logger.log(`Finding bank with ID: ${id}`);
    return this?.accountsService.findBankById(id);
  }

  @Patch('banks/:id')
  @ApiOperation({ summary: 'Update a bank' })
  @ApiResponse({ status: 200, description: 'The bank has been successfully updated.', type: BankEntity })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Bank not found.' })
  @ApiResponse({ status: 409, description: 'Conflict. Bank with this code already exists.' })
  @ApiParam({ name: 'id', description: 'Bank ID' })
  updateBank(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBankDto: UpdateBankDto,
  ): Promise<BankEntity> {
    this?.logger.log(`Updating bank with ID: ${id}`);
    return this?.accountsService.updateBank(id, updateBankDto);
  }

  @Delete('banks/:id')
  @ApiOperation({ summary: 'Delete a bank' })
  @ApiResponse({ status: 204, description: 'The bank has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Bank not found.' })
  @ApiResponse({ status: 409, description: 'Conflict. Cannot delete bank with associated accounts.' })
  @ApiParam({ name: 'id', description: 'Bank ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeBank(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this?.logger.log(`Deleting bank with ID: ${id}`);
    return this?.accountsService.removeBank(id);
  }

  // Bank Account Endpoints
  @Post('bank-accounts')
  @ApiOperation({ summary: 'Create a new bank account' })
  @ApiResponse({ status: 201, description: 'The bank account has been successfully created.', type: BankAccountEntity })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Bank not found.' })
  @ApiResponse({ status: 409, description: 'Conflict. Bank account with this account number already exists at this bank.' })
  createBankAccount(@Body() createBankAccountDto: CreateBankAccountDto): Promise<BankAccountEntity> {
    this?.logger.log('Creating a new bank account');
    return this?.accountsService.createBankAccount(createBankAccountDto);
  }

  @Get('bank-accounts')
  @ApiOperation({ summary: 'Get all bank accounts' })
  @ApiResponse({ status: 200, description: 'Return all bank accounts.', type: [BankAccountEntity] })
  @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'bankId', required: false, type: String, description: 'Filter by bank ID' })
  findAllBankAccounts(
    @Query('active') active?: string,
    @Query('bankId') bankId?: string,
  ): Promise<BankAccountEntity[]> {
    this?.logger.log('Finding all bank accounts');
    
    if (bankId) {
      return this?.accountsService.findBankAccountsByBankId(bankId);
    }
    
    if (active === 'true') {
      return this?.accountsService.findActiveBankAccounts();
    }
    
    return this?.accountsService.findAllBankAccounts();
  }

  @Get('bank-accounts/:id')
  @ApiOperation({ summary: 'Get a bank account by ID' })
  @ApiResponse({ status: 200, description: 'Return the bank account.', type: BankAccountEntity })
  @ApiResponse({ status: 404, description: 'Bank account not found.' })
  @ApiParam({ name: 'id', description: 'Bank account ID' })
  findBankAccountById(@Param('id', ParseUUIDPipe) id: string): Promise<BankAccountEntity> {
    this?.logger.log(`Finding bank account with ID: ${id}`);
    return this?.accountsService.findBankAccountById(id);
  }

  @Patch('bank-accounts/:id')
  @ApiOperation({ summary: 'Update a bank account' })
  @ApiResponse({ status: 200, description: 'The bank account has been successfully updated.', type: BankAccountEntity })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Bank account not found.' })
  @ApiResponse({ status: 409, description: 'Conflict. Bank account with this account number already exists at this bank.' })
  @ApiParam({ name: 'id', description: 'Bank account ID' })
  updateBankAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
  ): Promise<BankAccountEntity> {
    this?.logger.log(`Updating bank account with ID: ${id}`);
    return this?.accountsService.updateBankAccount(id, updateBankAccountDto);
  }

  @Delete('bank-accounts/:id')
  @ApiOperation({ summary: 'Delete a bank account' })
  @ApiResponse({ status: 204, description: 'The bank account has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Bank account not found.' })
  @ApiResponse({ status: 409, description: 'Conflict. Cannot delete bank account with associated transactions.' })
  @ApiParam({ name: 'id', description: 'Bank account ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeBankAccount(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this?.logger.log(`Deleting bank account with ID: ${id}`);
    return this?.accountsService.removeBankAccount(id);
  }
} 