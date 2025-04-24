import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApplyPaymentDto } from './dto/apply-payment.dto';
import { InvoiceStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsRepository {
  constructor(private prisma: PrismaService) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.prisma.invoicePayment.create({
      data: {
        invoiceId: createPaymentDto.invoiceId,
        paymentDate: new Date(createPaymentDto.paymentDate),
        amount: createPaymentDto.amount,
        paymentMethod: createPaymentDto.paymentMethod,
        status: PaymentStatus.PENDING,
        referenceNumber: createPaymentDto.referenceNumber,
        notes: createPaymentDto.notes,
      },
    });
  }

  async findAll(): Promise<Payment[]> {
    return this.prisma.invoicePayment.findMany({
      orderBy: { paymentDate: 'desc' },
    });
  }

  async findOne(id: string): Promise<Payment | null> {
    return this.prisma.invoicePayment.findUnique({
      where: { id },
    });
  }

  async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
    return this.prisma.invoicePayment.findMany({
      where: { invoiceId },
      orderBy: { paymentDate: 'desc' },
    });
  }

  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment> {
    return this.prisma.invoicePayment.update({
      where: { id },
      data: { status },
    });
  }

  async deletePayment(id: string): Promise<Payment> {
    return this.prisma.invoicePayment.delete({
      where: { id },
    });
  }

  async getInvoiceWithPayments(invoiceId: string) {
    return this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });
  }

  async updateInvoiceBalances(invoiceId: string, amountPaid: number, balanceDue: number) {
    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid,
        balanceDue,
      },
    });
  }

  async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status },
    });
  }
} 