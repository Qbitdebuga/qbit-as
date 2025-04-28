import { ConfigService } from '@nestjs/config';

/**
 * Get a configuration value with a fallback
 * @param configService The NestJS ConfigService
 * @param key The configuration key
 * @param defaultValue Optional default value if the configuration is not found
 * @returns The configuration value or default
 */
export function getConfig<T>(configService: ConfigService, key: string, defaultValue: T): T {
  const value = configService.get<T>(key);
  return value === undefined ? defaultValue : value;
}

/**
 * Get a required configuration value
 * @param configService The NestJS ConfigService
 * @param key The configuration key
 * @throws Error if the configuration is not found
 * @returns The configuration value
 */
export function getRequiredConfig<T>(configService: ConfigService, key: string): T {
  const value = configService.get<T>(key);
  if (value === undefined) {
    throw new Error(`Required configuration "${key}" is missing`);
  }
  return value;
}
