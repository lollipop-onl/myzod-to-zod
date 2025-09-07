# type-string-basic

StringType型注釈の変換テストケース

## 変換パターン

```typescript
// myzod
import myzod, { StringType } from 'myzod';
const schemaType: StringType = myzod.string();

// zod
import { z, ZodString } from 'zod';
const schemaType: ZodString = z.string();
```

## 実装要件

- named import `StringType` → `ZodString` への変換
- 型注釈での型参照の変換
- インポート文での型名の変換