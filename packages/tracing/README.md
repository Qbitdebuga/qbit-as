# @qbit/tracing

OpenTelemetry integration for Qbit Accounting System. This package provides distributed tracing capabilities to track requests across multiple microservices.

## Features

- 🔍 Automatic HTTP request tracing with middleware
- 📊 Database operation tracing
- 🌐 Service-to-service communication tracing
- 📨 Message queue operation tracing
- 🧩 Simple API for creating custom spans
- 🧪 Jaeger integration for trace visualization

## Installation

```bash
# Install the package
yarn add @qbit/tracing

# Install peer dependencies if not already installed
yarn add express
```

## Setup

### 1. Add Jaeger to your Docker Compose

```yaml
# Jaeger - Distributed tracing system
jaeger:
  image: jaegertracing/all-in-one:1.46
  container_name: qbit_jaeger
  environment:
    - COLLECTOR_ZIPKIN_HOST_PORT=:9411
    - COLLECTOR_OTLP_ENABLED=true
  ports:
    - "5775:5775/udp"   # Agent accept compact thrift protocol
    - "6831:6831/udp"   # Agent accept compact thrift protocol
    - "6832:6832/udp"   # Agent accept binary thrift protocol
    - "5778:5778"       # Agent serve configs
    - "16686:16686"     # Query UI
    - "14268:14268"     # Collector HTTP accept spans
    - "14250:14250"     # Collector gRPC accept spans
    - "9411:9411"       # Collector Zipkin compatible endpoint
    - "4317:4317"       # OTLP gRPC
    - "4318:4318"       # OTLP HTTP
  networks:
    - qbit_network
```

### 2. Initialize tracing in your NestJS applications

Add the following to your `main.ts` file:

```typescript
import { initTracer } from '@qbit/tracing';

async function bootstrap() {
  // Initialize the tracer before creating the app
  initTracer({
    serviceName: process.env.SERVICE_NAME || 'your-service-name',
    jaegerEndpoint: process.env.JAEGER_ENDPOINT || 'http://jaeger:14268/api/traces',
    environment: process.env.NODE_ENV || 'development',
  });
  
  // ... rest of your bootstrap function
}
```

### 3. Add TracingModule to your AppModule

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TracingModule } from '@qbit/tracing';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TracingModule.forRootAsync(),
    // ... other modules
  ],
})
export class AppModule {}
```

### 4. Add the TracingMiddleware to capture HTTP requests

```typescript
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TracingMiddleware } from '@qbit/tracing';

@Module({
  // ... your module configuration
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TracingMiddleware).forRoutes('*');
  }
}
```

## Usage

### Basic Usage with TracingService

Inject the `TracingService` in your services:

```typescript
import { Injectable } from '@nestjs/common';
import { TracingService } from '@qbit/tracing';

@Injectable()
export class UserService {
  constructor(private readonly tracingService: TracingService) {}
  
  async getUser(id: string) {
    return this.tracingService.traceFunction(
      'getUser',
      async (span) => {
        span.setAttribute('user.id', id);
        
        // Your business logic here
        const user = await this.findUserById(id);
        
        if (user) {
          span.setAttribute('user.found', true);
        } else {
          span.setAttribute('user.found', false);
        }
        
        return user;
      }
    );
  }
}
```

### Tracing Database Operations

```typescript
async findUserById(id: string) {
  return this.tracingService.traceDb(
    'findFirst',
    'SELECT * FROM users WHERE id = $1',
    async (span) => {
      // Your database operation
      return this.prisma.user.findFirst({
        where: { id },
      });
    }
  );
}
```

### Tracing HTTP Requests

```typescript
async callExternalService(id: string) {
  return this.tracingService.traceHttp(
    'GET',
    `https://api.example.com/resource/${id}`,
    async (span) => {
      // Your HTTP request
      return this.httpService.get(`/resource/${id}`);
    }
  );
}
```

### Tracing Message Operations

```typescript
async publishEvent(data: any) {
  return this.tracingService.traceMessage(
    'publish',
    'my-topic',
    async (span) => {
      // Your message publishing code
      await this.natsClient.publish('my-topic', data);
    }
  );
}
```

## Viewing Traces

Once set up, you can view traces in the Jaeger UI at http://localhost:16686.

## Environment Variables

The following environment variables can be used to configure tracing:

- `SERVICE_NAME`: The name of your service (default: 'unknown-service')
- `JAEGER_ENDPOINT`: The endpoint for your Jaeger instance (default: 'http://jaeger:14268/api/traces')
- `USE_JAEGER`: Whether to send traces to Jaeger (default: true)
- `OTLP_ENDPOINT`: The endpoint for OTLP (default: 'http://collector:4318/v1/traces')
- `USE_OTLP`: Whether to send traces via OTLP (default: false)
- `NODE_ENV`: The environment (default: 'development') 