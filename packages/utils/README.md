# Qbit Utils

A collection of shared utility functions for the Qbit Accounting System.

## Installation

```bash
yarn add @qbit/utils
```

## Usage

```typescript
import { formatDate, formatCurrency, isValidEmail, generateUUID } from '@qbit/utils';
```

## Features

### Date Formatting

```typescript
// Format a date: "2023-04-15"
formatDate(new Date(2023, 3, 15));

// Format with time: "2023-04-15 14:30:00"
formatDate(new Date(2023, 3, 15, 14, 30), { includeTime: true });

// Format a relative time: "2 days ago"
formatRelativeTime(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));

// Format fiscal year: "FY 2023"
formatFiscalYear(new Date(2023, 0, 1));
```

### Currency Formatting

```typescript
// Format as USD: "$1,234.56"
formatCurrency(1234.56);

// Format as EUR: "€1,234.56"
formatCurrency(1234.56, { currency: 'EUR' });

// Accounting notation: "(€1,234.56)"
formatCurrency(-1234.56, { currency: 'EUR', accounting: true });

// Calculate compound interest
calculateCompoundInterest(1000, 0.05, 5); // $1,276.28
```

### Validation

```typescript
// Validate email
isValidEmail('user@example.com'); // true

// Validate password strength
validatePassword('StrongP@ss123'); // { isValid: true }

// Validate URL
isValidUrl('https://example.com'); // true

// Validate phone number
isValidPhoneNumber('+1-555-123-4567'); // true

// Validate date
isValidDate('2023-04-15'); // true

// Validate number
isValidNumber('123.45', { min: 0 }); // true
```

### Cryptography

```typescript
// Generate a simple hash
simpleHash('hello world'); // "5eb63bbbe01eeed093cb22bb8f5acdc3"

// Generate a random string
generateRandomString(10); // "a1b2c3d4e5"

// Generate a UUID
generateUUID(); // "f47ac10b-58cc-4372-a567-0e02b2c3d479"

// Compare strings in constant time (for security)
compareStringsConstantTime('secret', 'secret'); // true

// Mask sensitive data
maskString('4111111111111111', { showFirst: 4, showLast: 4 }); // "4111********1111"
```

## API Reference

### Date Formatters

- `formatDate(date, options)` - Format a date string
- `formatTime(date, options)` - Format a time string
- `formatRelativeTime(date, relativeTo)` - Format a relative time string
- `formatFiscalYear(date, fiscalYearStart)` - Format a date as a fiscal year

### Currency Formatters

- `formatCurrency(amount, options)` - Format a number as currency
- `formatPercentage(value, options)` - Format a number as a percentage
- `calculateCompoundInterest(principal, rate, time, frequency)` - Calculate compound interest
- `calculateSimpleInterest(principal, rate, time)` - Calculate simple interest

### Validators

- `isValidEmail(email)` - Validate an email address
- `validatePassword(password, options)` - Validate a password strength
- `isValidUrl(url, options)` - Validate a URL
- `isValidPhoneNumber(phoneNumber, options)` - Validate a phone number
- `isValidDate(dateString, format)` - Validate a date string
- `isValidNumber(value, options)` - Validate if value is a valid number

### Crypto Utilities

- `simpleHash(str)` - Convert a string to a hash using a simple algorithm
- `generateRandomString(length, options)` - Generate a random string
- `generateUUID()` - Generate a UUID v4 (random)
- `compareStringsConstantTime(a, b)` - Compare two strings in constant time
- `maskString(input, options)` - Mask a sensitive string 