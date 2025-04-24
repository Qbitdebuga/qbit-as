import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  ParseUUIDPipe, 
  Patch, 
  Post, 
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateInvoicePaymentDto } from './dto/create-invoice-payment.dto';
import { InvoiceListParamsDto } from './dto/invoice-list-params.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './entities/invoice.entity';
import { InvoicePayment } from './entities/invoice-payment.entity';
import { InvoicesService } from './invoices.service';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'The invoice has been created', type: Invoice })
  async create(@Body() createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices with filtering, sorting and pagination' })
  @ApiResponse({ status: 200, description: 'Returns a paginated list of invoices', type: [Invoice] })
  async findAll(@Query() params: InvoiceListParamsDto): Promise<{ data: Invoice[]; total: number; page: number; limit: number }> {
    return this.invoicesService.findAll(params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invoice by ID' })
  @ApiResponse({ status: 200, description: 'Returns the invoice', type: Invoice })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Invoice> {
    return this.invoicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an invoice' })
  @ApiResponse({ status: 200, description: 'The invoice has been updated', type: Invoice })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an invoice' })
  @ApiResponse({ status: 204, description: 'The invoice has been deleted' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.invoicesService.remove(id);
  }

  @Post(':id/finalize')
  @ApiOperation({ summary: 'Finalize an invoice (change status from DRAFT to PENDING)' })
  @ApiResponse({ status: 200, description: 'The invoice has been finalized', type: Invoice })
  async finalize(@Param('id', ParseUUIDPipe) id: string): Promise<Invoice> {
    return this.invoicesService.finalize(id);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Mark an invoice as sent' })
  @ApiResponse({ status: 200, description: 'The invoice has been marked as sent', type: Invoice })
  async markAsSent(@Param('id', ParseUUIDPipe) id: string): Promise<Invoice> {
    return this.invoicesService.markAsSent(id);
  }

  @Post(':id/void')
  @ApiOperation({ summary: 'Void an invoice' })
  @ApiResponse({ status: 200, description: 'The invoice has been voided', type: Invoice })
  async voidInvoice(@Param('id', ParseUUIDPipe) id: string): Promise<Invoice> {
    return this.invoicesService.voidInvoice(id);
  }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Record a payment for an invoice' })
  @ApiResponse({ status: 201, description: 'The payment has been recorded', type: InvoicePayment })
  async createPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createPaymentDto: CreateInvoicePaymentDto,
  ): Promise<InvoicePayment> {
    // Ensure the invoice ID in the path matches the one in the DTO
    createPaymentDto.invoiceId = id;
    return this.invoicesService.createPayment(createPaymentDto);
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Get all payments for an invoice' })
  @ApiResponse({ status: 200, description: 'Returns all payments for the invoice', type: [InvoicePayment] })
  async getPayments(@Param('id', ParseUUIDPipe) id: string): Promise<InvoicePayment[]> {
    return this.invoicesService.getPaymentsByInvoiceId(id);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get all invoices for a customer' })
  @ApiResponse({ status: 200, description: 'Returns all invoices for the customer', type: [Invoice] })
  async getInvoicesByCustomer(
    @Param('customerId', ParseUUIDPipe) customerId: string,
    @Query() params: InvoiceListParamsDto,
  ): Promise<{ data: Invoice[]; total: number; page: number; limit: number }> {
    // Override the customerId in params with the one from the path
    params.customerId = customerId;
    return this.invoicesService.findAll(params);
  }
} 