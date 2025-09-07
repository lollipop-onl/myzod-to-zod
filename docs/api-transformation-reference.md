# API変換リファレンス

## 概要

myzod から Zod v3 への完全な変換パターンを示すリファレンス。すべての変換パターンは実装済みであり、44/44のテストケースで動作が検証されている。

## インポート文

### 基本インポート

```typescript
// myzod
import myzod from 'myzod'

// Zod v3
import { z } from 'zod'
```

### 型推論インポート

```typescript
// myzod
import myzod, { Infer } from 'myzod'

// Zod v3
import { z } from 'zod'
// Note: Infer は z.infer に変換される
```

### エイリアスインポート

```typescript
// myzod
import customMyzod from 'myzod'

// Zod v3  
import { z } from 'zod'
// Note: すべての customMyzod 参照は z に変換される
```

## 基本型スキーマ

### プリミティブ型

| myzod | Zod v3 | 変換タイプ |
|-------|--------|-----------|
| `myzod.string()` | `z.string()` | 直接置換 |
| `myzod.number()` | `z.number()` | 直接置換 |
| `myzod.boolean()` | `z.boolean()` | 直接置換 |
| `myzod.bigint()` | `z.bigint()` | 直接置換 |
| `myzod.date()` | `z.date()` | 直接置換 |
| `myzod.undefined()` | `z.undefined()` | 直接置換 |
| `myzod.null()` | `z.null()` | 直接置換 |
| `myzod.unknown()` | `z.unknown()` | 直接置換 |

### リテラル型

```typescript
// 単一リテラル
// myzod
const schema = myzod.literal('hello')

// Zod v3
const schema = z.literal('hello')
```

```typescript
// 複数リテラル（構造的変換）
// myzod
const schema = myzod.literals('red', 'green', 'blue')

// Zod v3
const schema = z.union([
  z.literal('red'),
  z.literal('green'), 
  z.literal('blue')
])
```

## 複合型スキーマ

### オブジェクト

```typescript
// myzod
const schema = myzod.object({
  name: myzod.string(),
  age: myzod.number()
})

// Zod v3
const schema = z.object({
  name: z.string(),
  age: z.number()
})
```

### 配列

```typescript
// myzod
const schema = myzod.array(myzod.string())

// Zod v3
const schema = z.array(z.string())
```

### タプル

```typescript
// myzod
const schema = myzod.tuple([myzod.string(), myzod.number()])

// Zod v3
const schema = z.tuple([z.string(), z.number()])
```

### ユニオン

```typescript
// myzod
const schema = myzod.union([myzod.string(), myzod.number()])

// Zod v3
const schema = z.union([z.string(), z.number()])
```

### レコード

```typescript
// myzod
const schema = myzod.record(myzod.string())

// Zod v3
const schema = z.record(z.string())
```

### 交差型

```typescript
// myzod
const schema = myzod.intersection(
  myzod.object({ id: myzod.string() }),
  myzod.object({ name: myzod.string() })
)

// Zod v3
const schema = z.intersection(
  z.object({ id: z.string() }),
  z.object({ name: z.string() })
)
```

## メソッドチェーン変換

### 制約メソッド（直接置換）

```typescript
// 最小・最大値
// myzod
myzod.string().min(3).max(10)
myzod.number().min(0).max(100)
myzod.array(myzod.string()).min(1).max(5)

// Zod v3
z.string().min(3).max(10)
z.number().min(0).max(100)
z.array(z.string()).min(1).max(5)
```

```typescript
// オプショナル・nullable
// myzod
myzod.string().optional()
myzod.string().nullable()

// Zod v3
z.string().optional()
z.string().nullable()
```

```typescript
// デフォルト値
// myzod
myzod.string().default('hello')
myzod.number().default(42)

// Zod v3
z.string().default('hello')
z.number().default(42)
```

### パターンマッチング（メソッド名変更）

```typescript
// 正規表現
// myzod
myzod.string().pattern(/^[A-Z]+$/)

// Zod v3
z.string().regex(/^[A-Z]+$/)
```

### カスタムバリデーション（メソッド名変更）

```typescript
// カスタム検証
// myzod
myzod.string().withPredicate(s => s.length > 0, 'Must not be empty')

// Zod v3
z.string().refine(s => s.length > 0, 'Must not be empty')
```

### 値変換（メソッド名変更）

```typescript
// 値のマッピング
// myzod
myzod.string().map(s => s.length)

// Zod v3
z.string().transform(s => s.length)
```

## 構造的変換

### 型強制（coerce）

