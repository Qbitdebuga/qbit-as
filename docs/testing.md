# Testing Strategy for Qbit Accounting System

This document outlines the testing approach for the Qbit Accounting System, covering all levels of testing from unit to end-to-end.

## Testing Philosophy

Our testing approach follows these principles:

1. **Test Pyramid**: We follow the testing pyramid with more unit tests than integration tests, and more integration tests than end-to-end tests.
2. **Shift Left**: We catch issues as early as possible in the development process.
3. **Automated First**: We prioritize automated testing over manual testing.
4. **Test Coverage**: We aim for high test coverage, especially for business-critical components.
5. **Real-World Scenarios**: Tests should reflect real-world usage patterns.

## Test Levels

### Unit Testing

Unit tests verify individual components in isolation.

#### Framework and Tools
- **Backend**: Jest with ts-jest
- **Frontend**: Jest with React Testing Library

#### Coverage Targets
- **Critical paths**: 90%+
- **Overall code**: 80%+

#### Best Practices
- Mock external dependencies
- Test one behavior per test
- Follow AAA pattern (Arrange-Act-Assert)
- Focus on behavior, not implementation details

#### Example Unit Test (Backend)
```typescript
// Example unit test for transaction service
describe('TransactionService', () => {
  let service: TransactionService;
  let prismaService: PrismaService;
  let eventsService: EventsService;
  
  beforeEach(() => {
    prismaService = mock<PrismaService>();
    eventsService = mock<EventsService>();
    service = new TransactionService(prismaService, eventsService);
  });
  
  describe('createTransaction', () => {
    it('should create a transaction and emit event', async () => {
      // Arrange
      const transactionData = {...};
      prismaService.transaction.create.mockResolvedValue(transactionData);
      
      // Act
      const result = await service.createTransaction(transactionData);
      
      // Assert
      expect(prismaService.transaction.create).toHaveBeenCalledWith({
        data: transactionData
      });
      expect(eventsService.emit).toHaveBeenCalledWith(
        'transaction.created',
        expect.objectContaining({ id: transactionData.id })
      );
      expect(result).toEqual(transactionData);
    });
  });
});
```

#### Example Unit Test (Frontend)
```typescript
// Example test for JournalEntryForm component
import { render, screen, fireEvent } from '@testing-library/react';
import JournalEntryForm from './JournalEntryForm';

describe('JournalEntryForm', () => {
  it('renders form elements correctly', () => {
    render(<JournalEntryForm />);
    
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/add line item/i)).toBeInTheDocument();
  });
  
  it('validates required fields', async () => {
    render(<JournalEntryForm />);
    
    fireEvent.click(screen.getByText(/submit/i));
    
    expect(await screen.findByText(/date is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/description is required/i)).toBeInTheDocument();
  });
});
```

### Integration Testing

Integration tests verify that individual components work correctly together.

#### Framework and Tools
- **Backend**: Jest with NestJS testing utilities
- **API**: Supertest
- **Database**: Test containers for PostgreSQL

#### Scope
- API routes and controllers
- Service-to-service communication
- Database interactions
- Event processing

#### Best Practices
- Use test databases (preferably in containers)
- Reset database state between tests
- Test happy paths and common error paths
- Mock external services where appropriate

