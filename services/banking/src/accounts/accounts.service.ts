import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { BankEntity } from './entities/bank.entity';
import { BankAccountEntity } from './entities/bank-account.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Bank Methods
  async createBank(createBankDto: CreateBankDto): Promise<BankEntity> {
    try {
      const bank = await this.prisma.bank.create({
        data: createBankDto,
      });
      this.logger.log(`Created bank with ID: ${bank.id}`);
      return bank;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Bank with this code already exists');
        }
      }
      throw error;
    }
  }

  async findAllBanks(active?: boolean): Promise<BankEntity[]> {
    const filter = active !== undefined ? { where: { isActive: active } } : {};
    this.logger.log(`Retrieving all banks${active !== undefined ? ` with active=${active}` : ''}`);
    return this.prisma.bank.findMany(filter);
  }

  async findBankById(id: string): Promise<BankEntity> {
    this.logger.log(`Retrieving bank with id: ${id}`);
    const bank = await this.prisma.bank.findUnique({
      where: { id },
      include: { accounts: true },
    });

    if (!bank) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }

    return bank;
  }

  async updateBank(id: string, updateBankDto: UpdateBankDto): Promise<BankEntity> {
    try {
      // First check if the bank exists
      await this.findBankById(id);

      const updatedBank = await this.prisma.bank.update({
        where: { id },
        data: updateBankDto,
      });

      this.logger.log(`Updated bank with ID: ${id}`);
      return updatedBank;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Bank with this code already exists');
        }
      }
      throw error;
    }
  }

  async removeBank(id: string): Promise<void> {
    // Check if the bank exists
    await this.findBankById(id);

    // Check if the bank has any accounts
    const bankAccounts = await this.prisma.bankAccount.findMany({
      where: { bankId: id },
      take: 1,
    });

    if (bankAccounts.length > 0) {
      throw new ConflictException(
        'Cannot delete bank with associated accounts. Please delete accounts first or deactivate the bank.',
      );
    }

    await this.prisma.bank.delete({ where: { id } });
    this.logger.log(`Deleted bank with ID: ${id}`);
  }

  // Bank Account Methods
  async createBankAccount(createBankAccountDto: CreateBankAccountDto): Promise<BankAccountEntity> {
    try {
      // First check if the bank exists
      await this.findBankById(createBankAccountDto.bankId);

      const bankAccount = await this.prisma.bankAccount.create({
        data: {
          ...createBankAccountDto,
          openingBalance: new Prisma.Decimal(createBankAccountDto.openingBalance || 0),
          currentBalance: new Prisma.Decimal(createBankAccountDto.openingBalance || 0),
        },
        include: { bank: true },
      });

      this.logger.log(`Created bank account with ID: ${bankAccount.id}`);
      return bankAccount;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Bank account with this account number already exists at this bank');
        }
      }
      throw error;
    }
  }

  async findAllBankAccounts(active?: boolean, bankId?: string): Promise<BankAccountEntity[]> {
    const where: any = {};
    
    if (active !== undefined) {
      where.isActive = active;
    }
    
    if (bankId) {
      where.bankId = bankId;
    }
    
    this.logger.log(`Retrieving all bank accounts${active !== undefined ? ` with active=${active}` : ''}${bankId ? ` for bank ${bankId}` : ''}`);
    
    return this.prisma.bankAccount.findMany({
      where,
      include: { bank: true },
    });
  }

  async findBankAccountById(id: string): Promise<BankAccountEntity> {
    this.logger.log(`Retrieving bank account with id: ${id}`);
    const bankAccount = await this.prisma.bankAccount.findUnique({
      where: { id },
      include: { bank: true },
    });

    if (!bankAccount) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }

    return bankAccount;
  }

  async updateBankAccount(id: string, updateBankAccountDto: UpdateBankAccountDto): Promise<BankAccountEntity> {
    try {
      // First check if the bank account exists
      await this.findBankAccountById(id);

      // If bankId is included, check if the bank exists
      if (updateBankAccountDto.bankId) {
        await this.findBankById(updateBankAccountDto.bankId);
      }

      const updatedBankAccount = await this.prisma.bankAccount.update({
        where: { id },
        data: {
          ...updateBankAccountDto,
          currentBalance: updateBankAccountDto.currentBalance 
            ? new Prisma.Decimal(updateBankAccountDto.currentBalance)
            : undefined,
        },
        include: { bank: true },
      });

      this.logger.log(`Updated bank account with ID: ${id}`);
      return updatedBankAccount;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Bank account with this account number already exists at this bank');
        }
      }
      throw error;
    }
  }

  async removeBankAccount(id: string): Promise<void> {
    // Check if the bank account exists
    await this.findBankAccountById(id);

    // Check if the bank account has any transactions
    const transactions = await this.prisma.bankTransaction.findMany({
      where: { bankAccountId: id },
      take: 1,
    });

    if (transactions.length > 0) {
      throw new ConflictException(
        'Cannot delete bank account with associated transactions. Please deactivate the account instead.',
      );
    }

    await this.prisma.bankAccount.delete({ where: { id } });
    this.logger.log(`Deleted bank account with ID: ${id}`);
  }
} 