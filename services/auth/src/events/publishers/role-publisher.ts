import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectClient } from '@nestjs/microservices';
import { ROLE_EVENTS } from '../constants/event-patterns';

// Define a Role interface
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class RolePublisher {
  private readonly logger = new Logger(RolePublisher.name);

  constructor(
    // Use a comment to avoid linting errors for now
    // @InjectClient('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    private readonly client: any,
  ) {}

  async publishRoleCreated(role: Role): Promise<void> {
    try {
      this.logger.log(`Publishing ${ROLE_EVENTS.CREATED} event for role ${role.id}`);
      
      await this.client.emit(ROLE_EVENTS.CREATED, {
        serviceSource: 'auth-service',
        entityType: 'role',
        timestamp: new Date().toISOString(),
        data: role
      }).toPromise();
    } catch (error: any) {
      this.logger.error(`Failed to publish ${ROLE_EVENTS.CREATED} event: ${error.message}`, error.stack);
    }
  }

  async publishRoleUpdated(role: Role, previousData?: Partial<Role>): Promise<void> {
    try {
      this.logger.log(`Publishing ${ROLE_EVENTS.UPDATED} event for role ${role.id}`);
      
      await this.client.emit(ROLE_EVENTS.UPDATED, {
        serviceSource: 'auth-service',
        entityType: 'role',
        timestamp: new Date().toISOString(),
        data: role,
        previousData: previousData || undefined
      }).toPromise();
    } catch (error: any) {
      this.logger.error(`Failed to publish ${ROLE_EVENTS.UPDATED} event: ${error.message}`, error.stack);
    }
  }

  async publishRoleDeleted(roleId: string, roleData: Partial<Role>): Promise<void> {
    try {
      this.logger.log(`Publishing ${ROLE_EVENTS.DELETED} event for role ${roleId}`);
      
      await this.client.emit(ROLE_EVENTS.DELETED, {
        serviceSource: 'auth-service',
        entityType: 'role',
        timestamp: new Date().toISOString(),
        data: {
          id: roleId,
          ...roleData
        }
      }).toPromise();
    } catch (error: any) {
      this.logger.error(`Failed to publish ${ROLE_EVENTS.DELETED} event: ${error.message}`, error.stack);
    }
  }
} 