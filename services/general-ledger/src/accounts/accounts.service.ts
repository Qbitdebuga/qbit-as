import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AccountsRepository } from './accounts.repository';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account, AccountWithHierarchy } from './entities/account.entity';

@Injectable()
export class AccountsService {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    // Check if account with the same code already exists
    const existingAccount = await this.accountsRepository.findByCode(createAccountDto.code);
    if (existingAccount) {
      throw new ConflictException(`Account with code ${createAccountDto.code} already exists`);
    }

    // If parent ID is provided, check if parent exists
    if (createAccountDto.parentId) {
      const parent = await this.accountsRepository.findOne(createAccountDto.parentId);
      if (!parent) {
        throw new NotFoundException(`Parent account with ID ${createAccountDto.parentId} not found`);
      }
    }

    return this.accountsRepository.create(createAccountDto);
  }

  async findAll(): Promise<Account[]> {
    return this.accountsRepository.findAll();
  }

  async findAllActive(): Promise<Account[]> {
    return this.accountsRepository.findAllActive();
  }

  async findOne(id: string): Promise<Account> {
    const account = await this.accountsRepository.findOne(id);
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return account;
  }

  async findOneWithHierarchy(id: string): Promise<AccountWithHierarchy> {
    const account = await this.accountsRepository.findOneWithHierarchy(id);
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    return account;
  }

  async findByType(type: string): Promise<Account[]> {
    return this.accountsRepository.findByType(type);
  }

  async update(id: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
    // Check if account exists
    await this.findOne(id);

    // If code is being updated, check if the new code is unique
    if (updateAccountDto.code) {
      const existingAccount = await this.accountsRepository.findByCode(updateAccountDto.code);
      if (existingAccount && existingAccount.id !== id) {
        throw new ConflictException(`Account with code ${updateAccountDto.code} already exists`);
      }
    }

    // If parent ID is provided, check if parent exists and avoid circular references
    if (updateAccountDto.parentId) {
      // Can't set itself as parent
      if (updateAccountDto.parentId === id) {
        throw new ConflictException(`Account cannot be its own parent`);
      }

      const parent = await this.accountsRepository.findOne(updateAccountDto.parentId);
      if (!parent) {
        throw new NotFoundException(`Parent account with ID ${updateAccountDto.parentId} not found`);
      }

      // TODO: Add more comprehensive circular reference check for deeper hierarchies
    }

    return this.accountsRepository.update(id, updateAccountDto);
  }

  async remove(id: string): Promise<Account> {
    // Check if account exists
    await this.findOne(id);

    // Check if account has children
    const accountWithHierarchy = await this.accountsRepository.findOneWithHierarchy(id);
    if (accountWithHierarchy?.children && accountWithHierarchy.children.length > 0) {
      throw new ConflictException(`Cannot delete account with children. Remove or reassign children first.`);
    }

    // Check if account is used in journal entries
    // This would require a more complex query to check for references

    return this.accountsRepository.remove(id);
  }
} 