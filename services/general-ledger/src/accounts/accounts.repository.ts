import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Account, AccountWithHierarchy } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAccountDto): Promise<Account> {
    return this.prisma.account.create({ data });
  }

  async findAll(): Promise<Account[]> {
    return this.prisma.account.findMany();
  }

  async findAllActive(): Promise<Account[]> {
    return this.prisma.account.findMany({
      where: { isActive: true },
    });
  }

  async findOne(id: string): Promise<Account | null> {
    return this.prisma.account.findUnique({
      where: { id },
    });
  }

  async findByIds(ids: string[]): Promise<Account[]> {
    return this.prisma.account.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async findOneWithHierarchy(id: string): Promise<AccountWithHierarchy | null> {
    return this.prisma.account.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findByCode(code: string): Promise<Account | null> {
    return this.prisma.account.findUnique({
      where: { code },
    });
  }

  async findByType(type: string): Promise<Account[]> {
    return this.prisma.account.findMany({
      where: { type },
    });
  }

  async update(id: string, data: UpdateAccountDto): Promise<Account> {
    return this.prisma.account.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Account> {
    return this.prisma.account.delete({
      where: { id },
    });
  }
} 