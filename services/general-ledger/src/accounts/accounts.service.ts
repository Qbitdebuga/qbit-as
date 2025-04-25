import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { AccountsRepository } from './accounts.repository';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account, AccountWithHierarchy } from './entities/account.entity';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { AccountPublisher } from '../events/publishers/account-publisher';
import axios from 'axios';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);
  private readonly reportingServiceUrl: string;

  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly accountPublisher: AccountPublisher,
  ) {
    this.reportingServiceUrl = this.configService.get<string>('REPORTING_SERVICE_URL', 'http://localhost:3004');
  }

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    this.logger.log(`Creating account: ${createAccountDto.name}`);
    
    // Validate parent account if one is provided
    if (createAccountDto.parentId) {
      const parentExists = await this.accountsRepository.findOne(createAccountDto.parentId);
      if (!parentExists) {
        throw new NotFoundException(`Parent account with ID ${createAccountDto.parentId} not found`);
      }
    }
    
    // Check for duplicate code
    const existingAccountCode = await this.accountsRepository.findByCode(createAccountDto.code);
    if (existingAccountCode) {
      throw new ConflictException(`Account with code ${createAccountDto.code} already exists`);
    }
    
    // Create the account
    return this.accountsRepository.createAccount(createAccountDto);
  }

  async findAll(): Promise<Account[]> {
    return this.accountsRepository.findAll();
  }

  async findByIds(ids: string[]): Promise<Account[]> {
    return this.accountsRepository.findByIds(ids);
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

    const updatedAccount = await this.accountsRepository.update(id, updateAccountDto);
    
    // Publish account.updated event
    await this.accountPublisher.publishAccountUpdated(updatedAccount);
    
    return updatedAccount;
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

    const deletedAccount = await this.accountsRepository.remove(id);
    
    // Publish account.deleted event
    await this.accountPublisher.publishAccountDeleted(id);
    
    return deletedAccount;
  }

  async getAccounts() {
    return this.prisma.db.account.findMany();
  }

  async getAccountById(id: string) {
    return this.prisma.db.account.findUnique({
      where: { id },
    });
  }

  async createAccount(createAccountDto: CreateAccountDto): Promise<Account> {
    this.logger.log(`Creating account with name: ${createAccountDto.name}`);
    const account = await this.prisma.db.account.create({
      data: createAccountDto,
    });
    // Publish account created event
    await this.accountPublisher.publishAccountCreated(account);
    return account;
  }

  async updateAccount(id: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
    this.logger.log(`Updating account with id: ${id}`);
    const account = await this.prisma.db.account.update({
      where: { id },
      data: updateAccountDto,
    });
    // Publish account updated event
    await this.accountPublisher.publishAccountUpdated(account);
    return account;
  }

  async deleteAccount(id: string): Promise<Account> {
    this.logger.log(`Deleting account with id: ${id}`);
    const account = await this.prisma.db.account.delete({
      where: { id },
    });
    // Publish account deleted event
    await this.accountPublisher.publishAccountDeleted(id);
    return account;
  }

  /**
   * Example of how to call another service using service-to-service authentication
   */
  async generateAccountReport(accountId: string) {
    try {
      // Get auth headers with appropriate scopes
      const headers = await this.authService.getAuthHeaders({
        scopes: ['reporting:read', 'gl:read']
      });

      // Make authenticated request to the reporting service
      const response = await axios.post(
        `${this.reportingServiceUrl}/reports/accounts/${accountId}`,
        { format: 'pdf' },
        { headers }
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to generate account report: ${error.message}`, error.stack);
      throw new Error(`Failed to generate account report: ${error.message}`);
    }
  }

  // Helper method for chart of accounts
  async getChartOfAccounts(): Promise<Account[]> {
    this.logger.log('Getting chart of accounts');
    return this.accountsRepository.findAll();
  }

  async getAccountDetails(id: string): Promise<Account | null> {
    this.logger.log(`Getting account details for id: ${id}`);
    return this.accountsRepository.findOne(id);
  }
} 