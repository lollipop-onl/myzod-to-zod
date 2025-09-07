# Object CollectErrors

## 概要

myzod の `.collectErrors()` メソッドの自動削除をテストします。

## myzod (変換前)

```typescript
import myzod from 'myzod';

const schema = myzod.object({
  name: myzod.string().min(1),
  age: myzod.number().min(0),
}).collectErrors();
```

## zod v3 (変換後)

```typescript
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  age: z.number().min(0),
});
```

## 変換パターン

1. **collectErrors の削除**: `.collectErrors()` → 削除（zod にはこのメソッドが存在しない）
2. **デフォルト動作**: zod はデフォルトでエラーを収集するため、削除しても同等の動作が保たれる

## 理由

- zod には `.collectErrors()` メソッドが存在しない
- zod はデフォルトでエラーを収集する
- このメソッドを残すと実行時エラーになる