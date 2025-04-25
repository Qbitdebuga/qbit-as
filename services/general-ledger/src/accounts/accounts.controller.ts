import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account, AccountWithHierarchy } from './entities/account.entity';
import { AccountType } from './enums/account.enums';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The account has been successfully created', type: Account })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Account with the same code already exists' })
  create(@Body() createAccountDto: CreateAccountDto): Promise<Account> {
    return this.accountsService.create(createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns all accounts', type: [Account] })
  @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'type', required: false, enum: AccountType, description: 'Filter by account type' })
  async findAll(
    @Query('active') active?: boolean,
    @Query('type') type?: string
  ): Promise<Account[]> {
    if (active !== undefined) {
      return this.accountsService.findAllActive();
    }

    if (type) {
      return this.accountsService.findByType(type);
    }

    return this.accountsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns the account', type: Account })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Account not found' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  findOne(@Param('id') id: string): Promise<Account> {
    return this.accountsService.findOne(id);
  }

  @Get(':id/hierarchy')
  @ApiOperation({ summary: 'Get account with parent and children' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Returns the account with hierarchy', type: AccountWithHierarchy })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Account not found' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  findOneWithHierarchy(@Param('id') id: string): Promise<AccountWithHierarchy> {
    return this.accountsService.findOneWithHierarchy(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The account has been successfully updated', type: Account })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Account not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Account with the same code already exists' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto): Promise<Account> {
    return this.accountsService.update(id, updateAccountDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The account has been successfully deleted', type: Account })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Account not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Cannot delete account with children or in use' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  remove(@Param('id') id: string): Promise<Account> {
    return this.accountsService.remove(id);
  }
} 