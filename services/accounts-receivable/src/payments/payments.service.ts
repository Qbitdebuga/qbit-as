import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentsRepository } from './payments.repository';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApplyPaymentDto } from './dto/apply-payment.dto';
import { InvoiceStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private paymentsRepository: PaymentsRepository) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // First, verify that the invoice exists and has a balance due
    const invoice = await this.paymentsRepository.getInvoiceWithPayments(createPaymentDto.invoiceId);
    
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${createPaymentDto.invoiceId} not found`);
    }

    if (invoice.status === 'PAID' || invoice.status === 'VOID' || invoice.status === 'CANCELLED') {
      throw new BadRequestException(`Cannot add payment to invoice with status ${invoice.status}`);
    }
    
    if (invoice.balanceDue <= 0) {
      throw new BadRequestException('Invoice has no balance due');
    }

    // Check if payment amount is valid
    if (createPaymentDto.amount > invoice.balanceDue) {
      throw new BadRequestException(`Payment amount ${createPaymentDto.amount} exceeds balance due ${invoice.balanceDue}`);
    }

    // Create the payment
    const payment = await this.paymentsRepository.createPayment(createPaymentDto);

    // Update invoice balances
    const newAmountPaid = invoice.amountPaid + payment.amount;
    const newBalanceDue = invoice.totalAmount - newAmountPaid;
    
    // Update invoice status
    let newStatus = invoice.status;
    
    if (newBalanceDue <= 0) {
      newStatus = 'PAID';
    } else if (newAmountPaid > 0 && newBalanceDue > 0) {
      newStatus = 'PARTIAL';
    }

    // Update the invoice
    await this.paymentsRepository.updateInvoiceBalances(
      invoice.id,
      newAmountPaid,
      newBalanceDue
    );

    // If status needs to be changed, update it
    if (newStatus !== invoice.status) {
      await this.updateInvoiceStatus(invoice.id, newStatus as InvoiceStatus);
    }

    // Mark the payment as completed
    return this.paymentsRepository.updatePaymentStatus(payment.id, PaymentStatus.COMPLETED);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentsRepository.findAll();
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne(id);
    
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    
    return payment;
  }

  async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
    const invoice = await this.paymentsRepository.getInvoiceWithPayments(invoiceId);
    
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }
    
    return this.paymentsRepository.findByInvoiceId(invoiceId);
  }

  async deletePayment(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne(id);
    
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    
    // Only allow deletion of pending payments
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(`Cannot delete payment with status ${payment.status}`);
    }
    
    return this.paymentsRepository.deletePayment(id);
  }

  private async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
    return this.paymentsRepository.updateInvoiceStatus(invoiceId, status);
  }
} 