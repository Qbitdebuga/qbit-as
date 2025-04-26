/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test|integration.test|e2e.test).ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'services/**/src/**/*.ts',
    'packages/**/src/**/*.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/*.d.ts',
    '!**/test/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  moduleNameMapper: {
    '^@qbit/(.*)$': '<rootDir>/packages/$1/src',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  maxWorkers: '50%',
  testTimeout: 30000,
}; 