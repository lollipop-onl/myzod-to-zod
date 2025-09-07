# myzod-to-zod

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/lollipop-onl/myzod-to-zod)

[![npm version](https://img.shields.io/npm/v/myzod-to-zod.svg)](https://www.npmjs.com/package/myzod-to-zod)
[![Tests](https://github.com/lollipop-onl/myzod-to-zod/workflows/Tests/badge.svg)](https://github.com/lollipop-onl/myzod-to-zod/actions)

A codemod to automatically migrate your codebase from [myzod](https://github.com/davidmdm/myzod) to [zod v3](https://github.com/colinhacks/zod).

This tool uses AST transformations to safely and accurately convert myzod validation schemas to their zod v3 equivalents, achieving **100% automated conversion** for supported patterns.

## ✨ Features

- 🔄 **100% Test Coverage**: All transformation patterns tested and verified
- 🛡️ **AST-based**: Safe transformations that preserve code structure and comments
- ⚡ **High Success Rate**: Converts common myzod patterns automatically
- 🎯 **Precise**: Only transforms myzod-related code, leaves everything else untouched
- 📚 **Well Documented**: Comprehensive guide for manual migration steps

## 🚀 Quick Start

### Interactive CLI (Recommended)
```bash
npx myzod-to-zod
```

### Non-interactive CLI
```bash
# Preview changes (dry run)
npx myzod-to-zod "src/**/*.ts"

# Apply transformations
npx myzod-to-zod "src/**/*.ts" --write
```

### Install as Package
```bash
npm install -D myzod-to-zod
```

## 📖 Example

### Before (myzod)
```typescript
import myzod from 'myzod';

const userSchema = myzod.object({
  name: myzod.string().min(1).max(50),
  email: myzod.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: myzod.number().min(0).max(150).optional(),
  isActive: myzod.boolean().default(true),
});

// Complex transformations
const statusSchema = myzod.literals('active', 'inactive', 'pending');
const coerceSchema = myzod.number().coerce();
const validatedSchema = myzod.string().withPredicate(
  s => s.length > 0,
  'String must not be empty'
);

// Type inference
type User = myzod.Infer<typeof userSchema>;
type Status = myzod.Infer<typeof statusSchema>;
```

### After (zod v3)
```typescript
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: z.number().min(0).max(150).optional(),
  isActive: z.boolean().default(true),
});

// Complex transformations
const statusSchema = z.union([z.literal("active"), z.literal("inactive"), z.literal("pending")]);
const coerceSchema = z.coerce.number();
const validatedSchema = z.string().refine(
  s => s.length > 0,
  'String must not be empty'
);

// Type inference
type User = z.infer<typeof userSchema>;
type Status = z.infer<typeof statusSchema>;
```

## 🔄 Transformation Coverage

### ✅ Fully Automated

#### Basic Types
- `myzod.string()` → `z.string()`
- `myzod.number()` → `z.number()`
- `myzod.boolean()` → `z.boolean()`
- `myzod.literal()` → `z.literal()`
- `myzod.object()` → `z.object()`
- `myzod.array()` → `z.array()`
- `myzod.union()` → `z.union()`
- `myzod.tuple()` → `z.tuple()`
- `myzod.record()` → `z.record()`
- `myzod.dictionary()` → `z.record()` (with automatic `.optional()` handling)

#### Constraints & Validation
- `.min()` / `.max()` → `.min()` / `.max()`
- `.pattern()` → `.regex()`
- `.default()` → `.default()`
- `.optional()` → `.optional()`
- `.nullable()` → `.nullable()`
- Array length constraints

#### Advanced Transformations
- `.withPredicate()` → `.refine()` (Custom validation)
- `.map()` → `.transform()` (Value transformation)
- `.partial()` → `.partial()` (Object partial types)
- `.collectErrors()` → *removed* (zod collects errors by default)
- `myzod.number().coerce()` → `z.coerce.number()` (Structural change)
- `myzod.intersection()` → `z.intersection()` (Intersection types)
- `myzod.literals('a', 'b')` → `z.union([z.literal('a'), z.literal('b')])` (Complex expansion)
- `myzod.enum(Color)` → `z.nativeEnum(Color)` (TypeScript enums)

#### Type System
- `myzod.Infer<typeof T>` → `z.infer<typeof T>` (Type inference)

## 🔧 Manual Migration Required

While this codemod handles 100% of schema definition patterns automatically, only error handling requires manual attention:

### Error Handling Patterns

**⚠️ Manual Change Required**

```typescript
// Before
const result = schema.try(data);
if (result instanceof myzod.ValidationError) {
  // Handle error
}

// After (manual fix needed)  
const result = schema.safeParse(data);
if (!result.success) {
  // Handle error with result.error
}
```

**Why:** myzod and zod have fundamentally different error handling APIs.

## 📋 Post-Migration Checklist

After running the codemod, please:

1. **Review Error Handling**: Update `.try()` calls to `.safeParse()`
2. **Test Thoroughly**: Run your test suite to catch any behavioral differences
3. **Update Dependencies**: Remove myzod and ensure zod v3 is installed

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- TypeScript project
- myzod schemas in your codebase

### Steps
1. **Backup your code** (recommended)
2. **Install zod v3** in your project:
   ```bash
   npm install zod
   ```
3. **Run the codemod**:
   ```bash
   npx myzod-to-zod "src/**/*.ts" --write
   ```
4. **Follow the manual migration steps** above
5. **Remove myzod**:
   ```bash
   npm uninstall myzod
   ```
6. **Test thoroughly**

## 🐛 Troubleshooting

### Common Issues

**"SyntaxError: Unexpected token"**
- Ensure your TypeScript files are valid before running the codemod
- Check that file paths are correctly specified

**"No files found"**
- Use quotes around glob patterns: `"src/**/*.ts"`
- Verify the path patterns match your project structure

**"Some transformations missing"**
- Check the manual migration section above
- Report missing patterns as GitHub issues

**"Type errors after migration"**
- Review error handling patterns (`.try()` → `.safeParse()`)
- Ensure zod v3 is properly installed
- Check for any remaining myzod imports

### Getting Help

1. Check the [manual migration guide](#-manual-migration-required) above
2. Review the [troubleshooting section](#-troubleshooting)
3. [Open an issue](https://github.com/simochee/myzod-to-zod/issues) with a minimal reproduction

## 🧪 Development

### Running Tests
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run typecheck          # Type checking
```

### Building
```bash
npm run build              # Build the codemod
```

### Project Structure
```
myzod-to-zod/
├── src/                   # Main implementation
│   ├── index.ts          # CLI entry point
│   ├── migrate.ts        # AST transformation logic
│   ├── collect-imports.ts # Import analysis
│   └── myzod-node.ts     # AST utilities
├── test/                 # Test suite
│   ├── scenarios.ts      # Main test file
│   └── __scenarios__/    # 46 test cases with README
└── reports/              # Documentation
```

## 📚 Resources

- [myzod Documentation](https://github.com/davidmdm/myzod)
- [zod v3 Documentation](https://zod.dev)
- [AST Explorer](https://astexplorer.net/) for understanding transformations
- [TypeScript Compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new transformation patterns
4. Ensure all tests pass
5. Submit a pull request

### Adding New Transformations

1. Add test cases in `test/__scenarios__/`
2. Implement transformation in `src/migrate.ts`
3. Update documentation
4. Follow TDD principles

## 📄 License

MIT License. See [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- Inspired by [zod-v3-to-v4](https://github.com/nicoespeon/zod-v3-to-v4)
- Built with [ts-morph](https://github.com/dsherret/ts-morph) for safe AST transformations
- Thanks to the myzod and zod communities

---

**Need help?** [Open an issue](https://github.com/simochee/myzod-to-zod/issues) or check our [troubleshooting guide](#-troubleshooting).