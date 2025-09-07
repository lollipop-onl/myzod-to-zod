# myzod → Zod v3 変換テストケース設計書

## 概要

このドキュメントは、[nicoespeon/zod-v3-to-v4](https://github.com/nicoespeon/zod-v3-to-v4)を参考に、myzodライブラリからZod v3への変換を検証するテストケースの設計書です。myzodのすべての機能について、適切なZod v3コードへの変換が正しく行われることを確認します。

## テスト設計方針

### 1. テスト構造
- **フィクスチャベース**: `test/__scenarios__/` ディレクトリに変換前後のコードペアを配置
- **包括的カバレッジ**: myzodの全機能をカバー
- **段階的テスト**: 基本型から複合型、高度な機能まで段階的にテスト

### 2. テストファイル構造
```
test/
├── scenarios.ts                    # メインテストファイル
└── __scenarios__/
    ├── basic-string/
    │   ├── myzod.ts                # 変換前のmyzodコード
    │   └── zodv3.ts                # 変換後のZod v3コード
    ├── basic-number/
    │   ├── myzod.ts
    │   └── zodv3.ts
    └── ...
```

## テストケース分類

### A. 基本型スキーマ（20ケース）

#### A1. 文字列型
| ケース名 | myzod | Zod v3 | 説明 |
|---------|--------|--------|------|
| `basic-string` | `myzod.string()` | `z.string()` | 基本文字列型 |
| `string-min-max` | `myzod.string().min(5).max(10)` | `z.string().min(5).max(10)` | 長さ制限 |
| `string-pattern` | `myzod.string().pattern(/^[A-Z]+$/)` | `z.string().regex(/^[A-Z]+$/)` | 正規表現 |
| `string-valid` | `myzod.string().valid(['red', 'green', 'blue'])` | `z.enum(['red', 'green', 'blue'])` | 列挙値 |
| `string-default` | `myzod.string().default('hello')` | `z.string().default('hello')` | デフォルト値 |

#### A2. 数値型
| ケース名 | myzod | Zod v3 | 説明 |
|---------|--------|--------|------|
| `basic-number` | `myzod.number()` | `z.number()` | 基本数値型 |
| `number-min-max` | `myzod.number().min(0).max(100)` | `z.number().min(0).max(100)` | 範囲制限 |
| `number-coerce` | `myzod.number().coerce()` | `z.coerce.number()` | 型強制 |
| `number-default` | `myzod.number().default(42)` | `z.number().default(42)` | デフォルト値 |

#### A3. その他基本型
| ケース名 | myzod | Zod v3 | 説明 |
|---------|--------|--------|------|
| `basic-boolean` | `myzod.boolean()` | `z.boolean()` | ブール型 |
| `basic-bigint` | `myzod.bigint()` | `z.bigint()` | BigInt型 |
| `basic-undefined` | `myzod.undefined()` | `z.undefined()` | undefined型 |
| `basic-null` | `myzod.null()` | `z.null()` | null型 |
| `basic-unknown` | `myzod.unknown()` | `z.unknown()` | unknown型 |
| `basic-literal` | `myzod.literal('hello')` | `z.literal('hello')` | リテラル型 |
| `basic-literals` | `myzod.literals('red', 'green', 'blue')` | `z.union([z.literal('red'), z.literal('green'), z.literal('blue')])` | 複数リテラル |

### B. 複合型スキーマ（25ケース）

#### B1. オブジェクト型
| ケース名 | myzod | Zod v3 | 説明 |
|---------|--------|--------|------|
| `basic-object` | `myzod.object({ name: myzod.string() })` | `z.object({ name: z.string() })` | 基本オブジェクト |
| `object-pick` | `schema.pick(['name'])` | `schema.pick({ name: true })` | プロパティ選択 |
| `object-omit` | `schema.omit(['age'])` | `schema.omit({ age: true })` | プロパティ除外 |
| `object-partial` | `schema.partial()` | `schema.partial()` | 部分型 |
| `object-partial-deep` | `schema.partial({ deep: true })` | `schema.deepPartial()` | 深い部分型 |
| `object-allow-unknown` | `myzod.object({...}).allowUnknownKeys()` | `z.object({...}).passthrough()` | 未知キー許可 |
| `object-collect-errors` | `myzod.object({...}).collectErrors()` | `z.object({...})` | エラー収集（注記付き） |

#### B2. 配列型
| ケース名 | myzod | Zod v3 | 説明 |
|---------|--------|--------|------|
| `basic-array` | `myzod.array(myzod.string())` | `z.array(z.string())` | 基本配列 |
| `array-min-max` | `myzod.array(myzod.string()).min(1).max(10)` | `z.array(z.string()).min(1).max(10)` | 要素数制限 |
| `array-length` | `myzod.array(myzod.string()).length(5)` | `z.array(z.string()).length(5)` | 固定長 |
| `array-unique` | `myzod.array(myzod.string()).unique()` | `z.array(z.string())` | 重複排除（注記付き） |

#### B3. その他複合型
| ケース名 | myzod | Zod v3 | 説明 |
|---------|--------|--------|------|
| `basic-tuple` | `myzod.tuple([myzod.string(), myzod.number()])` | `z.tuple([z.string(), z.number()])` | タプル型 |
| `basic-union` | `myzod.union([myzod.string(), myzod.number()])` | `z.union([z.string(), z.number()])` | ユニオン型 |
| `basic-intersection` | `myzod.intersection(schemaA, schemaB)` | `z.intersection(schemaA, schemaB)` | 交差型 |
| `basic-record` | `myzod.record(myzod.string())` | `z.record(z.string())` | レコード型 |
| `basic-dictionary` | `myzod.dictionary(myzod.string())` | `z.record(z.string().optional())` | 辞書型 |
| `basic-enum` | `myzod.enum(MyEnum)` | `z.nativeEnum(MyEnum)` | Enum型 |
| `basic-date` | `myzod.date()` | `z.date()` | 日付型 |

### C. オプショナル・Null許可（8ケース）

| ケース名 | myzod | Zod v3 | 説明 |
|---------|--------|--------|------|
| `optional-basic` | `myzod.string().optional()` | `z.string().optional()` | オプショナル |
| `nullable-basic` | `myzod.string().nullable()` | `z.string().nullable()` | null許可 |
| `optional-with-default` | `myzod.string().optional().default('hello')` | `z.string().optional().default('hello')` | デフォルト付きオプショナル |
| `nullable-with-default` | `myzod.string().nullable().default('hello')` | `z.string().nullable().default('hello')` | デフォルト付きnull許可 |
| `required-from-optional` | `optionalSchema.required()` | `optionalSchema.unwrap()` | 必須化 |

### D. カスタムバリデーション（10ケース）

| ケース名 | myzod | Zod v3 | 説明 |
|---------|--------|--------|------|
| `predicate-string` | `myzod.string().withPredicate(s => s.length > 0, 'Not empty')` | `z.string().refine(s => s.length > 0, 'Not empty')` | 文字列述語 |
| `predicate-number` | `myzod.number().withPredicate(n => n % 2 === 0, 'Even')` | `z.number().refine(n => n % 2 === 0, 'Even')` | 数値述語 |
| `predicate-object` | `myzod.object({...}).withPredicate(obj => ...)` | `z.object({...}).refine(obj => ...)` | オブジェクト述語 |
| `multiple-predicates` | `myzod.string().withPredicate(...).withPredicate(...)` | `z.string().refine(...).refine(...)` | 複数述語 |

### E. 型変換・マッピング（12ケース）

| ケース名 | myzod | Zod v3 | 説明 |
|---------|--------|--------|------|
| `map-string-to-length` | `myzod.string().map(s => s.length)` | `z.string().transform(s => s.length)` | 文字列から長さ |
| `map-string-to-upper` | `myzod.string().map(s => s.toUpperCase())` | `z.string().transform(s => s.toUpperCase())` | 大文字変換 |
| `map-number-multiply` | `myzod.number().map(n => n * 2)` | `z.number().transform(n => n * 2)` | 数値変換 |
| `map-object-transform` | `myzod.object({...}).map(obj => {...})` | `z.object({...}).transform(obj => {...})` | オブジェクト変換 |

### F. 高度な機能（15ケース）

#### F1. 再帰型
| ケース名 | myzod | Zod v3 | 説明 |
|---------|--------|--------|------|
| `recursive-basic` | `myzod.lazy(() => schema)` | `z.lazy(() => schema)` | 基本再帰 |
| `recursive-tree` | Tree構造の再帰スキーマ | Tree構造の再帰スキーマ | ツリー構造 |

#### F2. 交差型
| ケース名 | myzod | Zod v3 | 説明 |
|---------|--------|--------|------|
| `intersection-objects` | `schemaA.and(schemaB)` | `z.intersection(schemaA, schemaB)` | オブジェクト交差 |
| `intersection-complex` | 複雑な交差型 | 複雑な交差型 | 複雑な交差 |

#### F3. 独自機能の変換
| ケース名 | myzod | Zod v3 | 説明 |
|---------|--------|--------|------|
| `dictionary-conversion` | `myzod.dictionary(myzod.string())` | `z.record(z.string().optional())` | 辞書型変換 |
| `collect-errors-note` | `schema.collectErrors()` | `schema` + 注記 | エラー収集機能 |
| `allow-unknown-keys` | `schema.allowUnknownKeys()` | `schema.passthrough()` | 未知キー許可 |

### G. エラーハンドリング（8ケース）

| ケース名 | myzod | Zod v3 | 説明 |
|---------|--------|--------|------|
| `parse-success` | `schema.parse(validData)` | `schema.parse(validData)` | 成功パース |
| `parse-error` | `schema.parse(invalidData)` | `schema.parse(invalidData)` | エラーパース |
| `try-success` | `schema.try(validData)` | `schema.safeParse(validData)` | 安全パース成功 |
| `try-error` | `schema.try(invalidData)` | `schema.safeParse(invalidData)` | 安全パースエラー |

## 実装方針

### 1. テストファイル生成
各テストケースごとに以下の構造で実装：

```typescript
// test/__scenarios__/basic-string/myzod.ts
import myzod from 'myzod'

export const schema = myzod.string()
export const validData = "hello world"
export const invalidData = 42
```

```typescript
// test/__scenarios__/basic-string/zodv3.ts
import { z } from 'zod'

export const schema = z.string()
export const validData = "hello world"
export const invalidData = 42
```

### 2. メインテストファイル
```typescript
// test/scenarios.ts
import { describe, expect, it } from 'vitest'

describe('myzod to zod conversion', () => {
  const testCases = [
    'basic-string',
    'basic-number',
    // ... 全てのケース
  ]
  
  testCases.forEach(testCase => {
    it(`should convert ${testCase}`, async () => {
      await runScenario(testCase)
    })
  })
})
```

### 3. 変換関数の実装
実際の変換ロジックを実装し、テストで検証：

```typescript
function convertMyzodToZodV3(myzodCode: string): string {
  // AST変換ロジック
  // ts-morphを使用してコード変換
}
```

## 注意事項と制限

### 1. 完全に対応できない機能
- **collectErrors()**: Zod v3にはエラー収集モードが存在しないため、注記で対応
- **dictionary()**: `record(schema.optional())`に変換
- **unique()**: Zod v3では標準実装なし、カスタムrefineで対応

### 2. APIの違い
- **pick/omit**: myzodは配列、Zod v3はオブジェクト形式
- **literals**: myzodの便利関数はZod v3のliteral + unionに展開
- **Infer**: myzodの`Infer<T>`はZod v3の`z.infer<typeof T>`に変換

### 3. パフォーマンス考慮
テスト実行時間を短縮するため：
- 大規模なテストデータは避ける
- 複雑な変換ロジックは段階的にテスト
- 並列実行可能な設計

## 期待される成果

このテスト設計により以下を達成：

1. **完全性**: myzodの全機能をカバー
2. **正確性**: 変換後のコードが期待通りに動作
3. **保守性**: 新機能追加時の影響範囲を明確化
4. **文書化**: 変換ルールの明文化

合計 **98個のテストケース**により、myzodからZod v3への包括的な変換テストを実現します。