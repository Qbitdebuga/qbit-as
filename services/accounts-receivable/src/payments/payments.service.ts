import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PaymentsRepository } from './payments.repository';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApplyPaymentDto } from './dto/apply-payment.dto';
import { InvoiceStatus } from '../invoices/entities/invoice-status.enum';
import { PrismaService } from '../prisma/prisma.service';
import { Invoice } from '../invoices/entities/invoice.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private paymentsRepository: PaymentsRepository,
    private readonly prisma: PrismaService
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.paymentsRepository.createPayment(createPaymentDto);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentsRepository.findAll();
  }

  async getPaymentById(id: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne(id.toString());
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
    return this.paymentsRepository.findByInvoiceId(invoiceId);
  }

  async deletePayment(id: string): Promise<void> {
    const payment = await this.paymentsRepository.findOne(id);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    await this.paymentsRepository.deletePayment(id);
  }

  async applyPayment(paymentId: number, applyPaymentDto: ApplyPaymentDto): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId);
    
    // Get the invoice
    const invoice = await this.paymentsRepository.getInvoiceWithPayments(applyPaymentDto.invoiceId) as Invoice;
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${applyPaymentDto.invoiceId} not found`);
    }
    
    // Update the invoice balances
    const newAmountPaid = invoice.amountPaid + applyPaymentDto.amountApplied;
    const newBalanceDue = invoice.totalAmount - newAmountPaid;
    
    if (newBalanceDue < 0) {
      throw new BadRequestException(`Cannot apply more than the invoice amount`);
    }
    
    // Update the invoice balances
    await this.paymentsRepository.updateInvoiceBalances(
      applyPaymentDto.invoiceId, 
      newAmountPaid, 
      newBalanceDue
    );
    
    // Update invoice status if fully paid
    if (newBalanceDue === 0) {
      await this.updateInvoiceStatus(applyPaymentDto.invoiceId, InvoiceStatus.PAID);
    } else if (newBalanceDue < invoice.totalAmount) {
      await this.updateInvoiceStatus(applyPaymentDto.invoiceId, InvoiceStatus.PARTIAL);
    }
    
    return payment;
  }

  async getPaymentsByVendorId(vendorId: number): Promise<Payment[]> {
    // For now, we'll just return all payments as we may not have vendor ID in our model
    // This should be implemented properly based on the actual data model
    this.logger.log(`Getting payments for vendor ID: ${vendorId}`);
    return this.findAll();
  }

  async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus): Promise<void> {
    // Add any validation or business logic here
    await this.paymentsRepository.updateInvoiceStatus(invoiceId, status);
  }
} 