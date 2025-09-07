# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **completed myzod to zod v3 migration codemod** that provides automated transformation of validation schemas from the myzod library to zod v3. The project was developed using **Test-Driven Development (TDD)** principles.

## Development Commands

```bash
# Run all tests (75/75 passing)
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run typecheck

# Build the codemod
npm run build
```

## Architecture Overview

### Core Components

**Test Infrastructure**:
- `test/scenarios.ts`: Complete test suite with 75 passing test cases
- `test/__scenarios__/*/`: Test fixtures containing myzod/zod equivalent pairs
- `validateSchemas()`: Runtime validation comparison ensuring behavioral equivalence

**Conversion Engine**:
- `src/migrate.ts`: Complete AST transformation logic using ts-morph
- `src/collect-imports.ts`: Import collection and analysis
- `src/myzod-node.ts`: AST node identification utilities
- `src/index.ts`: CLI entry point with file processing

### Project Status

🎉 **COMPLETED** - 75/75 tests passing (100% automation achieved)

### Supported Transformations

The codemod provides complete automation for all common myzod to zod patterns:

```typescript
// Import conversion
import myzod from 'myzod' → import { z } from 'zod'
import { StringType, Type } from 'myzod' → import { ZodString, ZodType } from 'zod'

// Basic types and methods
myzod.string/number/boolean/literal/object/array/union/tuple/record() → z.*()
.withPredicate() → .refine() | .map() → .transform() | .pattern() → .regex()
.allowUnknownKeys() → .passthrough() | .shape() → .shape

// Structural transformations
myzod.number().coerce() → z.coerce.number()
myzod.literals('a', 'b') → z.union([z.literal('a'), z.literal('b')])
myzod.enum(['a', 'b']) → z.enum(['a', 'b'])          // Array literal
myzod.enum(MyEnum) → z.nativeEnum(MyEnum)            // Enum object
myzod.intersection(A, B) → z.intersection(A, B)

// Type references and inference
myzod.Infer<typeof T> → z.infer<typeof T>
const schema: StringType → const schema: ZodString
const schema: Type<T> → const schema: ZodType<T>

// All constraints: .min(), .max(), .default(), .optional(), .nullable(), .partial()
```

## Key Dependencies

- **myzod**: Source validation library
- **zod**: Target validation library  
- **ts-morph**: AST manipulation for code transformations
- **prettier**: Code formatting
- **vitest**: Testing framework

## Important Files

- **`src/`**: Complete AST-based codemod implementation with CLI
- **`test/scenarios.ts`**: Main test suite with 75 comprehensive test cases
- **`test/__scenarios__/*/`**: Test fixtures with myzod/zod equivalent pairs
- **`reports/`**: Analysis documents (Japanese)
- **`package.json`**: Contains test, build, and CLI commands

## CLI Usage

```bash
# Build the codemod
npm run build

# Preview changes (dry run)
node dist/index.js "src/**/*.ts"

# Apply transformations
node dist/index.js "src/**/*.ts" --write

# Example usage with npm package
npx myzod-to-zod "src/**/*.ts" --write
```

## Production Ready

This codemod is **complete and ready for production use** with:

- ✅ 75/75 tests passing (100% automation)
- ✅ Complete AST-based transformation engine
- ✅ CLI tool with preview and write modes
- ✅ Comprehensive test coverage
- ✅ Handles all common myzod to zod migration patterns

## Future Enhancements

While the codemod is complete for all common use cases, potential future enhancements could include:

- Additional utility type transformations (ObjectShape, InferObjectShape, AnyType)
- Support for advanced custom validators
- Integration with popular code editors