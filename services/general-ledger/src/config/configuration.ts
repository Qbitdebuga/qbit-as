import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  url: process?.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/qbit_general_ledger?schema=public',
}));

export const appConfig = registerAs('app', () => ({
  port: parseInt(process?.env.PORT || '3003', 10),
  environment: process?.env.NODE_ENV || 'development',
  logLevel: process?.env.LOG_LEVEL || 'info',
  logstashHost: process?.env.LOGSTASH_HOST || 'logstash',
  logstashPort: parseInt(process?.env.LOGSTASH_PORT || '5000', 10),
}));

export const authConfig = registerAs('auth', () => ({
  serviceAuthUrl: process?.env.SERVICE_AUTH_URL || 'http://localhost:3002/api/auth/service',
  serviceId: process?.env.SERVICE_ID || 'gl-service',
  serviceSecret: process?.env.SERVICE_SECRET || 'development-gl-service-secret',
}));

export const rabbitMQConfig = registerAs('rabbitmq', () => ({
  url: process?.env.RABBITMQ_URL || 'amqp://qbit:qbit_password@localhost:5672',
  queue: process?.env.RABBITMQ_QUEUE || 'general_ledger_queue',
  exchange: process?.env.RABBITMQ_EXCHANGE || 'qbit_events',
})); 