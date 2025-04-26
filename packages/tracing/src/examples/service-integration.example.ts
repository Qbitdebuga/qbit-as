/**
 * This is an example showing how to integrate the TracingService
 * with a NestJS service for distributed tracing.
 * 
 * Note: This example doesn't include actual imports from specific modules since this
 * is just a demonstration. You would need to adapt this to your project structure.
 */

// In a real application, your imports would look something like this:
// import { Injectable } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { PrismaClient } from '@prisma/client';
// import { firstValueFrom } from 'rxjs';
import { TracingService } from '../nestjs/tracing.service';

/*
// Example of a service using the TracingService for distributed tracing
@Injectable()
export class UserService {
  private prisma = new PrismaClient();

  constructor(
    private readonly httpService: HttpService,
    private readonly tracingService: TracingService
  ) {}

  // Find a user by ID
  async findUserById(id: string) {
    return this.tracingService.traceDb(
      'findFirst',
      'SELECT * FROM users WHERE id = $1',
      async (span) => {
        span.setAttribute('user.id', id);
        
        const user = await this.prisma.user.findFirst({
          where: { id },
        });
        
        // Add additional attributes after the operation completes
        if (user) {
          span.setAttribute('user.found', true);
          span.setAttribute('user.email', user.email);
        } else {
          span.setAttribute('user.found', false);
        }
        
        return user;
      }
    );
  }

  // Create a new user
  async createUser(data: { email: string; name: string }) {
    return this.tracingService.traceDb(
      'create',
      'INSERT INTO users (email, name) VALUES ($1, $2)',
      async () => {
        return this.prisma.user.create({
          data,
        });
      }
    );
  }

  // Fetch user permissions from auth service
  async getUserPermissions(userId: string) {
    return this.tracingService.traceHttp(
      'GET',
      `http://auth-service/api/v1/users/${userId}/permissions`,
      async (span) => {
        span.setAttribute('user.id', userId);
        
        try {
          const response = await firstValueFrom(
            this.httpService.get(`/api/v1/users/${userId}/permissions`)
          );
          
          span.setAttribute('permissions.count', response.data.permissions.length);
          return response.data.permissions;
        } catch (error) {
          span.setAttribute('error', true);
          span.setAttribute('error.message', error.message);
          throw error;
        }
      }
    );
  }

  // Publish user created event
  async publishUserCreatedEvent(user: any) {
    return this.tracingService.traceMessage(
      'publish',
      'user.created',
      async (span) => {
        span.setAttribute('user.id', user.id);
        span.setAttribute('user.email', user.email);
        
        // Simulate publishing an event
        console.log('Publishing user created event', user);
        
        // In a real implementation, you would use NATS or another message broker
        // await this.natsClient.publish('user.created', user);
        
        return true;
      }
    );
  }
}
*/

// Export TracingService for documentation
export { TracingService }; 