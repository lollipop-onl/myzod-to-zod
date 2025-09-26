# API Transformation Reference

## Overview

Complete transformation patterns from myzod to Zod v3. All transformation patterns are implemented and verified with comprehensive test cases.

## Import Statements

### Basic Import

```typescript
// myzod
import myzod from 'myzod'

// Zod v3
import { z } from 'zod'
```

### Type Inference Import

```typescript
// myzod
import myzod, { Infer } from 'myzod'

// Zod v3
import { z } from 'zod'
// Note: Infer is converted to z.infer
```

### Alias Import

```typescript
// myzod
import customMyzod from 'myzod'

// Zod v3  
import { z } from 'zod'
// Note: All customMyzod references are converted to z
```

## Basic Type Schemas

### Primitive Types

| myzod | Zod v3 | Transformation Type |
|-------|--------|-------------------|
| `myzod.string()` | `z.string()` | Direct replacement |
| `myzod.number()` | `z.number()` | Direct replacement |
| `myzod.boolean()` | `z.boolean()` | Direct replacement |
| `myzod.bigint()` | `z.bigint()` | Direct replacement |
| `myzod.date()` | `z.coerce.date()` | Direct replacement with coercion |
| `myzod.undefined()` | `z.undefined()` | Direct replacement |
| `myzod.null()` | `z.null()` | Direct replacement |
| `myzod.unknown()` | `z.unknown()` | Direct replacement |

### Literal Types

```typescript
// Single literal
// myzod
const schema = myzod.literal('hello')

// Zod v3
const schema = z.literal('hello')
```

```typescript
// Multiple literals (structural transformation)
// myzod
const schema = myzod.literals('red', 'green', 'blue')

// Zod v3
const schema = z.union([
  z.literal('red'),
  z.literal('green'), 
  z.literal('blue')
])
```

## Composite Type Schemas

### Object

```typescript
// myzod
const schema = myzod.object({
  name: myzod.string(),
  age: myzod.number()
})

// Zod v3
const schema = z.object({
  name: z.string(),
  age: z.number()
})
```

### Array

```typescript
// myzod
const schema = myzod.array(myzod.string())

// Zod v3
const schema = z.array(z.string())
```

### Tuple

```typescript
// myzod
const schema = myzod.tuple([myzod.string(), myzod.number()])

// Zod v3
const schema = z.tuple([z.string(), z.number()])
```

### Union

```typescript
// myzod
const schema = myzod.union([myzod.string(), myzod.number()])

// Zod v3
const schema = z.union([z.string(), z.number()])
```

### Record

```typescript
// myzod
const schema = myzod.record(myzod.string())

// Zod v3
const schema = z.record(z.string())
```

### Intersection

```typescript
// myzod
const schema = myzod.intersection(
  myzod.object({ id: myzod.string() }),
  myzod.object({ name: myzod.string() })
)

// Zod v3
const schema = z.intersection(
  z.object({ id: z.string() }),
  z.object({ name: z.string() })
)
```

## Method Chain Transformations

### Constraint Methods (Direct Replacement)

```typescript
// Min/Max values
// myzod
myzod.string().min(3).max(10)
myzod.number().min(0).max(100)
myzod.array(myzod.string()).min(1).max(5)

// Zod v3
z.string().min(3).max(10)
z.number().min(0).max(100)
z.array(z.string()).min(1).max(5)
```

```typescript
// Optional/Nullable
// myzod
myzod.string().optional()
myzod.string().nullable()

// Zod v3
z.string().optional()
z.string().nullable()
```

```typescript
// Default values
// myzod
myzod.string().default('hello')
myzod.number().default(42)

// Zod v3
z.string().default('hello')
z.number().default(42)
```

### Pattern Matching (Method Name Change)

```typescript
// Regular expression
// myzod
myzod.string().pattern(/^[A-Z]+$/)

// Zod v3
z.string().regex(/^[A-Z]+$/)
```

### Custom Validation (Method Name Change)

```typescript
// Custom validation
// myzod
myzod.string().withPredicate(s => s.length > 0, 'Must not be empty')

// Zod v3
z.string().refine(s => s.length > 0, 'Must not be empty')
```

### Value Transformation (Method Name Change)

```typescript
// Value mapping
// myzod
myzod.string().map(s => s.length)

// Zod v3
z.string().transform(s => s.length)
```

## Structural Transformations

### Type Coercion

```typescript
// Type coercion (structural change)
// myzod
const schema = myzod.number().coerce()

// Zod v3
const schema = z.coerce.number()
```

```typescript
// Chain combination
// myzod
const schema = myzod.number().coerce().min(0)

// Zod v3
const schema = z.coerce.number().min(0)
```

### Enum Transformation

```typescript
// TypeScript enum
enum Color { Red, Green, Blue }

// myzod
const schema = myzod.enum(Color)

// Zod v3
const schema = z.nativeEnum(Color)
```

### Object Operations

```typescript
// Partial type
// myzod
const schema = myzod.object({
  name: myzod.string(),
  age: myzod.number()
}).partial()

// Zod v3
const schema = z.object({
  name: z.string(),
  age: z.number()
}).partial()
```

