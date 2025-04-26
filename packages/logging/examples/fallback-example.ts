/**
 * Example demonstrating the graceful fallback capabilities of the logging package
 * This shows how the logger handles missing dependencies and errors
 */

import { PinoLoggerService } from '@qbit/logging';

// 1. Basic console-only configuration
const consoleLogger = new PinoLoggerService({
  level: 'debug',
  consoleEnabled: true,
  fileEnabled: false,
});
consoleLogger.setContext('ConsoleExample');
consoleLogger.log('This is a console-only log');

// 2. File logging with graceful fallback
// This will use pino-roll if available, otherwise fall back to basic file
const fileLogger = new PinoLoggerService({
  level: 'info',
  logDir: './logs',
  fileName: 'fallback-example',
  consoleEnabled: true,
  fileEnabled: true,
  frequency: 'hourly',
  size: '10m',
});
fileLogger.setContext('FileExample');
fileLogger.log('This log will go to both console and file');
fileLogger.error('This is an error message', new Error('Something went wrong').stack, {
  additionalMetadata: 'Some extra data',
  userId: '12345',
});

// 3. Example with structured logging
const structuredLogger = new PinoLoggerService();
structuredLogger.setContext('StructuredExample');

// Log structured data
structuredLogger.log({
  message: 'User signed in',
  userId: 'abcd-1234',
  ipAddress: '192.168.1.1',
  browser: 'Chrome',
  timestamp: new Date().toISOString(),
});

// 4. Demonstrate error catching during log operation
try {
  const testObject = { circular: {} };
  // Create a circular reference that would normally cause issues
  (testObject.circular as any).self = testObject;
  
  // The logger will handle this gracefully thanks to try/catch in logWithLevel
  structuredLogger.log('This potentially problematic object will be handled safely', {
    problematicObject: testObject
  });
} catch (err) {
  console.error('This should not happen due to internal error handling', err);
}

// Demonstrate logging at different levels
const levelLogger = new PinoLoggerService({ level: 'debug' });
levelLogger.setContext('LevelExample');

levelLogger.error('Critical system error, immediate attention required');
levelLogger.warn('Warning condition, potential issue detected');
levelLogger.log('Normal operation information');
levelLogger.debug('Detailed debug information for troubleshooting');
levelLogger.verbose('Even more detailed execution flow information');

console.log('End of example script'); 