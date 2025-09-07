# Error Handling Migration Guide

## Overview

myzod and Zod v3 have fundamentally different error handling approaches. This document provides specific methods for replacing myzod's `ValidationError` and `try` method with Zod v3 equivalents.

## Basic Error Handling Patterns

### 1. Basic Validation and Error Handling

#### myzod
```typescript
import myzod from 'myzod';

const schema = myzod.string().min(3);

// Error handling using try()
const result = schema.try('ab');
if (result instanceof myzod.ValidationError) {
  console.log('Error:', result.message);
  console.log('Path:', result.path);
} else {
  console.log('Success:', result);
}
```

#### Zod v3 Replacement
```typescript
import { z } from 'zod';

const schema = z.string().min(3);

// Error handling using safeParse()
const result = schema.safeParse('ab');
if (!result.success) {
  console.log('Error:', result.error.message);
  console.log('Path:', result.error.issues[0]?.path);
} else {
  console.log('Success:', result.data);
}
```

### 2. Exception Throwing Cases

#### myzod
```typescript
try {
  const value = schema.parse('ab');
  console.log('Success:', value);
} catch (error) {
  if (error instanceof myzod.ValidationError) {
    console.log('Error:', error.message);
  }
}
```

#### Zod v3 Replacement
```typescript
try {
  const value = schema.parse('ab');
  console.log('Success:', value);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log('Error:', error.message);
  }
}
```

## Complex Object Validation

### Object Schema Error Handling

#### myzod
```typescript
const userSchema = myzod.object({
  name: myzod.string().min(1),
  email: myzod.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: myzod.number().min(0).max(150)
}).collectErrors();

const invalidUser = {
  name: '',
  email: 'invalid-email',
  age: -5
};

const result = userSchema.try(invalidUser);
if (result instanceof myzod.ValidationError) {
  console.log('Validation errors:');
  
  // Process collected errors
  if (result.collectedErrors) {
    Object.entries(result.collectedErrors).forEach(([field, error]) => {
      console.log(`- ${field}: ${error.message}`);
    });
  }
}
```

#### Zod v3 Replacement
```typescript
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: z.number().min(0).max(150)
});

const invalidUser = {
  name: '',
  email: 'invalid-email',
  age: -5
};

const result = userSchema.safeParse(invalidUser);
if (!result.success) {
  console.log('Validation errors:');
  
  // Process all errors (Zod collects all errors by default)
  result.error.issues.forEach(issue => {
    const field = issue.path.join('.');
    console.log(`- ${field}: ${issue.message}`);
  });
}
```

## Custom Error Message Handling

### Custom Validation Error Handling

#### myzod
```typescript
const passwordSchema = myzod.string()
  .min(8, 'Must be at least 8 characters')
  .withPredicate(
    password => /[A-Z]/.test(password),
    'Must contain uppercase letter'
  )
  .withPredicate(
    password => /[a-z]/.test(password),
    'Must contain lowercase letter'
  )
  .withPredicate(
    password => /\d/.test(password),
    'Must contain number'
  );

const result = passwordSchema.try('weak');
if (result instanceof myzod.ValidationError) {
  console.log('Password error:', result.message);
}
```

#### Zod v3 Replacement
```typescript
const passwordSchema = z.string()
  .min(8, { message: 'Must be at least 8 characters' })
  .refine(
    password => /[A-Z]/.test(password),
    { message: 'Must contain uppercase letter' }
  )
  .refine(
    password => /[a-z]/.test(password),
    { message: 'Must contain lowercase letter' }
  )
  .refine(
    password => /\d/.test(password),
    { message: 'Must contain number' }
  );

const result = passwordSchema.safeParse('weak');
if (!result.success) {
  // Show first error message
  console.log('Password error:', result.error.issues[0]?.message);
  
  // Or show all error messages
  result.error.issues.forEach(issue => {
    console.log('Error:', issue.message);
  });
}
```

## Nested Object Error Handling

### Deeply Nested Data Structures

#### myzod
```typescript
const nestedSchema = myzod.object({
  user: myzod.object({
    profile: myzod.object({
      name: myzod.string().min(1),
      contacts: myzod.array(
        myzod.object({
          type: myzod.string(),
          value: myzod.string().min(1)
        })
      )
    })
  })
});

const invalidData = {
  user: {
    profile: {
      name: '',
      contacts: [
        { type: 'email', value: '' }
      ]
    }
  }
};

const result = nestedSchema.try(invalidData);
if (result instanceof myzod.ValidationError) {
  console.log('Error path:', result.path);
  console.log('Error message:', result.message);
}
```

