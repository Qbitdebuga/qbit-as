import { NatsClient } from '../clients/nats-client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Base event interface
 */
export interface Event {
  subject: string;
  data: any;
}

/**
 * Abstract base publisher for all event publishers
 */
export abstract class Publisher<T extends Event> {
  abstract readonly subject: string;
  private readonly natsClient: NatsClient;

  constructor() {
    this.natsClient = NatsClient.getInstance();
  }

  /**
   * Publish an event to NATS
   * @param data Event data
   */
  async publish(data: T['data']): Promise<void> {
    if (!this.natsClient.isConnected()) {
      throw new Error('Cannot publish event: Not connected to NATS');
    }

    const eventId = uuidv4();
    const message = {
      id: eventId,
      timestamp: new Date().toISOString(),
      data
    };

    try {
      const js = this.natsClient.jetstream;
      const encoder = this.natsClient.jsonCodec;
      
      // Ensure stream exists
      const streamName = this.getStreamName();
      try {
        await this.natsClient.jsm.streams.info(streamName);
      } catch (error) {
        // Stream doesn't exist, create it
        await this.natsClient.jsm.streams.add({
          name: streamName,
          subjects: [`${streamName}.*`],
          retention: 'limits',
          max_age: 24 * 60 * 60 * 1000 * 7, // 1 week in ms
          storage: 'file',
          discard: 'old',
          max_msgs: 1000000,
        });
      }
      
      // Publish to JetStream
      await js.publish(this.subject, encoder.encode(message));
      console.log(`Event published to ${this.subject}: ${eventId}`);
    } catch (error) {
      console.error(`Failed to publish event to ${this.subject}:`, error);
      throw error;
    }
  }

  /**
   * Get the stream name from the subject
   * Converts subjects like 'user.created' to 'USER'
   */
  private getStreamName(): string {
    const parts = this.subject.split('.');
    return parts[0].toUpperCase();
  }
} 