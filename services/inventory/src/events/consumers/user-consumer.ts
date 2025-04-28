import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

interface UserEvent {
  serviceSource: string | null;
  entityType: string | null;
  timestamp: Date;
  action: string | null;
  id: string | null;
  data?: any;
}

@Injectable()
export class UserConsumer {
  private readonly logger = new Logger(UserConsumer.name);

  @OnEvent('user.created')
  handleUserCreated(event: UserEvent) {
    this?.logger.log(`Received user.created event: ${JSON.stringify(event)}`);
    // Here we would typically process the event, such as:
    // - Store the user in a local database
    // - Update permissions
    // - Send a welcome email, etc.
  }

  @OnEvent('user.updated')
  handleUserUpdated(event: UserEvent) {
    this?.logger.log(`Received user.updated event: ${JSON.stringify(event)}`);
    // Update local user data if needed
  }

  @OnEvent('user.deleted')
  handleUserDeleted(event: UserEvent) {
    this?.logger.log(`Received user.deleted event: ${JSON.stringify(event)}`);
    // Handle user deletion if needed
  }
} 