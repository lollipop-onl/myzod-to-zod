# Named Imports Basic

## 概要

myzod の named imports パターンの基本的な変換をテストします。

## myzod (変換前)

```typescript
import { string, literals, type Infer } from 'myzod';

const nameSchema = string().min(1).max(50);
const statusSchema = literals("active", "inactive", "pending");
type Name = Infer<typeof nameSchema>;
```

## zod v3 (変換後)

```typescript
import { z } from 'zod';

const nameSchema = z.string().min(1).max(50);
const statusSchema = z.union([z.literal("active"), z.literal("inactive"), z.literal("pending")]);
type Name = z.infer<typeof nameSchema>;
```

## 変換パターン

1. **Named imports の統合**: `import { string, literals, type Infer } from 'myzod'` → `import { z } from 'zod'`
2. **Function calls の変換**: `string()` → `z.string()`
3. **literals の変換**: `literals(...)` → `z.union([z.literal(...)])`
4. **Type inference の変換**: `Infer<T>` → `z.infer<typeof T>`