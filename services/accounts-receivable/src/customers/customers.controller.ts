import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Put, 
  Query, 
  HttpStatus,
  HttpCode,
  Logger
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { CreateCustomerContactDto } from './dto/create-customer-contact.dto.js';
import { Customer } from './entities/customer.entity.js';
import { CustomerContact } from './entities/customer-contact.entity.js';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  private readonly logger = new Logger(CustomersController.name);

  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Customer created successfully', type: Customer })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Customer number already exists' })
  create(@Body() createCustomerDto: CreateCustomerDto): Promise<any> {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers with pagination and filtering' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Retrieved customers', type: [Customer] })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for name, email, or customer number' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by (default: createdAt)' })
  @ApiQuery({ name: 'sortDirection', required: false, description: 'Sort direction: asc or desc (default: desc)' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('isActive') isActive?: boolean | string,
    @Query('sortBy') sortBy?: string,
    @Query('sortDirection') sortDirection?: 'asc' | 'desc',
  ): Promise<any> {
    return this.customersService.findAll({
      page: page ? parseInt(page.toString(), 10) : undefined,
      limit: limit ? parseInt(limit.toString(), 10) : undefined,
      search,
      isActive: isActive === undefined ? undefined : isActive === true || isActive === 'true',
      sortBy,
      sortDirection,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Retrieved customer', type: Customer })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Customer not found' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  findOne(@Param('id') id: string): Promise<any> {
    return this.customersService.findOne(id);
  }

  @Get('number/:customerNumber')
  @ApiOperation({ summary: 'Get a customer by customer number' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Retrieved customer', type: Customer })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Customer not found' })
  @ApiParam({ name: 'customerNumber', description: 'Customer number' })
  findByCustomerNumber(@Param('customerNumber') customerNumber: string): Promise<any> {
    return this.customersService.findByCustomerNumber(customerNumber);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Customer updated successfully', type: Customer })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Customer not found' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto): Promise<any> {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Customer deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Customer not found' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  remove(@Param('id') id: string): Promise<any> {
    return this.customersService.remove(id);
  }

  // Contact endpoints
  @Post(':customerId/contacts')
  @ApiOperation({ summary: 'Add a contact to a customer' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Contact created successfully', type: CustomerContact })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Customer not found' })
  @ApiParam({ name: 'customerId', description: 'Customer ID' })
  createContact(
    @Param('customerId') customerId: string,
    @Body() createContactDto: CreateCustomerContactDto,
  ): Promise<any> {
    return this.customersService.createContact(customerId, createContactDto);
  }

  @Put('contacts/:id')
  @ApiOperation({ summary: 'Update a customer contact' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Contact updated successfully', type: CustomerContact })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Contact not found' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  updateContact(
    @Param('id') id: string,
    @Body() updateContactDto: Partial<CreateCustomerContactDto>,
  ): Promise<any> {
    return this.customersService.updateContact(id, updateContactDto);
  }

  @Delete('contacts/:id')
  @ApiOperation({ summary: 'Delete a customer contact' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Contact deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Contact not found' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  removeContact(@Param('id') id: string): Promise<any> {
    return this.customersService.removeContact(id);
  }
} 