### Unknown Keys Handling

```typescript
// Allow unknown keys
// myzod
const schema = myzod.object({
  name: myzod.string()
}).allowUnknownKeys()

// Zod v3
const schema = z.object({
  name: z.string()
}).passthrough()
```

### Object Shape Access

```typescript
// Object shape access
// myzod
const baseSchema = myzod.object({
  name: myzod.string(),
  age: myzod.number()
})
const extendedSchema = myzod.object({
  ...baseSchema.shape(),
  email: myzod.string()
})

// Zod v3
const baseSchema = z.object({
  name: z.string(),
  age: z.number()
})
const extendedSchema = z.object({
  ...baseSchema.shape,
  email: z.string()
})
```

## Type Inference

### Infer Type Transformation

```typescript
// myzod
import myzod, { Infer } from 'myzod'

const userSchema = myzod.object({
  id: myzod.string(),
  name: myzod.string()
})

type User = Infer<typeof userSchema>

// Zod v3
import { z } from 'zod'

const userSchema = z.object({
  id: z.string(),
  name: z.string()
})

type User = z.infer<typeof userSchema>
```

### Type Reference Transformations

```typescript
// myzod type references
import { StringType, NumberType, ObjectType, Type } from 'myzod'

const stringSchema: StringType = myzod.string()
const numberSchema: NumberType = myzod.number()
const objectSchema: ObjectType<{ name: string }> = myzod.object({ name: myzod.string() })
const genericSchema: Type<string> = myzod.string()

// Zod v3 type references
import { ZodString, ZodNumber, ZodObject, ZodType } from 'zod'

const stringSchema: ZodString = z.string()
const numberSchema: ZodNumber = z.number()
const objectSchema: ZodObject<{ name: string }> = z.object({ name: z.string() })
const genericSchema: ZodType<string> = z.string()
```

## Complex Transformation Examples

### Nested Objects

```typescript
// myzod
const schema = myzod.object({
  user: myzod.object({
    profile: myzod.object({
      name: myzod.string().min(1),
      tags: myzod.array(myzod.string()).optional()
    })
  }),
  metadata: myzod.record(myzod.unknown())
})

// Zod v3
const schema = z.object({
  user: z.object({
    profile: z.object({
      name: z.string().min(1),
      tags: z.array(z.string()).optional()
    })
  }),
  metadata: z.record(z.unknown())
})
```

### Complex Method Chains

```typescript
// myzod
const schema = myzod.string()
  .min(8)
  .withPredicate(s => /[A-Z]/.test(s), 'Must contain uppercase')
  .withPredicate(s => /[a-z]/.test(s), 'Must contain lowercase')
  .withPredicate(s => /\d/.test(s), 'Must contain digit')
  .map(s => s.trim())

// Zod v3
const schema = z.string()
  .min(8)
  .refine(s => /[A-Z]/.test(s), 'Must contain uppercase')
  .refine(s => /[a-z]/.test(s), 'Must contain lowercase')
  .refine(s => /\d/.test(s), 'Must contain digit')
  .transform(s => s.trim())
```

## Patterns Not Transformed

### Unrelated Methods with Same Names

```typescript
// Not transformed (excluded by AST analysis)
const obj = {
  map: (x: any) => x,
  withPredicate: (y: any) => y
}

obj.map(5)           // Not changed
obj.withPredicate(1) // Not changed
```

### Code in Comments

```typescript
// Not transformed
/* 
 * This function uses myzod.string().map()
 * myzod.withPredicate() is also available  
 */
```

### Code in Strings

```typescript
// Not transformed
const codeExample = `
  const schema = myzod.string()
`
```

## Error Handling (Manual Adjustment Required)

myzod and Zod have fundamentally different error handling approaches, so the following patterns require manual adjustment:

```typescript
// myzod (before manual adjustment)
const result = schema.try(data)
if (result instanceof myzod.ValidationError) {
  console.log('Error:', result.message)
  console.log('Path:', result.path)
} else {
  console.log('Success:', result)
}

// Zod v3 (after manual adjustment)
const result = schema.safeParse(data)
if (!result.success) {
  console.log('Error:', result.error.message)
  console.log('Path:', result.error.issues[0]?.path)
} else {
  console.log('Success:', result.data)
}
```

## Automation Coverage

| Category | Automation Rate | Notes |
|---------|---------------|-------|
| Basic type transformations | 100% | Fully automated |
| Composite type transformations | 100% | Fully automated |
| Method chains | 100% | Fully automated |
| Structural transformations | 100% | coerce, literals, enum supported |
| Type inference | 100% | Infer<T> → z.infer<typeof T> |
| Type references | 100% | StringType, Type<T> etc. supported |
| Error handling | 0% | Manual adjustment required |

**Overall automation rate: 100%** (excluding error handling)

## Tested Transformation Patterns

All transformation patterns are guaranteed to work with the following tests:

- **All test scenarios** passing
- **Runtime validation** for behavior verification  
- **Type safety** guaranteed
- **Edge case** coverage

Actual usage examples can be found in the `test/__scenarios__/*/` directory.