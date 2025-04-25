import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Account, AccountWithHierarchy } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsRepository {
  private readonly logger = new Logger(AccountsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async createAccount(data: CreateAccountDto) {
    return this.prisma.db.account.create({ data });
  }

  async findAll() {
    return this.prisma.db.account.findMany();
  }

  async findAllActive(): Promise<Account[]> {
    return this.prisma.db.account.findMany({
      where: { isActive: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.db.account.findUnique({
      where: { id }
    });
  }

  async findByIds(ids: string[]): Promise<Account[]> {
    return this.prisma.db.account.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async findOneWithHierarchy(id: string): Promise<AccountWithHierarchy | null> {
    return this.prisma.db.account.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findByCode(code: string): Promise<Account | null> {
    return this.prisma.db.account.findUnique({
      where: { code },
    });
  }

  async findByType(type: string) {
    return this.prisma.db.account.findMany({
      where: {
        type
      }
    });
  }

  async findByCategory(category: string) {
    return this.prisma.db.account.findMany({
      where: {
        category
      }
    });
  }

  async findByAccountNumber(accountNumber: string) {
    return this.prisma.db.account.findUnique({
      where: { accountNumber }
    });
  }

  async findByParentId(parentId: string) {
    return this.prisma.db.account.findUnique({
      where: { id: parentId }
    });
  }

  async findChildAccounts(parentId: string) {
    return this.prisma.db.account.findMany({
      where: {
        parentId
      }
    });
  }

  async update(id: string, data: UpdateAccountDto) {
    return this.prisma.db.account.update({
      where: { id },
      data
    });
  }

  async remove(id: string) {
    return this.prisma.db.account.delete({
      where: { id }
    });
  }
} 