import { Injectable } from '@nestjs/common';
import { SpanKind } from '../index';
import { getTracer, withSpan } from '../tracer';

@Injectable()
export class TracingService {
  /**
   * Trace a function call with a custom span
   * @param name Span name
   * @param fn Function to execute within the span
   * @param kind Span kind (default: INTERNAL)
   * @param attributes Additional span attributes
   */
  async traceFunction<T>(
    name: string,
    fn: (span: any) => Promise<T> | T,
    kind: SpanKind = SpanKind.INTERNAL,
    attributes: Record<string, any> = {}
  ): Promise<T> {
    return withSpan(name, fn, kind, attributes);
  }

  /**
   * Trace a database operation
   * @param operation Operation name
   * @param query Query or operation details
   * @param fn Function to execute within the span
   */
  async traceDb<T>(
    operation: string,
    query: string,
    fn: (span: any) => Promise<T> | T
  ): Promise<T> {
    return this.traceFunction(
      `DB ${operation}`,
      fn,
      SpanKind.CLIENT,
      {
        'db.type': 'sql',
        'db.statement': query,
        'db.operation': operation,
      }
    );
  }

  /**
   * Trace an HTTP request to another service
   * @param method HTTP method
   * @param url Target URL
   * @param fn Function to execute within the span
   */
  async traceHttp<T>(
    method: string,
    url: string,
    fn: (span: any) => Promise<T> | T
  ): Promise<T> {
    return this.traceFunction(
      `HTTP ${method} ${new URL(url).pathname}`,
      fn,
      SpanKind.CLIENT,
      {
        'http.method': method,
        'http.url': url,
      }
    );
  }

  /**
   * Trace a message operation (publish/subscribe)
   * @param operation Operation type (publish/subscribe)
   * @param topic Topic or queue name
   * @param fn Function to execute within the span
   */
  async traceMessage<T>(
    operation: 'publish' | 'subscribe',
    topic: string,
    fn: (span: any) => Promise<T> | T
  ): Promise<T> {
    return this.traceFunction(
      `Message ${operation} ${topic}`,
      fn,
      operation === 'publish' ? SpanKind.PRODUCER : SpanKind.CONSUMER,
      {
        'messaging.system': 'nats',
        'messaging.destination': topic,
        'messaging.operation': operation,
      }
    );
  }

  /**
   * Get the current tracer instance
   * @returns The tracer instance
   */
  getTracer(): any {
    return getTracer();
  }
} 