import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApplyPaymentDto } from './dto/apply-payment.dto';
import { Payment } from './entities/payment.entity';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.paymentsService.createPayment(createPaymentDto);
  }

  @Get()
  async findAll(): Promise<Payment[]> {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Payment> {
    return this.paymentsService.getPaymentById(Number(id));
  }

  @Get('invoice/:invoiceId')
  async findByInvoiceId(@Param('invoiceId') invoiceId: string): Promise<Payment[]> {
    return this.paymentsService.findByInvoiceId(invoiceId);
  }

  @Post(':id/apply')
  async applyPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() applyPaymentDto: ApplyPaymentDto
  ): Promise<Payment> {
    return this.paymentsService.applyPayment(id, applyPaymentDto);
  }

  @Get('vendor/:vendorId')
  async getPaymentsByVendor(@Param('vendorId', ParseIntPipe) vendorId: number): Promise<Payment[]> {
    return this.paymentsService.getPaymentsByVendorId(vendorId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.paymentsService.deletePayment(id);
  }
} 