#### Zod v3 Replacement
```typescript
const nestedSchema = z.object({
  user: z.object({
    profile: z.object({
      name: z.string().min(1),
      contacts: z.array(
        z.object({
          type: z.string(),
          value: z.string().min(1)
        })
      )
    })
  })
});

const invalidData = {
  user: {
    profile: {
      name: '',
      contacts: [
        { type: 'email', value: '' }
      ]
    }
  }
};

const result = nestedSchema.safeParse(invalidData);
if (!result.success) {
  result.error.issues.forEach(issue => {
    console.log('Error path:', issue.path.join('.'));
    console.log('Error message:', issue.message);
  });
}
```

## Practical Utility Functions

### Error Handling Helper Functions

#### myzod-style Helper
```typescript
// Helper to mimic myzod's try() behavior
export function tryParse<T>(schema: z.ZodSchema<T>, data: unknown): T | z.ZodError {
  const result = schema.safeParse(data);
  return result.success ? result.data : result.error;
}

// Usage example
const schema = z.string().min(3);
const result = tryParse(schema, 'ab');

if (result instanceof z.ZodError) {
  console.log('Error:', result.message);
} else {
  console.log('Success:', result);
}
```

#### Converting ZodError to myzod ValidationError Interface

```typescript
// myzod ValidationError compatible interface
interface MyzodCompatibleError extends Error {
  name: string;
  message: string;
  path?: (string | number)[];
  collectedErrors?: Record<string, MyzodCompatibleError>;
}

// Convert ZodError to myzod ValidationError format
export function convertToMyzodError(zodError: z.ZodError): MyzodCompatibleError {
  const firstIssue = zodError.issues[0];
  
  const error: MyzodCompatibleError = {
    name: 'ValidationError',
    message: firstIssue?.message || 'Validation failed',
    path: firstIssue?.path,
  };
  
  // Store multiple errors as collectedErrors if present
  if (zodError.issues.length > 1) {
    error.collectedErrors = {};
    
    zodError.issues.forEach((issue, index) => {
      const fieldPath = issue.path.join('.') || `error_${index}`;
      error.collectedErrors![fieldPath] = {
        name: 'ValidationError',
        message: issue.message,
        path: issue.path,
      } as MyzodCompatibleError;
    });
  }
  
  return error;
}

// myzod-compatible try parse function
export function tryParseCompatible<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): T | MyzodCompatibleError {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return convertToMyzodError(result.error);
  }
  
  return result.data;
}

// Usage example - similar to myzod code
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0)
});

const result = tryParseCompatible(userSchema, {
  name: '',
  email: 'invalid-email',
  age: -1
});

// Same error checking as myzod
if ('name' in result && result.name === 'ValidationError') {
  console.log('Validation error:', result.message);
  console.log('Error path:', result.path);
  
  // Multiple error processing
  if (result.collectedErrors) {
    Object.entries(result.collectedErrors).forEach(([field, error]) => {
      console.log(`- ${field}: ${error.message}`);
    });
  }
} else {
  console.log('Success:', result);
}
```

#### Complete ValidationError Class Recreation

```typescript
// Complete recreation of myzod ValidationError class
export class ValidationError extends Error {
  public name = 'ValidationError';
  public path?: (string | number)[];
  public collectedErrors?: Record<string, ValidationError>;
  
  constructor(
    message: string, 
    path?: (string | number)[], 
    collectedErrors?: Record<string, ValidationError>
  ) {
    super(message);
    this.path = path;
    this.collectedErrors = collectedErrors;
  }
  
  // Create ValidationError instance from ZodError
  static fromZodError(zodError: z.ZodError): ValidationError {
    const firstIssue = zodError.issues[0];
    const message = firstIssue?.message || 'Validation failed';
    const path = firstIssue?.path;
    
    let collectedErrors: Record<string, ValidationError> | undefined;
    
    // Handle multiple errors
    if (zodError.issues.length > 1) {
      collectedErrors = {};
      
      zodError.issues.forEach((issue, index) => {
        const fieldPath = issue.path.join('.') || `error_${index}`;
        collectedErrors![fieldPath] = new ValidationError(
          issue.message,
          issue.path
        );
      });
    }
    
    return new ValidationError(message, path, collectedErrors);
  }
}

// Fully myzod-compatible try parse function
export function tryParseMyzod<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): T | ValidationError {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return ValidationError.fromZodError(result.error);
  }
  
  return result.data;
}

// Usage example - can use myzod code as-is
const result2 = tryParseMyzod(userSchema, {
  name: '',
  email: 'invalid-email'
});

if (result2 instanceof ValidationError) {
  console.log('Error:', result2.message);
  console.log('Path:', result2.path);
  
  // Same way to process multiple errors as myzod
  if (result2.collectedErrors) {
    Object.entries(result2.collectedErrors).forEach(([field, error]) => {
      console.log(`Field error ${field}:`, error.message);
      console.log(`Path:`, error.path);
    });
  }
} else {
  console.log('Validation success:', result2);
}
```

#### Migrating Existing myzod Code with Minimal Changes

