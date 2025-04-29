import Joi from 'joi';

export const authConfigSchema = Joi.object({
  // Service Authentication
  SERVICE_ID: Joi.string().required(),
  SERVICE_NAME: Joi.string().required(),
  SERVICE_JWT_SECRET: Joi.string().required(),
  SERVICE_TOKEN_EXPIRATION: Joi.string().default('1h'),
}); 