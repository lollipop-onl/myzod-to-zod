# Named Imports Mixed

## 概要

Default import と named imports を混在させた場合の変換をテストします。

## myzod (変換前)

```typescript
import myzod, { string, literals, type Infer } from 'myzod';

const userSchema = myzod.object({
  name: string().min(1).max(50),
  status: literals("active", "inactive"),
  age: myzod.number().min(0).max(150),
});

type User = Infer<typeof userSchema>;
```

## zod v3 (変換後)

```typescript
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1).max(50),
  status: z.union([z.literal("active"), z.literal("inactive")]),
  age: z.number().min(0).max(150),
});

type User = z.infer<typeof userSchema>;
```

## 変換パターン

1. **Mixed imports の統合**: `import myzod, { string, literals, type Infer } from 'myzod'` → `import { z } from 'zod'`
2. **Default import の変換**: `myzod.object()` → `z.object()`
3. **Named imports の変換**: `string()` → `z.string()`, `literals(...)` → `z.union([...])`