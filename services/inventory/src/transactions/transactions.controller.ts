import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBearerAuth
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { 
  CreateTransactionDto, 
  UpdateTransactionDto, 
  ProcessTransactionDto, 
  TransactionType, 
  TransactionStatus 
} from './dto';
import { InventoryTransactionEntity } from './entities';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('inventory-transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new inventory transaction' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'The inventory transaction has been successfully created.',
    type: InventoryTransactionEntity 
  })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this?.transactionsService.create(createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory transactions' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns all inventory transactions',
    type: [InventoryTransactionEntity] 
  })
  @ApiQuery({ name: 'skip', required: false, description: 'Number of records to skip' })
  @ApiQuery({ name: 'take', required: false, description: 'Number of records to take' })
  @ApiQuery({ name: 'searchTerm', required: false, description: 'Search term to filter by' })
  @ApiQuery({ name: 'orderBy', required: false, description: 'Order by field and direction (field:asc|desc)' })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    enum: TransactionType, 
    description: 'Filter by transaction type' 
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: TransactionStatus, 
    description: 'Filter by transaction status' 
  })
  @ApiQuery({ name: 'sourceWarehouseId', required: false, description: 'Filter by source warehouse ID' })
  @ApiQuery({ name: 'targetWarehouseId', required: false, description: 'Filter by target warehouse ID' })
  @ApiQuery({ name: 'referenceType', required: false, description: 'Filter by reference type' })
  @ApiQuery({ name: 'referenceId', required: false, description: 'Filter by reference ID' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Filter by transaction date (from)' })
  @ApiQuery({ name: 'toDate', required: false, description: 'Filter by transaction date (to)' })
  findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('searchTerm') searchTerm?: string,
    @Query('orderBy') orderBy?: string,
    @Query('type') type?: TransactionType,
    @Query('status') status?: TransactionStatus,
    @Query('sourceWarehouseId') sourceWarehouseId?: string,
    @Query('targetWarehouseId') targetWarehouseId?: string,
    @Query('referenceType') referenceType?: string,
    @Query('referenceId') referenceId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this?.transactionsService.findAll({
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      searchTerm,
      orderBy,
      type,
      status,
      sourceWarehouseId,
      targetWarehouseId,
      referenceType,
      referenceId,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an inventory transaction by ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns the inventory transaction with the specified ID',
    type: InventoryTransactionEntity 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Transaction not found' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  findOne(@Param('id') id: string) {
    return this?.transactionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an inventory transaction' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'The inventory transaction has been successfully updated.',
    type: InventoryTransactionEntity 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Transaction not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Only draft transactions can be updated' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this?.transactionsService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an inventory transaction' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'The inventory transaction has been successfully deleted.'
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Transaction not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Only draft transactions can be deleted' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  remove(@Param('id') id: string) {
    return this?.transactionsService.remove(id);
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Process an inventory transaction' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'The inventory transaction has been successfully processed.',
    type: InventoryTransactionEntity 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Transaction not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Transaction cannot be processed' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  process(@Param('id') id: string, @Body() processTransactionDto: ProcessTransactionDto) {
    return this?.transactionsService.process(id, processTransactionDto);
  }
} 