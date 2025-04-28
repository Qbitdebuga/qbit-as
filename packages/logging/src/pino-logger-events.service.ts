import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PinoLoggerService } from './pino-logger.service';

/**
 * This service handles integration with the messaging system for dynamic 
 * log level changes and centralized logging
 */
@Injectable()
export class PinoLoggerEventsService implements OnModuleInit, OnModuleDestroy {
  private serviceName: string;
  private isConnected = false;

  constructor(
    private readonly logger: PinoLoggerService,
  ) {
    this.logger.setContext('LoggerEvents');
    // Default service name, should be overridden in module configuration
    this.serviceName = process.env.SERVICE_NAME || 'unknown-service';
  }

  /**
   * Set the service name for event source identification
   */
  setServiceName(name: string): this {
    this.serviceName = name;
    return this;
  }

  /**
   * When module initializes, attempt to connect to the message broker
   */
  async onModuleInit() {
    try {
      await this.connect();
      this.logger.log(`Logger events service initialized for ${this.serviceName}`);
    } catch (error: any) {
      this.logger.warn(
        `Failed to initialize logger events service: ${error.message}. Logging will work locally only.`
      );
    }
  }

  /**
   * Disconnect when module is destroyed
   */
  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Connect to the message broker
   * This implementation can be extended to use RabbitMQ, Kafka, or other message brokers
   */
  private async connect(): Promise<void> {
    try {
      // In the real implementation, this would connect to the message broker
      // For now, we'll just simulate a successful connection
      this.isConnected = true;
      
      // Subscribe to log level change events
      this.subscribeToLogLevelChanges();
      
      this.logger.debug('Connected to message broker for logging events');
    } catch (error: any) {
      this.isConnected = false;
      this.logger.error(`Failed to connect to message broker: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Disconnect from the message broker
   */
  private async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      // In the real implementation, this would disconnect from the message broker
      this.isConnected = false;
      this.logger.debug('Disconnected from message broker for logging events');
    } catch (error: any) {
      this.logger.error(`Error disconnecting from message broker: ${error.message}`, error.stack);
    }
  }

  /**
   * Subscribe to log level change events
   */
  private subscribeToLogLevelChanges(): void {
    if (!this.isConnected) {
      return;
    }

    try {
      // In the real implementation, this would subscribe to the log level change event
      this.logger.debug('Subscribed to log level change events');
    } catch (error: any) {
      this.logger.error(`Failed to subscribe to log level change events: ${error.message}`, error.stack);
    }
  }

  /**
   * Send a log entry to the centralized logging system
   * @param level Log level
   * @param message Log message
   * @param meta Additional metadata
   */
  public sendLogEntry(level: string, message: string, meta: any = {}): void {
    if (!this.isConnected) {
      return;
    }

    try {
      const logEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        serviceSource: this.serviceName,
        ...meta
      };

      // In the real implementation, this would publish the log entry to the message broker
      this.logger.debug(`Would send log entry to centralized system: ${JSON.stringify(logEntry)}`);
    } catch (error: any) {
      // Just log locally, don't try to send again to avoid loops
      this.logger.debug(`Failed to send log entry: ${error.message}`);
    }
  }
} 