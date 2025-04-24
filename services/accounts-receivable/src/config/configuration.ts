export default () => ({
  app: {
    port: parseInt(process.env.PORT || '3004', 10),
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    },
    serviceToken: {
      secret: process.env.SERVICE_JWT_SECRET,
      expiresIn: process.env.SERVICE_JWT_EXPIRES_IN || '1h',
    },
  },
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    generalLedger: process.env.GENERAL_LEDGER_SERVICE_URL || 'http://localhost:3003',
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'qbit',
    queue: process.env.RABBITMQ_QUEUE || 'accounts-receivable',
  },
}); 