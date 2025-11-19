# Testing Guide for LMS Enrollment System Migration

## Overview

This document provides comprehensive guidance for testing the migration from the existing multi-enrollment system to the unified `SubjectEnrollment` model (Option 2 - Hybrid Approach).

## Test Categories

### 1. Unit Tests (`/tests/services/unifiedEnrollment.test.ts`)

**Purpose**: Test individual service methods in isolation

**What's Tested**:
- ✅ `enrollStudentInSubject()` validation and success scenarios
- ✅ `bulkEnrollStudentsInSubject()` batch operations
- ✅ `getStudentEnrollments()` with filters
- ✅ `updateEnrollment()` grade and completion logic
- ✅ `getEnrollmentStatistics()` calculation accuracy
- ✅ `deactivateEnrollment()` soft deletion

**Key Features**:
- Uses Vitest with comprehensive mocking
- Tests all validation scenarios (Zod schema)
- Covers error handling and edge cases
- Validates auto-calculation features (percentage, completion)

**Run Command**:
```bash
npm test unifiedEnrollment.test.ts
```

### 2. Integration Tests (`/tests/integration/unifiedEnrollment.integration.test.ts`)

**Purpose**: Test complete API workflows with real database interactions

**What's Tested**:
- ✅ Full HTTP API endpoints with authentication
- ✅ Database operations with real Prisma client
- ✅ Cross-model relationships and constraints
- ✅ Request/response validation
- ✅ Error handling and status codes

**Test Data Setup**:
- Creates real test users, batches, classes, subjects
- Establishes all required relationships
- Tests with actual enrollment data
- Cleans up after each test

**Run Command**:
```bash
npm test integration/unifiedEnrollment.integration.test.ts
```

### 3. Migration Validation Tests (`/tests/migration/migration.validation.test.ts`)

**Purpose**: Validate the migration process from legacy to unified system

**What's Tested**:
- ✅ Pre-migration data validation
- ✅ Migration script execution simulation
- ✅ Post-migration data integrity
- ✅ Relationship preservation from photo diagram
- ✅ Performance and indexing validation
- ✅ Audit trail maintenance
- ✅ Rollback scenario testing

**Key Validations**:
- Legacy `StudentClass` → `SubjectEnrollment` migration
- Advanced `ModuleEnrollment` system preservation  
- Photo diagram relationships: Student→Subject, Student→Batch, Class→Batch
- Query performance with proper indexing
- Backward compatibility maintenance

**Run Command**:
```bash
npm test migration/migration.validation.test.ts
```

## Test Environment Setup

### Prerequisites

1. **Test Database Setup**:
```bash
# Create test database
createdb lms_test

# Set environment variable
export DATABASE_URL="postgresql://username:password@localhost:5432/lms_test"

# Run migrations
npx prisma migrate deploy
```

2. **Install Test Dependencies**:
```bash
npm install --save-dev vitest @vitest/ui supertest @types/supertest
```

3. **Configure Vitest** (`vitest.config.ts`):
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000,
  },
});
```

## Running Tests

### Complete Test Suite
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

### Specific Test Categories
```bash
# Unit tests only
npm test -- tests/services/

# Integration tests only  
npm test -- tests/integration/

# Migration tests only
npm test -- tests/migration/
```

### Watch Mode (Development)
```bash
# Watch mode for active development
npm test -- --watch

# Watch specific files
npm test -- --watch tests/services/unifiedEnrollment.test.ts
```

## Test Data Management

### Test Data Factory Pattern

Create shared test data utilities:

```typescript
// tests/utils/testDataFactory.ts
export class TestDataFactory {
  static async createTestBatch(prisma: PrismaClient, adminId: string) {
    return prisma.batch.create({
      data: {
        name: 'Test Batch ' + Date.now(),
        startYear: 2023,
        endYear: 2025,
        status: 'ACTIVE',
        createdBy: adminId,
      },
    });
  }

