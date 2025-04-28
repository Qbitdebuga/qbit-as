import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApplyPaymentDto } from './dto/apply-payment.dto';
import { Payment } from './entities/payment.entity';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this?.paymentsService.createPayment(createPaymentDto);
  }

  @Get()
  async findAll(): Promise<Payment[]> {
    return this?.paymentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Payment> {
    return this?.paymentsService.getPaymentById(id);
  }

  @Get('invoice/:invoiceId')
  async findByInvoiceId(@Param('invoiceId') invoiceId: string): Promise<Payment[]> {
    return this?.paymentsService.findByInvoiceId(invoiceId);
  }

  @Post(':id/apply')
  async applyPayment(
    @Param('id') id: string,
    @Body() applyPaymentDto: ApplyPaymentDto
  ): Promise<Payment> {
    return this?.paymentsService.applyPayment(id, applyPaymentDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Body() updatePaymentDto: UpdatePaymentDto
  ): Promise<Payment> {
    return this?.paymentsService.update(id, updatePaymentDto);
  }

  @Get('vendor/:vendorId')
  async getPaymentsByVendor(@Param('vendorId') vendorId: string): Promise<Payment[]> {
    // Convert to number for compatibility with existing method
    return this?.paymentsService.getPaymentsByVendorId(parseInt(vendorId, 10));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this?.paymentsService.deletePayment(id);
  }
} 