#### Example Integration Test
```typescript
// Example integration test for transactions API
describe('Transactions API (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    
    app = moduleRef.createNestApplication();
    prisma = moduleRef.get<PrismaService>(PrismaService);
    await app.init();
  });
  
  beforeEach(async () => {
    // Clean database between tests
    await prisma.transaction.deleteMany();
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  describe('POST /transactions', () => {
    it('creates a transaction successfully', async () => {
      const transactionData = {
        date: '2023-01-01',
        amount: 100.50,
        description: 'Test transaction',
        accountId: 'account-1'
      };
      
      const response = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${testToken}`)
        .send(transactionData)
        .expect(201);
        
      expect(response.body).toMatchObject({
        id: expect.any(String),
        ...transactionData
      });
      
      // Verify it's in the database
      const dbTransaction = await prisma.transaction.findUnique({
        where: { id: response.body.id }
      });
      expect(dbTransaction).toMatchObject(transactionData);
    });
  });
});
```

### End-to-End Testing

E2E tests verify the entire system works correctly from the user's perspective.

#### Framework and Tools
- Playwright for browser-based testing
- Postman/Newman for API collection testing

#### Scope
- Critical user journeys
- Cross-service workflows
- UI functionality

#### Best Practices
- Focus on high-value user flows
- Use realistic test data
- Run against a staging-like environment
- Consider running core E2E tests in CI/CD pipeline

#### Example E2E Test
```typescript
// Example E2E test for creating a journal entry
test('user can create a journal entry', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  // Navigate to journal entries
  await page.click('text=Journal Entries');
  await page.click('text=Create New Entry');
  
  // Fill the form
  await page.fill('[data-testid="date-input"]', '2023-01-15');
  await page.fill('[data-testid="description-input"]', 'Office supplies purchase');
  
  // Add debit line
  await page.click('[data-testid="add-line-button"]');
  await page.selectOption('[data-testid="line-0-account"]', 'Office Supplies');
  await page.fill('[data-testid="line-0-debit"]', '150.00');
  
  // Add credit line
  await page.click('[data-testid="add-line-button"]');
  await page.selectOption('[data-testid="line-1-account"]', 'Cash');
  await page.fill('[data-testid="line-1-credit"]', '150.00');
  
  // Submit form
  await page.click('[data-testid="submit-button"]');
  
  // Verify success
  await expect(page.locator('text=Journal entry created successfully')).toBeVisible();
  
  // Verify entry appears in the list
  await page.click('text=Back to List');
  await expect(page.locator('text=Office supplies purchase')).toBeVisible();
});
```

### Contract Testing

Contract tests verify that service interfaces adhere to their API contracts.

#### Framework and Tools
- Pact for contract testing
- API Blueprint/Swagger for documentation

#### Best Practices
- Define consumer expectations clearly
- Verify provider implementation meets consumer expectations
- Include contract tests in CI/CD pipeline

### Performance Testing

Performance tests verify the system meets performance requirements.

#### Framework and Tools
- k6 for load testing
- Lighthouse for frontend performance

#### Key Metrics
- Response time (p95, p99)
- Throughput (requests per second)
- Error rate
- Resource utilization

#### Test Types
- Load testing (expected load)
- Stress testing (beyond expected load)
- Endurance testing (sustained load)
- Spike testing (sudden increase in load)

#### Example k6 Script
```javascript
// Example k6 load test for accounts endpoint
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users
    { duration: '30s', target: 0 },  // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p95<500'], // 95% of requests must complete below 500ms
    'http_req_failed': ['rate<0.01'],  // Error rate must be less than 1%
  },
};

export default function() {
  const BASE_URL = 'https://staging-api.qbit.example.com';
  const TOKEN = `Bearer ${__ENV.API_TOKEN}`;
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': TOKEN,
    },
  };
  
  // Get accounts
  const accountsRes = http.get(`${BASE_URL}/api/accounts`, params);
  check(accountsRes, {
    'accounts status was 200': (r) => r.status === 200,
    'accounts returned array': (r) => Array.isArray(r.json()),
  });
  
  sleep(1);
}
```

## Testing in CI/CD Pipeline

Our CI/CD pipeline includes the following testing stages:

1. **Lint & Type Check**: ESLint and TypeScript
2. **Unit Tests**: Run for all packages and services
3. **Integration Tests**: Run for all services
4. **E2E Tests**: Run core user flows
5. **Contract Tests**: Verify API contracts
6. **Performance Tests**: Run against staging environment (scheduled)

## Test Environments

- **CI**: Ephemeral environment created for each pull request
- **Development**: Shared environment for developer testing
- **Staging**: Production-like environment for final verification
- **Production**: Live environment (limited testing)

## Test Data Management

- **Unit Tests**: Mock data or in-memory data
- **Integration Tests**: Test containers with seed data
- **E2E Tests**: Prepared test accounts with known state
- **Production**: Anonymized data for performance testing

## Accessibility Testing

We integrate accessibility testing into our frontend development process:

- Automated checks using axe-core
- Manual keyboard navigation testing
- Screen reader compatibility testing
- Color contrast verification

## Security Testing

Our security testing approach includes:

- Dependency vulnerability scanning
- OWASP Top 10 checks
- Authentication and authorization testing
- Data validation testing
- Input sanitization testing

## Documentation and Reporting

- Test results are reported in CI/CD pipeline
- Test coverage reports are generated and tracked
- Documentation for test setup and execution is maintained

## Responsibilities

- **Developers**: Unit tests, integration tests, contract tests
- **QA Engineers**: E2E tests, exploratory testing
- **DevOps**: Performance testing, CI/CD integration
- **Everyone**: Quality ownership 