```typescript
// Migrate existing myzod code with minimal changes
// Original myzod code:
// const result = myzodSchema.try(data);
// if (result instanceof myzod.ValidationError) { ... }

// After migration - only import and schema definition changes
import { z } from 'zod';
import { tryParseMyzod, ValidationError } from './validation-utils';

// Schema automatically converted by codemod
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});

// This part remains unchanged!
const result = tryParseMyzod(schema, data);
if (result instanceof ValidationError) {
  console.log('Error:', result.message);
  console.log('Path:', result.path);
  
  if (result.collectedErrors) {
    Object.entries(result.collectedErrors).forEach(([field, error]) => {
      console.log(`- ${field}: ${error.message}`);
    });
  }
} else {
  console.log('Success:', result);
}
```

#### Field-specific Error Helper
```typescript
// Get field-specific error messages
export function getFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  
  error.issues.forEach(issue => {
    const path = issue.path.join('.');
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  });
  
  return fieldErrors;
}

// Usage example
const result = userSchema.safeParse(invalidUser);
if (!result.success) {
  const fieldErrors = getFieldErrors(result.error);
  
  Object.entries(fieldErrors).forEach(([field, messages]) => {
    console.log(`${field}:`, messages.join(', '));
  });
}
```

## Async Validation Error Handling

### Async Validation (Zod v3 Additional Feature)

```typescript
// myzod is primarily synchronous, but Zod supports async validation
const asyncSchema = z.string().refine(async (email) => {
  // Check email existence with external API
  const exists = await checkEmailExists(email);
  return exists;
}, {
  message: 'This email address does not exist'
});

// Using async validation
async function validateEmail(email: string) {
  const result = await asyncSchema.safeParseAsync(email);
  
  if (!result.success) {
    console.log('Async validation error:', result.error.issues[0]?.message);
    return false;
  }
  
  console.log('Validation success:', result.data);
  return true;
}

async function checkEmailExists(email: string): Promise<boolean> {
  // Actual API call
  return true; // Placeholder
}
```

## Performance Optimization

### Early Return Strategy

```typescript
// myzod-style early error return
export function parseOrError<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    // Return only the first error (performance-focused)
    return {
      success: false,
      error: result.error.issues[0]?.message || 'Validation error'
    };
  }
  
  return { success: true, data: result.data };
}

// Usage example
const result = parseOrError(z.string().min(3), 'ab');
if (!result.success) {
  console.log('Error:', result.error);
} else {
  console.log('Data:', result.data);
}
```

## Migration Checklist

### myzod → Zod v3 Error Handling Migration Steps

#### Option 1: Standard Zod Migration (Recommended)

1. **`schema.try()`** → **`schema.safeParse()`**
   - Adapt to return value structure changes
   - `instanceof ValidationError` → `!result.success`

2. **`error.message`** → **`error.error.message`** or **`error.error.issues[0]?.message`**
   - Change error message access method

3. **`error.path`** → **`error.error.issues[0]?.path`**
   - Change error path access method

4. **`collectErrors()`** → **Standard behavior**
   - Zod collects all errors by default

5. **Custom error messages**
   - `.withPredicate(fn, msg)` → `.refine(fn, { message: msg })`

6. **Async validation** (Zod additional feature)
   - Utilize `safeParseAsync()`

#### Option 2: Using myzod-compatible Utilities (Minimal Changes)

1. **Create utility file**
   ```typescript
   // validation-utils.ts
   import { z } from 'zod';
   
   export class ValidationError extends Error {
     // Copy ValidationError class from above
   }
   
   export function tryParseMyzod<T>(schema: z.ZodSchema<T>, data: unknown): T | ValidationError {
     // Copy function from above
   }
   ```

2. **Change imports only**
   ```typescript
   // Before
   import myzod, { ValidationError } from 'myzod';
   
   // After
   import { z } from 'zod';
   import { tryParseMyzod as try, ValidationError } from './validation-utils';
   
   // Schema definition automatically converted by codemod
   // Error handling code remains unchanged!
   ```

3. **Keep existing error handling code**
   - `schema.try()` → `tryParseMyzod(schema, data)` bulk replace
   - `instanceof ValidationError` checks work as-is
   - `error.path`, `error.collectedErrors` work as-is

#### Migration Strategy Selection Guidelines

**Choose Standard Zod Migration when:**
- New project or small-scale error handling
- Want to utilize Zod's rich features (async validation etc.)
- Prioritize long-term maintainability

**Choose myzod-compatible Utilities when:**
- Large codebase with extensive error handling code
- Need short-term migration
- Don't want to change existing error handling logic

## Summary

myzod's `ValidationError` and `try` method can be completely replaced with Zod v3's `safeParse` and `ZodError`. Zod provides more detailed error information and supports async validation, offering greater flexibility than myzod.

Using the provided helper functions, existing myzod code patterns can be reproduced in Zod.