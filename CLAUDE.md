# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **myzod to zod v3 migration codemod** project that provides automated transformation of validation schemas from the myzod library to zod v3. The project follows **Test-Driven Development (TDD)** principles as advocated by t-wada.

## Development Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run typecheck

# Run a specific test suite
npx vitest run -t "basic-string conversion"

# Run a specific test file
npx vitest run test/scenarios.ts
```

## Architecture Overview

### TDD-Driven Development Structure

The project implements t-wada TDD principles with a **Red-Green-Refactor** cycle:

1. **Current Status**: **36/44 tests passing (81.8% completion)**
2. **Implemented**: AST-based transformations with ts-morph
3. **Remaining**: 8 complex test scenarios using `describe.skip()`
4. **Implementation Strategy**: Remove `.skip` when ready to implement each feature

### Core Components

**Test Infrastructure**:
- `test/scenarios.ts`: Main test suite with TDD structure
- `test/__scenarios__/*/`: Test fixtures containing myzod/zod pairs
- Each test scenario has both `myzod.ts` and `zodv3.ts` with equivalent schemas

**Conversion Engine**:
- `src/migrate.ts`: Main AST transformation logic using ts-morph
- `src/collect-imports.ts`: Import collection and analysis
- `src/myzod-node.ts`: AST node identification utilities
- `src/index.ts`: CLI entry point with file processing

**Validation Testing**:
- `validateSchemas()`: Runtime validation comparison between myzod and zod schemas
- Tests both valid and invalid data against both libraries
- Ensures behavioral equivalence after conversion

### Migration Scope & Limitations

Based on research in `reports/01_エグゼクティブサマリー.md`:
- **81.8% completion achieved** (36/44 tests passing)
- **Target: 90-95% automation achievable**
- **Major challenges**: Type coercion, intersection types, complex literals, enums
- **Cannot be 100% automated** due to fundamental API differences

### Current Implementation Status

**✅ Implemented (36/44 tests passing)**:
```typescript
// Import conversion
import myzod from 'myzod' → import { z } from 'zod'

// Basic types: string, number, boolean, literal, object, array, union, tuple, record
myzod.string() → z.string()

// Method transformations
.withPredicate() → .refine()
.map() → .transform()
.pattern() → .regex()

// Constraints: .min(), .max(), .default(), .optional(), .nullable(), .partial()
// Arrays with constraints, string patterns, object partials
```

**⏳ Remaining Complex Cases (8/44)**:
- `number-coerce`: Structural transformation `myzod.number().coerce()` → `z.coerce.number()`
- `intersection-basic`: `myzod.intersection()` → `z.intersection()`
- `literals-multiple`: `myzod.literals()` → `z.union([z.literal(), ...])`
- `enum-basic`: `myzod.enum()` → `z.nativeEnum()`

## TDD Workflow

To implement the next conversion feature:

1. **Red Phase**: Remove `.skip` from target test case in `test/scenarios.ts`
2. **Green Phase**: Add AST transformation logic to `src/migrate.ts`
3. **Refactor Phase**: Improve implementation quality and add edge cases
4. **Commit**: Following conventional commit format with Japanese messages

Example:
```typescript
// In test/scenarios.ts, change:
describe.skip('数値強制変換', () => {
// To:
describe('数値強制変換', () => {

// Then implement in src/migrate.ts with AST transformation
```

## Key Dependencies

- **myzod**: Source validation library
- **zod**: Target validation library  
- **ts-morph**: AST manipulation (for future complex transformations)
- **prettier**: Code formatting
- **vitest**: Testing framework

## Important Files

- **`src/`**: AST-based codemod implementation with CLI
- **`test/scenarios.ts`**: Main test suite with 44 comprehensive test cases (Japanese)
- **`test/__scenarios__/*/`**: Test fixtures with README.md documentation (Japanese)
- **`reports/`**: Comprehensive analysis documents (Japanese)
- **`package.json`**: Contains test, build, and CLI commands

## CLI Usage

```bash
# Build the codemod
npm run build

# Preview changes (dry run)
node dist/index.js "src/**/*.ts"

# Apply transformations
node dist/index.js "src/**/*.ts" --write

# Run tests
npm test

# Type checking
npm run typecheck
```