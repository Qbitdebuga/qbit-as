import { NatsClient } from '../clients/nats-client';
import { Event } from '../publishers/base-publisher';
import type { ConsumerConfig, JsMsg, DeliverPolicy, AckPolicy, ReplayPolicy, RetentionPolicy, StorageType, DiscardPolicy } from 'nats';

/**
 * Abstract base listener for all event listeners
 */
export abstract class Listener<T extends Event> {
  abstract readonly subject: string;
  abstract readonly queueGroup: string;
  abstract onMessage(data: T['data'], msg: JsMsg): Promise<void>;
  private readonly natsClient: NatsClient;
  private running = false;

  constructor() {
    this.natsClient = NatsClient.getInstance();
  }

  /**
   * Get subscription options for the listener
   */
  protected subscriptionOptions(): Partial<ConsumerConfig> {
    return {
      durable_name: this.queueGroup, // Durable consumers remember their position
      deliver_policy: 'all' as DeliverPolicy, // Deliver all available messages
      ack_policy: 'explicit' as AckPolicy, // Manual acknowledgment
      replay_policy: 'instant' as ReplayPolicy, // Replay messages as fast as possible
    };
  }

  /**
   * Start listening for events
   */
  async listen(): Promise<void> {
    if (this.running) {
      return;
    }

    if (!this.natsClient.isConnected()) {
      throw new Error('Cannot listen for events: Not connected to NATS');
    }

    try {
      // Ensure the stream exists
      const streamName = this.getStreamName();
      try {
        await this.natsClient.jsm.streams.info(streamName);
      } catch (error) {
        // Stream doesn't exist, create it
        await this.natsClient.jsm.streams.add({
          name: streamName,
          subjects: [`${streamName}.*`],
          retention: 'limits' as RetentionPolicy,
          max_age: 24 * 60 * 60 * 1000 * 7, // 1 week in ms
          storage: 'file' as StorageType,
          discard: 'old' as DiscardPolicy,
          max_msgs: 1000000,
        });
      }

      // Create JetStream consumer
      const js = this.natsClient.jetstream;
      const consumerOpts = this.subscriptionOptions();
      
      console.log(`Listening for events on ${this.subject} [${this.queueGroup}]...`);
      
      // Create JetStream consumer and subscription
      const subscription = await js.pullSubscribe(this.subject, {
        queue: this.queueGroup,
        ...consumerOpts,
      });

      // Start pulling messages
      this.running = true;
      this.processPullSubscription(subscription);
      
    } catch (error) {
      console.error(`Failed to subscribe to ${this.subject}:`, error);
      throw error;
    }
  }

  /**
   * Process messages from a pull subscription
   */
  private async processPullSubscription(subscription: any): Promise<void> {
    while (this.running && this.natsClient.isConnected()) {
      try {
        // Pull up to 10 messages at a time with a 1s timeout
        const messages = await subscription.fetch(10, { timeout: 1000 });
        
        if (messages && messages.length) {
          for (const msg of messages) {
            try {
              const decoder = this.natsClient.jsonCodec;
              const decodedData = decoder.decode(msg.data) as { id: string; timestamp: string; data: T['data'] };
              
              // Process the message
              await this.onMessage(decodedData.data, msg);
              
              // Acknowledge the message
              msg.ack();
              
            } catch (error) {
              console.error(`Error processing message on ${this.subject}:`, error);
              
              // Negative acknowledge to retry later
              msg.nak();
            }
          }
        }
      } catch (error) {
        // Most likely a timeout, which is fine
        if (!(error instanceof Error) || !error.message.includes('timeout')) {
          console.error(`Error fetching messages from ${this.subject}:`, error);
        }
      }
      
      // Artificial delay to avoid CPU spinning
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Stop listening for events
   */
  stop(): void {
    this.running = false;
  }

  /**
   * Get the stream name from the subject
   * Converts subjects like 'user.created' to 'USER'
   */
  private getStreamName(): string {
    const parts = this.subject.split('.');
    return parts.length > 0 ? parts[0].toUpperCase() : 'EVENTS';
  }
} 