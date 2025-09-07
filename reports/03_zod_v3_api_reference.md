# Zod v3 ライブラリ完全APIリファレンス

## 概要

**Zod**は、TypeScript-firstのスキーマ検証ライブラリ。静的型推論、ランタイム検証、豊富なAPIを提供し、TypeScriptエコシステムで広く採用されている。

### 主な特徴
- TypeScript-first設計
- ゼロ依存関係
- 豊富なバリデーション機能
- 非同期バリデーション対応
- 詳細なエラー情報

## 基本型スキーマ

### プリミティブ型
```typescript
z.string()      // 文字列型
z.number()      // 数値型
z.bigint()      // BigInt型
z.boolean()     // ブール型
z.date()        // Date型
z.symbol()      // Symbol型

// 特殊型
z.undefined()   // undefined型
z.null()        // null型
z.void()        // undefined または null
z.any()         // 任意の値
z.unknown()     // unknown型（anyより厳密）
z.never()       // 値を受け付けない型
```

### 文字列型の詳細メソッド
```typescript
z.string()
  .min(5)                    // 最小長
  .max(10)                   // 最大長
  .length(7)                 // 正確な長さ
  .email()                   // Eメール形式
  .url()                     // URL形式
  .uuid()                    // UUID形式
  .cuid()                    // CUID形式
  .regex(/pattern/)          // 正規表現
  .includes("substring")     // 部分文字列を含む
  .startsWith("prefix")      // 指定文字列で開始
  .endsWith("suffix")        // 指定文字列で終了
  .datetime()                // ISO日時形式
  .ip()                      // IP アドレス形式
  .trim()                    // 前後の空白を除去
  .toLowerCase()             // 小文字に変換
  .toUpperCase()             // 大文字に変換
```

### 数値型の詳細メソッド
```typescript
z.number()
  .min(0)                    // 最小値
  .max(100)                  // 最大値
  .gt(0)                     // より大きい
  .gte(0)                    // 以上
  .lt(100)                   // より小さい
  .lte(100)                  // 以下
  .int()                     // 整数のみ
  .positive()                // 正の数
  .negative()                // 負の数
  .nonnegative()            // 0以上
  .nonpositive()            // 0以下
  .multipleOf(5)            // 倍数
  .finite()                 // 有限数
  .safe()                   // 安全な整数範囲
```

### 日付型の詳細メソッド
```typescript
z.date()
  .min(new Date('2020-01-01'))  // 最小日付
  .max(new Date('2030-12-31'))  // 最大日付
```

## 複合型スキーマ

### object()
```typescript
z.object({
  name: z.string(),
  age: z.number()
})

// オブジェクトメソッド
.pick({ name: true })              // プロパティの選択
.omit({ age: true })               // プロパティの除外
.partial()                         // すべてのプロパティをオプショナルに
.required()                        // すべてのプロパティを必須に
.extend({ email: z.string() })     // オブジェクトスキーマの拡張
.merge(otherSchema)                // オブジェクトスキーマの結合
.keyof()                          // オブジェクトのキーの型

// 未知のキーの処理
.strict()                          // 未知のキーを許可しない
.strip()                           // 未知のキーを削除（デフォルト）
.passthrough()                     // 未知のキーを通す
.catchall(z.string())             // 未知のキーに型を指定
```

### array()
```typescript
z.array(z.string())        // 文字列配列
z.string().array()         // 同上（別記法）

// 配列メソッド
.min(1)                    // 最小要素数
.max(10)                   // 最大要素数
.length(5)                 // 正確な要素数
.nonempty()               // 空でない配列
```

### その他の複合型
```typescript
// タプル型
z.tuple([z.string(), z.number()])

// ユニオン型（複数型の選択）
z.union([z.string(), z.number()])

// 交差型（複数型の結合）
z.intersection(
  z.object({ name: z.string() }),
  z.object({ age: z.number() })
)

// 判別共用体（Discriminated Union）
z.discriminatedUnion("type", [
  z.object({ type: z.literal("user"), username: z.string() }),
  z.object({ type: z.literal("admin"), permissions: z.array(z.string()) })
])

// レコード型
z.record(z.string())               // { [key: string]: string }
z.record(z.string(), z.number())   // { [key: string]: number }

// マップ型
z.map(z.string(), z.number())

// セット型
z.set(z.string())

// 関数型
z.function()
z.function().args(z.string()).returns(z.number())

// Promise型
z.promise(z.string())

// Enum型
z.enum(['red', 'green', 'blue'])
z.nativeEnum(MyEnum)

// リテラル型
z.literal("hello")
z.literal(42)
```

## バリデーションメソッド

### 同期バリデーション
```typescript
// エラーを投げる
const result = schema.parse(data)

// Result型を返す
const result = schema.safeParse(data)
if (result.success) {
  console.log(result.data)   // パースされたデータ
} else {
  console.log(result.error)  // ZodError
}
```

### 非同期バリデーション
```typescript
// エラーを投げる
const result = await schema.parseAsync(data)

// Result型を返す
const result = await schema.safeParseAsync(data)
```

### 部分パース
```typescript
const result = schema.deepPartial().parse(data)  // ネストしたオプショナル
```

## 型変換・マッピング機能

