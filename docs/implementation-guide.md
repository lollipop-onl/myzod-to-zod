# Implementation Guide

## Overview

The myzod-to-zod codemod is implemented using **AST (Abstract Syntax Tree) manipulation** based on the architecture of [nicoespeon/zod-v3-to-v4](https://github.com/nicoespeon/zod-v3-to-v4), enabling safe and precise transformations.

## Architecture

### Directory Structure

```
src/
├── index.ts                    # CLI entry point
├── migrate.ts                  # Main transformation logic (AST operations)
├── collect-imports.ts          # myzod import collection & analysis
└── myzod-node.ts              # myzod AST node identification & operations
```

### Key Components

#### 1. Import Collection & Analysis (`collect-imports.ts`)

Collects myzod import declarations and handles alias mapping.

```typescript
export function collectMyzodImportDeclarations(sourceFile: SourceFile): ImportDeclaration[]
export function getMyzodName(importDeclaration: ImportDeclaration): string
export function collectMyzodReferences(sourceFile: SourceFile, myzodName: string)
```

**Implementation Example**:
```typescript
// Import: import customMyzod from 'myzod';
const imports = collectMyzodImportDeclarations(sourceFile);
const myzodName = getMyzodName(imports[0]); // => "customMyzod"
```

#### 2. myzod Node Identification & Operations (`myzod-node.ts`)

Ensures safe node identification through AST analysis. Unrelated methods with the same name or comments are excluded from transformation.

```typescript
export function isMyzodNode(node: Node): boolean
export function isMyzodReference(node: Node, myzodName: string): boolean
export function getRootIdentifier(node: Node): string | undefined
```

**Safety Assurance**:

Transformed (myzod-related):
```typescript
import myzod from 'myzod';
const schema = myzod.string().withPredicate(x => x.length > 3);
```

Not transformed (unrelated):
```typescript
const obj = { map: x => x, withPredicate: y => y };
obj.map(5);           // Excluded by AST analysis
obj.withPredicate(1); // Excluded by AST analysis
// myzod.map() in comments also excluded
```

#### 3. Main Transformation Logic (`migrate.ts`)

The transformation execution flow:

```typescript
export function migrateMyzodToZodV3(sourceFile: SourceFile): string {
    const myzodImports = collectMyzodImportDeclarations(sourceFile);
    
    if (myzodImports.length === 0) return sourceFile.getFullText();

    for (const importDeclaration of myzodImports) {
        const myzodName = getMyzodName(importDeclaration);
        
        // 1. Transform import statements
        transformImportStatement(importDeclaration);
        
        // 2. Transform myzod references
        transformMyzodReferences(sourceFile, myzodName);
    }

    return sourceFile.getFullText();
}
```

**Import Statement Transformation**:

```typescript
function transformImportStatement(importDeclaration: ImportDeclaration) {
    // 'myzod' → 'zod'
    importDeclaration.setModuleSpecifier('zod');
    
    // default import → named import { z }
    const defaultImport = importDeclaration.getDefaultImport();
    if (defaultImport) {
        importDeclaration.removeDefaultImport();
        importDeclaration.addNamedImport('z');
    }
}
```

Transformation example:
```typescript
// Before
import myCustomName from 'myzod';

// After  
import { z } from 'zod';
```

**myzod Reference Transformation**:

The transformation process executes in the following stages:

1. **PropertyAccessExpression transformation**: `myzod.string` → `z.string`
2. **CallExpression transformation**: Method name changes (`.withPredicate` → `.refine`)
3. **Structural transformation**: Complex syntax changes (`myzod.number().coerce()` → `z.coerce.number()`)

#### 4. CLI Entry Point (`index.ts`)

**Usage**:
```bash
# Preview (view changes only)
node dist/index.js "src/**/*.ts"

# Execute actual transformation
node dist/index.js "src/**/*.ts" --write
```

## Implemented Transformation Patterns

### Complete Coverage (All Tests Passing)

| Transformation Feature | myzod | Zod v3 | Implementation Status |
|----------------------|-------|---------|-------------------|
| Import statements | `import myzod from 'myzod'` | `import { z } from 'zod'` | ✅ Complete |
| Basic types | `myzod.string/number/boolean()` | `z.string/number/boolean()` | ✅ Complete |
| Composite types | `object/array/union/tuple/record` | `object/array/union/tuple/record` | ✅ Complete |
| Constraints | `.min/.max/.default/.optional/.nullable` | `.min/.max/.default/.optional/.nullable` | ✅ Complete |
| Pattern matching | `.pattern(regex)` | `.regex(regex)` | ✅ Complete |
| Custom validation | `.withPredicate(fn)` | `.refine(fn)` | ✅ Complete |
| Value transformation | `.map(fn)` | `.transform(fn)` | ✅ Complete |
| Object operations | `.partial()` | `.partial()` | ✅ Complete |
| Type coercion | `myzod.number().coerce()` | `z.coerce.number()` | ✅ Complete |
| Multiple literals | `myzod.literals('a', 'b')` | `z.union([z.literal('a'), z.literal('b')])` | ✅ Complete |
| Intersection | `myzod.intersection(A, B)` | `z.intersection(A, B)` | ✅ Complete |
| TypeScript enum | `myzod.enum(MyEnum)` | `z.nativeEnum(MyEnum)` | ✅ Complete |
| Type inference | `myzod.Infer<T>` | `z.infer<typeof T>` | ✅ Complete |
| Type references | `StringType, Type<T>` etc. | `ZodString, ZodType<T>` etc. | ✅ Complete |
| Unknown keys handling | `allowUnknownKeys()` | `passthrough()` | ✅ Complete |
| Object shape access | `object().shape()` | `object().shape` | ✅ Complete |

### Implementation Features

**Precision**: Accurate transformation through precise TypeScript AST syntax parsing with context understanding.

**Safety**: Complete avoidance of unintended transformations. Eliminates the risks of string replacement.

**Maintainability**: Quality assurance through TypeScript's type system. Robust AST operations with ts-morph library.

**Extensibility**: Easy addition of new API transformations. Support for complex transformation patterns.

## Detailed Transformation Examples

### Basic Transformations

```typescript
// Input
import myzod from 'myzod';

export const stringSchema = myzod.string();
export const predicateSchema = myzod.string().withPredicate(s => s.length > 3);
export const mapSchema = myzod.string().map(s => s.length);

// Unrelated code
const myObject = {
    map: (x: any) => x,
    withPredicate: (y: any) => y
};
const result = myObject.map(5);

// Output
import { z } from 'zod';

export const stringSchema = z.string();
export const predicateSchema = z.string().refine(s => s.length > 3);
export const mapSchema = z.string().transform(s => s.length);

// Unrelated code (unchanged)
const myObject = {
    map: (x: any) => x,
    withPredicate: (y: any) => y
};
const result = myObject.map(5);
```

### Complex Structural Transformations

```typescript
// Type coercion
// Before: myzod.number().coerce()
// After:  z.coerce.number()

// Multiple literals
// Before: myzod.literals('red', 'green', 'blue')
// After:  z.union([z.literal('red'), z.literal('green'), z.literal('blue')])

// Type inference
// Before: myzod.Infer<typeof schema>
// After:  z.infer<typeof schema>
```

## Test Strategy

### TDD-Compliant Development

The project is developed following **Test-Driven Development (TDD)** principles:

1. **Red Phase**: Add new test cases (initially failing)
2. **Green Phase**: Minimal implementation to pass tests
3. **Refactor Phase**: Improve code quality
4. **Commit**: Commit changes

### Test Structure

- **Comprehensive test scenarios**: Located in `test/__scenarios__/*/`
- **Comprehensive validation**: Validates both pre/post-transformation code and runtime behavior
- **100% test pass rate**: All functionality is verified

## Development Guidelines

### AST Operation Safety

- **Accurate TypeScript AST** parsing
- **Context-aware** transformations
- **Exclusion of unrelated code** impacts

### Extension Methods

To add new transformation patterns:

1. Add new test cases to `test/__scenarios__/`
2. Implement transformation logic in `src/migrate.ts`
3. Verify existing tests still pass
4. Verify new tests pass

### Debugging

Utilize CLI preview mode:
```bash
# View changes
node dist/index.js "target-file.ts"

# Apply changes
node dist/index.js "target-file.ts" --write
```

## Performance

- **Execution time**: Fast processing for comprehensive test suites
- **Memory usage**: Low memory footprint
- **Large files**: High-speed processing through ts-morph's efficient AST operations

## Conclusion

Through AST implementation, we have achieved **safe and precise transformations** that **completely eliminate the risks of string replacement** by understanding the semantic structure of TypeScript code. By following the design philosophy of the reference project, we have completed a maintainable and extensible codemod architecture with **proven implementation through comprehensive test coverage**.