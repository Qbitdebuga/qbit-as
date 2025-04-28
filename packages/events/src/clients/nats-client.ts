import { connect, NatsConnection, JSONCodec, JetStreamClient, JetStreamManager } from 'nats';

/**
 * Singleton NATS client for managing connection to NATS server
 */
export class NatsClient {
  private static instance: NatsClient;
  private _client?: NatsConnection;
  private _jetstream?: JetStreamClient;
  private _jsm?: JetStreamManager;
  private _jsonCodec = JSONCodec();

  private constructor() {}

  /**
   * Get the singleton instance of NatsClient
   */
  public static getInstance(): NatsClient {
    if (!NatsClient.instance) {
      NatsClient.instance = new NatsClient();
    }
    return NatsClient.instance;
  }

  /**
   * Connect to NATS server
   * @param servers Array of server URLs
   * @param options Optional connection options
   */
  public async connect(servers: string[] = ['nats://localhost:4222'], options = {}): Promise<void> {
    try {
      this._client = await connect({
        servers,
        ...options
      });

      console.log(`Connected to NATS server at ${this?._client.getServer()}`);
      
      // Create JetStream client for persistent messaging
      this._jetstream = this?._client.jetstream();
      this._jsm = await this?._client.jetstreamManager();
      
      // Setup reconnection handling
      (async () => {
        for await (const status of this._client!.status()) {
          console.log(`NATS connection status change: ${JSON.stringify(status)}`);
        }
      })().catch(error => console.error('Error monitoring NATS status:', error));
      
      // Setup error handling
      this?._client.closed().then((err: any) => {
        if (err) {
          console.error('NATS connection closed with error:', err);
        } else {
          console.log('NATS connection closed gracefully');
        }
        this._client = undefined;
        this._jetstream = undefined;
        this._jsm = undefined;
      });
    } catch (error) {
      console.error('Failed to connect to NATS:', error);
      throw error;
    }
  }

  /**
   * Close the NATS connection
   */
  public async close(): Promise<void> {
    if (this._client) {
      await this?._client.drain();
      this._client = undefined;
      this._jetstream = undefined;
      this._jsm = undefined;
    }
  }

  /**
   * Check if connected to NATS
   */
  public isConnected(): boolean {
    return !!this._client;
  }

  /**
   * Get the NATS client
   * @throws Error if not connected
   */
  public get client(): NatsConnection {
    if (!this._client) {
      throw new Error('Not connected to NATS');
    }
    return this._client;
  }

  /**
   * Get the JetStream client
   * @throws Error if not connected
   */
  public get jetstream(): JetStreamClient {
    if (!this._jetstream) {
      throw new Error('JetStream not available');
    }
    return this._jetstream;
  }

  /**
   * Get the JetStream manager
   * @throws Error if not connected
   */
  public get jsm(): JetStreamManager {
    if (!this._jsm) {
      throw new Error('JetStream manager not available');
    }
    return this._jsm;
  }

  /**
   * Get the JSON codec for encoding/decoding messages
   */
  public get jsonCodec() {
    return this._jsonCodec;
  }
} 