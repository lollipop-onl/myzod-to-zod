# Dictionary Basic

## 概要

myzod の `dictionary()` メソッドの自動変換をテストします。

## myzod (変換前)

```typescript
import myzod from 'myzod';

// Basic non-optional → record with optional
const stringDictionary = myzod.dictionary(myzod.string());

// Already optional → remains optional  
const optionalStringDictionary = myzod.dictionary(myzod.string().optional());

// Complex dictionary
const complexDictionary = myzod.dictionary(
  myzod.object({
    name: myzod.string(),
    age: myzod.number()
  })
);
```

## zod v3 (変換後)

```typescript
import { z } from 'zod';

// Basic non-optional → record with optional
const stringDictionary = z.record(z.string().optional());

// Already optional → remains optional
const optionalStringDictionary = z.record(z.string().optional());

// Complex dictionary  
const complexDictionary = z.record(
  z.object({
    name: z.string(),
    age: z.number()
  }).optional()
);
```

## 変換パターン

1. **Dictionary to Record**: `myzod.dictionary()` → `z.record()`
2. **Auto-optional**: 非Optional型は自動的に `.optional()` 付きで変換
3. **Optional preservation**: 既に Optional な型はそのまま

## myzod の Dictionary 仕様

myzod の `dictionary` は内部的に値を Optional にラップします：
- `dictionary(T)` → `record(T extends OptionalType ? T : OptionalType<T>)`