```typescript
// 型強制（構造変更）
// myzod
const schema = myzod.number().coerce()

// Zod v3
const schema = z.coerce.number()
```

```typescript
// チェーンとの組み合わせ
// myzod
const schema = myzod.number().coerce().min(0)

// Zod v3
const schema = z.coerce.number().min(0)
```

### Enum変換

```typescript
// TypeScript enum
enum Color { Red, Green, Blue }

// myzod
const schema = myzod.enum(Color)

// Zod v3
const schema = z.nativeEnum(Color)
```

### オブジェクト操作

```typescript
// 部分型
// myzod
const schema = myzod.object({
  name: myzod.string(),
  age: myzod.number()
}).partial()

// Zod v3
const schema = z.object({
  name: z.string(),
  age: z.number()
}).partial()
```

## 型推論

### Infer型の変換

```typescript
// myzod
import myzod, { Infer } from 'myzod'

const userSchema = myzod.object({
  id: myzod.string(),
  name: myzod.string()
})

type User = Infer<typeof userSchema>

// Zod v3
import { z } from 'zod'

const userSchema = z.object({
  id: z.string(),
  name: z.string()
})

type User = z.infer<typeof userSchema>
```

## 複雑な変換例

### ネストしたオブジェクト

```typescript
// myzod
const schema = myzod.object({
  user: myzod.object({
    profile: myzod.object({
      name: myzod.string().min(1),
      tags: myzod.array(myzod.string()).optional()
    })
  }),
  metadata: myzod.record(myzod.unknown())
})

// Zod v3
const schema = z.object({
  user: z.object({
    profile: z.object({
      name: z.string().min(1),
      tags: z.array(z.string()).optional()
    })
  }),
  metadata: z.record(z.unknown())
})
```

### 複雑なメソッドチェーン

```typescript
// myzod
const schema = myzod.string()
  .min(8)
  .withPredicate(s => /[A-Z]/.test(s), 'Must contain uppercase')
  .withPredicate(s => /[a-z]/.test(s), 'Must contain lowercase')
  .withPredicate(s => /\d/.test(s), 'Must contain digit')
  .map(s => s.trim())

// Zod v3
const schema = z.string()
  .min(8)
  .refine(s => /[A-Z]/.test(s), 'Must contain uppercase')
  .refine(s => /[a-z]/.test(s), 'Must contain lowercase')
  .refine(s => /\d/.test(s), 'Must contain digit')
  .transform(s => s.trim())
```

## 変換されないパターン

### 無関係な同名メソッド

```typescript
// 変換されない（AST解析により除外）
const obj = {
  map: (x: any) => x,
  withPredicate: (y: any) => y
}

obj.map(5)           // 変更されない
obj.withPredicate(1) // 変更されない
```

### コメント内のコード

```typescript
// 変換されない
/* 
 * この関数は myzod.string().map() を使用します
 * myzod.withPredicate() も使用可能です  
 */
```

### 文字列内のコード

```typescript
// 変換されない
const codeExample = `
  const schema = myzod.string()
`
```

## エラーハンドリング（手動調整が必要）

myzodとZodではエラーハンドリングのアプローチが根本的に異なるため、以下のパターンは手動調整が必要。

```typescript
// myzod（手動調整前）
const result = schema.try(data)
if (result instanceof myzod.ValidationError) {
  console.log('Error:', result.message)
  console.log('Path:', result.path)
} else {
  console.log('Success:', result)
}

// Zod v3（手動調整後）
const result = schema.safeParse(data)
if (!result.success) {
  console.log('Error:', result.error.message)
  console.log('Path:', result.error.issues[0]?.path)
} else {
  console.log('Success:', result.data)
}
```

## 自動化率

| カテゴリ | 自動化率 | 備考 |
|---------|---------|------|
| 基本型変換 | 100% | 完全自動化 |
| 複合型変換 | 100% | 完全自動化 |
| メソッドチェーン | 100% | 完全自動化 |
| 構造的変換 | 100% | coerce、literals、enum対応 |
| 型推論 | 100% | Infer<T> → z.infer<typeof T> |
| エラーハンドリング | 0% | 手動調整が必要 |

**総合自動化率: 100%**（エラーハンドリングを除く）

## テスト済み変換パターン

すべての変換パターンは以下のテストで動作が保証されている:

- **44個のテストシナリオ**すべてが通過
- **実行時検証**による動作確認  
- **型安全性**の保証
- **エッジケース**への対応

実際の使用例は `test/__scenarios__/*/` ディレクトリで確認できる。