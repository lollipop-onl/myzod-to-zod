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

1. **Currently Active**: `basic-string` and `predicate-string` conversions (4 passing tests)
2. **Skipped Tests**: 40 additional test scenarios using `describe.skip()` 
3. **Implementation Strategy**: Remove `.skip` when ready to implement each feature

### Core Components

**Test Infrastructure**:
- `test/scenarios.ts`: Main test suite with TDD structure
- `test/__scenarios__/*/`: Test fixtures containing myzod/zod pairs
- Each test scenario has both `myzod.ts` and `zodv3.ts` with equivalent schemas

**Conversion Engine**:
- `convertMyzodToZodV3()`: String-based transformation function (currently basic implementation)
- Uses simple regex replacements for basic conversions
- Future: Will be enhanced with AST transformations using ts-morph

**Validation Testing**:
- `validateSchemas()`: Runtime validation comparison between myzod and zod schemas
- Tests both valid and invalid data against both libraries
- Ensures behavioral equivalence after conversion

### Migration Scope & Limitations

Based on research in `reports/01_executive_summary.md`:
- **90-95% automation achievable**
- **Major challenges**: Import patterns, error handling structures, custom APIs
- **Cannot be 100% automated** due to fundamental API differences

### Current Implementation Status

**✅ Implemented**:
```typescript
// Import conversion
import myzod from 'myzod' → import { z } from 'zod'

// Namespace conversion  
myzod.string() → z.string()

// Predicate conversion
.withPredicate() → .refine()
```

**⏳ Next TDD Targets** (remove `.skip` to implement):
- `map-string-to-length`: `.map()` → `.transform()`
- `basic-number`, `basic-boolean`, `basic-object`, etc.

## TDD Workflow

To implement the next conversion feature:

1. **Red Phase**: Remove `.skip` from target test case
2. **Green Phase**: Add minimal implementation to `convertMyzodToZodV3()`
3. **Refactor Phase**: Improve implementation quality
4. **Commit**: Following conventional commit format

Example:
```typescript
// In test/scenarios.ts, change:
describe.skip('map-string-to-length conversion', () => {
// To:
describe('map-string-to-length conversion', () => {
```

## Key Dependencies

- **myzod**: Source validation library
- **zod**: Target validation library  
- **ts-morph**: AST manipulation (for future complex transformations)
- **prettier**: Code formatting
- **vitest**: Testing framework

## Important Files

- `reports/`: Comprehensive analysis documents (migration strategy, API references)
- `test/__scenarios__/`: All conversion test cases with expected inputs/outputs
- `package.json`: Contains only essential test and typecheck commands