  static async createCompleteTestSetup(prisma: PrismaClient) {
    // Returns admin, teacher, students, batch, class, subject
    // with all relationships properly configured
  }
}
```

### Database Cleanup Strategy

```typescript
// tests/utils/cleanup.ts
export async function cleanupTestData(prisma: PrismaClient, testIds: any) {
  // Order matters due to foreign key constraints
  await prisma.subjectEnrollment.deleteMany({ where: { studentId: { in: testIds.studentIds } } });
  await prisma.moduleEnrollment.deleteMany({ where: { studentId: { in: testIds.studentIds } } });
  await prisma.studentClass.deleteMany({ where: { studentId: { in: testIds.studentIds } } });
  await prisma.teacherClass.deleteMany({ where: { teacherId: testIds.teacherId } });
  await prisma.classBatch.deleteMany({ where: { batchId: testIds.batchId } });
  await prisma.user.deleteMany({ where: { id: { in: testIds.userIds } } });
  await prisma.subject.deleteMany({ where: { id: { in: testIds.subjectIds } } });
  await prisma.class.deleteMany({ where: { id: { in: testIds.classIds } } });
  await prisma.batch.deleteMany({ where: { id: { in: testIds.batchIds } } });
}
```

## Migration Testing Strategy

### Phase 1: Pre-Migration Validation
```bash
# Verify current system state
npm test -- --grep "Pre-Migration Data Validation"

# Check data integrity before migration
npm test -- --grep "should have legacy enrollment data"
```

### Phase 2: Migration Execution Testing
```bash
# Test migration script
npm test -- --grep "Migration Execution"

# Validate data transformation
npm test -- --grep "should preserve all enrollment relationships"
```

### Phase 3: Post-Migration Validation
```bash
# Verify unified system works
npm test -- --grep "Post-Migration Data Validation" 

# Test new feature integration
npm test -- --grep "System Integration After Migration"
```

## Performance Testing

### Load Testing Setup
```typescript
describe('Performance Tests', () => {
  it('should handle bulk enrollment of 1000 students', async () => {
    const students = await createManyStudents(1000);
    const startTime = Date.now();
    
    await service.bulkEnrollStudentsInSubject({
      studentIds: students.map(s => s.id),
      subjectId: testSubject.id,
      classId: testClass.id, 
      batchId: testBatch.id,
      enrolledBy: testAdmin.id,
    });
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // 5 seconds max
  });
});
```

### Memory Testing
```bash
# Monitor memory usage during tests
NODE_OPTIONS="--max-old-space-size=4096" npm test -- --reporter=verbose
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: LMS Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: lms_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/lms_test
```

## Debugging Test Failures

### Common Issues and Solutions

1. **Foreign Key Constraint Errors**:
   ```typescript
   // Ensure proper cleanup order
   await cleanupTestData(prisma, testIds);
   ```

2. **Timeout Issues**:
   ```typescript
   // Increase timeout for database operations
   it('should handle complex migration', async () => {
     // Test code
   }, { timeout: 60000 });
   ```

3. **Mock Setup Issues**:
   ```typescript
   // Reset mocks between tests
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

### Debugging Commands
```bash
# Run single test with debug output
npm test -- --grep "specific test name" --reporter=verbose

# Run with database query logging
DEBUG=prisma:query npm test

# Run with detailed error traces
npm test -- --stack-trace-limit=100
```

## Test Coverage Goals

- **Unit Tests**: 95%+ coverage for service methods
- **Integration Tests**: 90%+ coverage for API endpoints  
- **Migration Tests**: 100% coverage for migration scenarios
- **Edge Cases**: All error conditions and validation rules

### Coverage Commands
```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
npm run test:coverage:html
open coverage/index.html
```

## Best Practices

### 1. Test Organization
- Group related tests with `describe` blocks
- Use descriptive test names that explain the scenario
- Keep tests focused on single responsibilities

### 2. Data Management
- Create minimal test data for each test
- Use factories for consistent test data creation
- Always clean up test data after tests

### 3. Mocking Strategy
- Mock external dependencies (file system, external APIs)
- Use real database for integration tests
- Mock time-dependent functions for consistent results

### 4. Assertion Quality
- Use specific assertions over generic ones
- Test both success and failure scenarios
- Validate all important properties of results

## Migration Checklist

Before running migration in production:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Migration validation tests pass
- [ ] Performance tests meet requirements
- [ ] Backup procedures are tested
- [ ] Rollback procedures are validated
- [ ] Monitoring and alerting are configured
- [ ] Documentation is updated

---

**Remember**: The goal is to ensure the unified enrollment system maintains all existing functionality while simplifying the relationship model as shown in your photo diagram.

For questions or issues with testing, refer to the implementation files or create detailed test failure reports with:
1. Test name and file
2. Expected vs actual results
3. Test data used
4. Error messages and stack traces