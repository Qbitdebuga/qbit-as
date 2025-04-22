import * as Joi from 'joi';

// Configuration schema validation
export const configSchemaValidation = Joi.object({
  // Database configuration
  DATABASE_URL: Joi.string().required(),
  // App configuration
  PORT: Joi.number().default(3004),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  // Auth configuration
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('1d'),
  SERVICE_JWT_SECRET: Joi.string().required(),
  // RabbitMQ configuration
  RABBITMQ_URL: Joi.string().required(),
  RABBITMQ_QUEUE_NAME: Joi.string().default('reporting_queue'),
  RABBITMQ_EXCHANGE: Joi.string().default('reporting_exchange'),
  // Service URLs
  AUTH_SERVICE_URL: Joi.string().required(),
  GENERAL_LEDGER_SERVICE_URL: Joi.string().required(),
  // Service Authentication
  SERVICE_ID: Joi.string().required(),
  SERVICE_SECRET: Joi.string().required(),
  // HTTP Client configuration
  HTTP_TIMEOUT: Joi.number().default(5000),
  HTTP_MAX_REDIRECTS: Joi.number().default(5),
});

// Database configuration
export const databaseConfig = () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
});

// App configuration
export const appConfig = () => ({
  port: parseInt(process.env.PORT || '3004', 10),
  env: process.env.NODE_ENV || 'development',
});

// Auth configuration
export const authConfig = () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION || '1d',
  },
  serviceJwt: {
    secret: process.env.SERVICE_JWT_SECRET,
  },
});

// RabbitMQ configuration
export const rabbitMQConfig = () => ({
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    queueName: process.env.RABBITMQ_QUEUE_NAME || 'reporting_queue',
    exchange: process.env.RABBITMQ_EXCHANGE || 'reporting_exchange',
  },
});

// Service clients configuration
export const clientsConfig = () => ({
  clients: {
    authService: {
      url: process.env.AUTH_SERVICE_URL,
      serviceId: process.env.SERVICE_ID,
      serviceSecret: process.env.SERVICE_SECRET,
    },
    generalLedgerService: {
      url: process.env.GENERAL_LEDGER_SERVICE_URL,
    },
    httpClient: {
      timeout: parseInt(process.env.HTTP_TIMEOUT || '5000', 10),
      maxRedirects: parseInt(process.env.HTTP_MAX_REDIRECTS || '5', 10),
    },
  },
}); 