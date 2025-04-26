/**
 * Simple test script to verify the logging package functionality
 * Run with: npx ts-node test.ts
 */

import { PinoLoggerService } from './src';

// Create a new logger instance
const logger = new PinoLoggerService({
  level: 'debug',
  logDir: './test-logs',
  fileName: 'test-output',
  consoleEnabled: true, 
  fileEnabled: true,
});

// Set a context for the logger
logger.setContext('TestScript');

console.log('Starting logging tests...');

// Log at different levels
logger.log('This is a standard info message');
logger.debug('This is a debug message with details', { 
  testRun: true, 
  timestamp: new Date().toISOString() 
});
logger.warn('This is a warning message');
logger.error('This is an error message', new Error('Test error').stack, {
  errorCode: 'TEST_ERROR_1',
  severity: 'medium'
});

// Log a structured object
logger.log({
  event: 'test_completed',
  success: true,
  duration: 123,
  timestamp: new Date().toISOString()
});

console.log('Logging tests completed. Check the test-logs directory if file logging is working.'); 