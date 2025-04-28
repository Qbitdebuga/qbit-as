import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PaymentsRepository } from './payments.repository.js';
import { Payment } from './entities/payment.entity.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { ApplyPaymentDto } from './dto/apply-payment.dto.js';
import { InvoiceStatus } from '../invoices/entities/invoice-status.enum.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Invoice } from '../invoices/entities/invoice.entity.js';
import { UpdatePaymentDto } from './dto/update-payment.dto.js';
import { PaymentStatus } from '../invoices/entities/payment-status.enum.js';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private paymentsRepository: PaymentsRepository,
    private readonly prisma: PrismaService
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    try {
      return await this.paymentsRepository.createPayment(createPaymentDto);
    } catch (error: any) {
      this.logger.error(`Failed to create payment: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<Payment[]> {
    try {
      return await this.paymentsRepository.findAll();
    } catch (error: any) {
      this.logger.error(`Failed to find all payments: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<Payment> {
    try {
      const payment = await this.paymentsRepository.findOne(id);
      if (!payment) {
        throw new NotFoundException(`Payment with ID "${id}" not found`);
      }
      return payment;
    } catch (error: any) {
      this.logger.error(`Failed to find payment by id ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPaymentById(id: string): Promise<Payment> {
    return this.findOne(id);
  }

  async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
    try {
      return await this.paymentsRepository.findByInvoiceId(invoiceId);
    } catch (error: any) {
      this.logger.error(`Failed to find payments for invoice ${invoiceId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    try {
      if (!updatePaymentDto.status) {
        throw new BadRequestException('Payment status is required');
      }
      return await this.paymentsRepository.updatePaymentStatus(id, updatePaymentDto.status);
    } catch (error: any) {
      this.logger.error(`Failed to update payment: ${error.message}`, error.stack);
      throw error;
    }
  }

  async applyPayment(id: string, applyPaymentDto: ApplyPaymentDto): Promise<Payment> {
    try {
      const payment = await this.findOne(id);
      
      if (!payment) {
        throw new NotFoundException(`Payment with ID "${id}" not found`);
      }
      
      // Set the payment ID in the DTO
      const dto: ApplyPaymentDto = {
        ...applyPaymentDto,
        paymentId: id
      };
      
      // Apply the payment to the invoice using the repository
      const updatedPayment = await this.paymentsRepository.applyPayment(dto);
      
      // Update the invoice status based on the payment application
      await this.updateInvoiceStatus(applyPaymentDto.invoiceId);
      
      return updatedPayment;
    } catch (error: any) {
      this.logger.error(`Failed to apply payment: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deletePayment(id: string): Promise<void> {
    try {
      await this.paymentsRepository.deletePayment(id);
    } catch (error: any) {
      this.logger.error(`Failed to delete payment ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPaymentsByVendorId(vendorId: number): Promise<Payment[]> {
    try {
      return await this.paymentsRepository.getPaymentsByVendorId(vendorId);
    } catch (error: any) {
      this.logger.error(`Failed to get payments for vendor ${vendorId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getInvoiceWithPayments(invoiceId: string): Promise<any> {
    try {
      return await this.paymentsRepository.getInvoiceWithPayments(invoiceId);
    } catch (error: any) {
      this.logger.error(`Failed to get invoice with payments: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async updateInvoiceStatus(invoiceId: string): Promise<void> {
    try {
      const invoiceWithPayments = await this.paymentsRepository.getInvoiceWithPayments(invoiceId);
      
      if (!invoiceWithPayments) {
        throw new NotFoundException(`Invoice with ID "${invoiceId}" not found`);
      }
      
      // Calculate total payments made to this invoice
      const totalPayments = invoiceWithPayments.payments ? 
        invoiceWithPayments.payments.reduce(
          (sum: number, payment: Payment) => sum + payment.amount, 
          0
        ) : 0;
      
      // Determine the new status based on payment totals
      let newStatus: InvoiceStatus;
      if (totalPayments >= invoiceWithPayments.totalAmount) {
        newStatus = InvoiceStatus.PAID;
      } else if (totalPayments > 0) {
        newStatus = InvoiceStatus.PARTIAL;
      } else {
        newStatus = InvoiceStatus.PENDING;
      }
      
      // Update the invoice status
      await this.paymentsRepository.updateInvoiceStatus(invoiceId, newStatus);
    } catch (error: any) {
      this.logger.error(`Failed to update invoice status: ${error.message}`, error.stack);
      throw error;
    }
  }
} 