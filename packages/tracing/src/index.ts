// Export everything from the tracer
export * from './tracer';

// Export NestJS integrations
export * from './nestjs/tracing.module';
export * from './nestjs/tracing.service';
export * from './middleware/nestjs-tracing.middleware';

// Define necessary types from OpenTelemetry for convenience
export interface Span {
  setAttribute(key: string, value: string | number | boolean): this;
  addEvent(name: string, attributes?: Record<string, any>): this;
  setStatus(status: { code: SpanStatusCode; message?: string }): this;
  end(endTime?: number): void;
  isRecording(): boolean;
  recordException(exception: any): void;
}

export enum SpanStatusCode {
  UNSET = 0,
  OK = 1,
  ERROR = 2
}

export enum SpanKind {
  INTERNAL = 0,
  SERVER = 1,
  CLIENT = 2,
  PRODUCER = 3,
  CONSUMER = 4
}

export interface SpanOptions {
  attributes?: Record<string, any>;
  kind?: SpanKind;
  startTime?: number;
  links?: any[];
}

export interface SpanContext {
  traceId: string;
  spanId: string;
  traceFlags: number;
  isRemote?: boolean;
}

export interface TracerProvider {
  getTracer(name: string, version?: string): any;
} 