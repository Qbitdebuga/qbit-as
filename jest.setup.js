// Set up environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-jwt-secret';

// Increase timeout for all tests
jest.setTimeout(30000);

// Global beforeAll/afterAll
beforeAll(async () => {
  // You might want to set up global test services here
  // e.g., start a database, set up test data, etc.
});

afterAll(async () => {
  // Clean up after all tests
  // e.g., close database connections, remove test data, etc.
});

// Global error handler to catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection during tests:', reason);
});

// Global console override to make it easier to debug tests
// This captures console.* output in the test results
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

// Uncomment the following lines to suppress logs during tests
// console.error = jest.fn();
// console.warn = jest.fn();
// console.log = jest.fn();

// Restore original console functions after tests
afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
}); 