### transform
```typescript
// transform - データの変換
const StringToNumber = z.string().transform((val) => parseInt(val))

// 複雑な変換
const userTransformSchema = z.object({
  first_name: z.string(),
  last_name: z.string()
}).transform(user => ({
  fullName: `${user.first_name} ${user.last_name}`
}))
```

### preprocess
```typescript
// preprocess - 前処理
const TrimmedString = z.preprocess(
  (val) => typeof val === 'string' ? val.trim() : val,
  z.string()
)
```

### coerce
```typescript
// coerce - 型強制
z.coerce.string()     // 文字列に変換
z.coerce.number()     // 数値に変換
z.coerce.boolean()    // ブール値に変換
z.coerce.date()       // Dateに変換

// 例
const num = z.coerce.number().parse('42') // 42 (number)
```

### pipe
```typescript
// pipe - パイプライン
const NumberString = z.string().pipe(z.coerce.number())
```

## オプショナル・null許可

```typescript
// オプショナル（undefinedを許可）
z.string().optional()
z.optional(z.string())

// nullable（nullを許可）
z.string().nullable()
z.nullable(z.string())

// nullish（null | undefinedを許可）
z.string().nullish()

// オプショナルのデフォルト値付き
z.string().optional().default("default value")
```

## デフォルト値設定

```typescript
// デフォルト値
z.string().default("hello")
z.number().default(42)
z.boolean().default(true)
z.date().default(() => new Date())  // 関数も使用可能

// catch - エラー時のフォールバック値
z.string().catch("fallback")
```

## カスタムバリデーション

### refine
```typescript
// refine - カスタム検証ルール
z.string().refine((val) => val.length > 0, {
  message: "文字列は空であってはいけません"
})

// 複数のrefine
z.number()
  .refine((n) => n >= 0, "正の数である必要があります")
  .refine((n) => n % 2 === 0, "偶数である必要があります")

// 非同期refine
z.string().refine(async (val) => {
  const exists = await checkExists(val)
  return exists
}, "値が存在しません")
```

### superRefine
```typescript
// superRefine - より高度なカスタム検証
z.string().superRefine((val, ctx) => {
  if (val.length < 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      minimum: 3,
      type: "string",
      inclusive: true,
      message: "3文字以上である必要があります"
    })
  }
})
```

## エラーハンドリング

### ZodError の構造
```typescript
interface ZodError {
  issues: ZodIssue[]
  format(): ZodFormattedError
  flatten(): ZodFlattenedError
  message: string
}

// エラーの詳細
interface ZodIssue {
  code: ZodIssueCode
  path: (string | number)[]
  message: string
  expected?: any
  received?: any
}
```

### カスタムエラーメッセージ
```typescript
z.string().min(5, { message: "5文字以上入力してください" })

// エラーマップの設定
z.setErrorMap((issue, ctx) => {
  return { message: "カスタムエラーメッセージ" }
})
```

## 独自機能・特殊なAPI

### ブランド型
```typescript
const UserId = z.string().brand<"UserId">()
type UserId = z.infer<typeof UserId>  // string & Brand<"UserId">
```

### readonly
```typescript
z.object({ name: z.string() }).readonly()
```

### 再帰型
```typescript
interface Category {
  name: string
  subcategories: Category[]
}

const CategorySchema: z.ZodType<Category> = z.lazy(() => 
  z.object({
    name: z.string(),
    subcategories: z.array(CategorySchema)
  })
)
```

## 型推論に関する機能

### 基本的な型推論
```typescript
const UserSchema = z.object({
  name: z.string(),
  age: z.number()
})

type User = z.infer<typeof UserSchema>  // { name: string; age: number }
```

### 入力型・出力型の推論
```typescript
// 入力型の推論
type UserInput = z.input<typeof UserSchema>

// 出力型の推論（transformした後の型）
const TransformedSchema = z.string().transform(s => s.length)
type Output = z.output<typeof TransformedSchema>  // number
```

### 複雑な型の推論
```typescript
const ComplexSchema = z.object({
  users: z.array(z.object({
    name: z.string(),
    settings: z.object({
      theme: z.enum(['light', 'dark']).optional()
    }).optional()
  }))
})

type ComplexType = z.infer<typeof ComplexSchema>
```

## myzodとの主な違い

### API設計
- **Zod**: 関数型アプローチ（`z.string()`）
- **myzod**: オブジェクト指向アプローチ（`mz.string()`）

### 型推論
- **Zod**: `z.infer<typeof schema>`
- **myzod**: `Infer<typeof schema>`

### エラーハンドリング
- **Zod**: 詳細なZodErrorクラス、safeParseでResult型
- **myzod**: 軽量なValidationError、tryで直接エラーオブジェクト

### 変換機能
- **Zod**: transform/preprocess/coerce/pipeが豊富
- **myzod**: mapが中心、より限定的

### 非同期対応
- **Zod**: parseAsync/safeParseAsync/非同期refine
- **myzod**: 基本的に同期のみ

### メソッドチェーン
- **Zod**: より多くのビルトインバリデーション（email, url, uuid等）
- **myzod**: 基本的なバリデーション + withPredicate

### 独自機能
- **Zod**: ブランド型、判別共用体、詳細なオブジェクト操作
- **myzod**: dictionary、collectErrors、allowUnknownKeys

---
*Zod v3の全機能を網羅した完全APIリファレンス*