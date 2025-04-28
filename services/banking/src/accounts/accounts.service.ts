import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { BankEntity } from './entities/bank.entity';
import { BankAccountEntity } from './entities/bank-account.entity';
import { Prisma } from '@prisma/client';
import { AccountType } from './enums/account-type.enum';
import { CurrencyCode } from './enums/currency-code.enum';

// Define a type that represents what we expect from Prisma
type PrismaWithModels = PrismaService & {
  bank: {
    create: (args: any) => Promise<any>;
    findMany: (args: any) => Promise<any[]>;
    findUnique: (args: any) => Promise<any | null>;
    update: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
  };
  bankAccount: {
    create: (args: any) => Promise<any>;
    findMany: (args: any) => Promise<any[]>;
    findUnique: (args: any) => Promise<any | null>;
    update: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
  };
  bankTransaction: {
    findMany: (args: any) => Promise<any[]>;
  };
};

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);
  private prismaWithModels: PrismaWithModels;

  constructor(private readonly prisma: PrismaService) {
    // Use type assertion to indicate to TypeScript that these models exist
    this.prismaWithModels = prisma as PrismaWithModels;
  }

  // Helper method to convert Prisma entities to our entity types
  private mapToBankEntity(bank: any): BankEntity {
    return {
      ...bank,
    } as BankEntity;
  }

  private mapToBankAccountEntity(bankAccount: any): BankAccountEntity {
    return {
      ...bankAccount,
      type: bankAccount.type as unknown as AccountType,
      currencyCode: bankAccount.currencyCode as unknown as CurrencyCode,
      bank: bankAccount.bank ? this.mapToBankEntity(bankAccount.bank) : undefined
    } as BankAccountEntity;
  }

  // Bank Methods
  async createBank(createBankDto: CreateBankDto): Promise<BankEntity> {
    try {
      const bank = await this?.prismaWithModels.bank.create({
        data: createBankDto,
      });
      this?.logger.log(`Created bank with ID: ${bank.id}`);
      return this.mapToBankEntity(bank);
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
    this?.logger.log(`Retrieving all banks${active !== undefined ? ` with active=${active}` : ''}`);
    const banks = await this?.prismaWithModels.bank.findMany(filter);
    return banks.map(bank => this.mapToBankEntity(bank));
  }

  async findActivebanks(): Promise<BankEntity[]> {
    this?.logger.log('Retrieving all active banks');
    return this.findAllBanks(true);
  }

  async findBankById(id: string): Promise<BankEntity> {
    this?.logger.log(`Retrieving bank with id: ${id}`);
    const bank = await this?.prismaWithModels.bank.findUnique({
      where: { id },
      include: { accounts: true },
    });

    if (!bank) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }

    return this.mapToBankEntity(bank);
  }

  async updateBank(id: string, updateBankDto: UpdateBankDto): Promise<BankEntity> {
    try {
      // First check if the bank exists
      await this.findBankById(id);

      const updatedBank = await this?.prismaWithModels.bank.update({
        where: { id },
        data: updateBankDto,
      });

      this?.logger.log(`Updated bank with ID: ${id}`);
      return this.mapToBankEntity(updatedBank);
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
    const bankAccounts = await this?.prismaWithModels.bankAccount.findMany({
      where: { bankId: id },
      take: 1,
    });

    if (bankAccounts.length > 0) {
      throw new ConflictException(
        'Cannot delete bank with associated accounts. Please delete accounts first or deactivate the bank.',
      );
    }

    await this?.prismaWithModels.bank.delete({ where: { id } });
    this?.logger.log(`Deleted bank with ID: ${id}`);
  }

  // Bank Account Methods
  async createBankAccount(createBankAccountDto: CreateBankAccountDto): Promise<BankAccountEntity> {
    try {
      // First check if the bank exists
      await this.findBankById(createBankAccountDto.bankId);

      const bankAccount = await this?.prismaWithModels.bankAccount.create({
        data: {
          ...createBankAccountDto,
          openingBalance: new Prisma.Decimal(createBankAccountDto.openingBalance || 0),
          currentBalance: new Prisma.Decimal(createBankAccountDto.openingBalance || 0),
        },
        include: { bank: true },
      });

      this?.logger.log(`Created bank account with ID: ${bankAccount.id}`);
      return this.mapToBankAccountEntity(bankAccount);
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
    
    this?.logger.log(`Retrieving all bank accounts${active !== undefined ? ` with active=${active}` : ''}${bankId ? ` for bank ${bankId}` : ''}`);
    
    const accounts = await this?.prismaWithModels.bankAccount.findMany({
      where,
      include: { bank: true },
    });

    return accounts.map(account => this.mapToBankAccountEntity(account));
  }

  async findBankAccountsByBankId(bankId: string): Promise<BankAccountEntity[]> {
    this?.logger.log(`Retrieving all bank accounts for bank ${bankId}`);
    return this.findAllBankAccounts(undefined, bankId);
  }

  async findActiveBankAccounts(): Promise<BankAccountEntity[]> {
    this?.logger.log('Retrieving all active bank accounts');
    return this.findAllBankAccounts(true);
  }

  async findBankAccountById(id: string): Promise<BankAccountEntity> {
    this?.logger.log(`Retrieving bank account with id: ${id}`);
    const bankAccount = await this?.prismaWithModels.bankAccount.findUnique({
      where: { id },
      include: { bank: true },
    });

    if (!bankAccount) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }

    return this.mapToBankAccountEntity(bankAccount);
  }

  async updateBankAccount(id: string, updateBankAccountDto: UpdateBankAccountDto): Promise<BankAccountEntity> {
    try {
      // First check if the bank account exists
      await this.findBankAccountById(id);

      // If bankId is included, check if the bank exists
      if (updateBankAccountDto.bankId) {
        await this.findBankById(updateBankAccountDto.bankId);
      }

      const updatedBankAccount = await this?.prismaWithModels.bankAccount.update({
        where: { id },
        data: {
          ...updateBankAccountDto,
          currentBalance: updateBankAccountDto.currentBalance 
            ? new Prisma.Decimal(updateBankAccountDto.currentBalance)
            : undefined,
        },
        include: { bank: true },
      });

      this?.logger.log(`Updated bank account with ID: ${id}`);
      return this.mapToBankAccountEntity(updatedBankAccount);
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
    const transactions = await this?.prismaWithModels.bankTransaction.findMany({
      where: { bankAccountId: id },
      take: 1,
    });

    if (transactions.length > 0) {
      throw new ConflictException(
        'Cannot delete bank account with associated transactions. Please deactivate the account instead.',
      );
    }

    await this?.prismaWithModels.bankAccount.delete({ where: { id } });
    this?.logger.log(`Deleted bank account with ID: ${id}`);
  }
} 