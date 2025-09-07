# myzod ライブラリ完全APIリファレンス

## 概要

**myzod**は、TypeScript型推論を備えたスキーマ検証ライブラリ。zodにインスパイアされながらも、TypeScriptの型システムをより忠実にエミュレートし、約25倍高速なパフォーマンスを提供。

### 主な特徴
- TypeScript型推論サポート
- zodの約25倍、joiの約6倍のパフォーマンス
- TypeScriptの`&`（交差）と`|`（ユニオン）演算子のサポート
- Record、Pick、Omitなどの汎用型サポート
- 豊富なバリデーション機能

## 基本型スキーマ

### string()
```typescript
myzod.string(opts?: StringOptions): StringType

// オプション
type StringOptions = {
  min?: number;           // 最小文字数
  max?: number;           // 最大文字数
  pattern?: RegExp;       // 正規表現パターン
  valid?: string[];       // 有効な文字列の配列
  predicate?: Predicate<string>; // カスタム検証関数
  default?: string | (() => string); // デフォルト値
}

// メソッドチェーン
.min(value: number, errMsg?: string)
.max(value: number, errMsg?: string)
.pattern(regexp: RegExp, errMsg?: string)
.valid(list: string[], errMsg?: string)
.withPredicate(fn: (val: string) => boolean, errMsg?: string)
.default(value: string | (() => string))
```

### number()
```typescript
myzod.number(opts?: NumberOptions): NumberType

// オプション
type NumberOptions = {
  min?: number;           // 最小値
  max?: number;           // 最大値
  coerce?: boolean;       // 文字列から数値への強制変換
  predicate?: Predicate<number>; // カスタム検証関数
  default?: number | (() => number); // デフォルト値
}

// メソッドチェーン
.min(value: number, errMsg?: string)
.max(value: number, errMsg?: string)
.coerce(flag?: boolean)
.withPredicate(fn: (value: number) => boolean, errMsg?: string)
.default(value: number | (() => number))
```

### boolean()
```typescript
myzod.boolean(): BooleanType

// メソッドチェーン
.default(value: boolean | (() => boolean))
```

### その他の基本型
```typescript
myzod.bigint(opts?: BigIntOptions): BigIntType
myzod.undefined(): UndefinedType
myzod.null(): NullType
myzod.unknown(): UnknownType
myzod.literal<T>(literal: T): LiteralType<T>
myzod.literals('red', 'green', 'blue'): UnionType // 複数リテラルのユニオン
```

## 複合型スキーマ

### object()
```typescript
myzod.object<T>(shape: T, opts?: ObjectOptions<T>): ObjectType<T>

// オプション
type ObjectOptions<T> = {
  allowUnknown?: boolean;  // 未定義のキーを許可
  predicate?: Predicate<InferObjectShape<T>>; // オブジェクト全体のカスタム検証
  default?: InferObjectShape<T> | (() => InferObjectShape<T>); // デフォルト値
  collectErrors?: boolean; // 全てのエラーを収集
}

// メソッドチェーン
.pick<K>(keys: K[])                    // 特定のキーのみを選択
.omit<K>(keys: K[])                    // 特定のキーを除外
.partial(opts?: { deep?: boolean })    // 全フィールドをオプションに
.shape()                               // オブジェクトの形状を取得
.withPredicate(fn, errMsg?)           // オブジェクト全体のカスタム検証を追加
.default(value)                        // デフォルト値を設定
.collectErrors(value?: boolean)        // エラー収集モードを設定
.allowUnknownKeys(value?: boolean)     // 未知のキーを許可
```

### array()
```typescript
myzod.array<T>(schema: T, opts?: ArrayOptions<T>): ArrayType<T>

// オプション
type ArrayOptions<T> = {
  length?: number;        // 配列の長さ
  min?: number;          // 最小長
  max?: number;          // 最大長
  unique?: boolean;      // 重複を許可しない
  predicate?: Predicate<Infer<T>[]>; // カスタム検証
  default?: Infer<T>[] | (() => Infer<T>[]); // デフォルト値
  coerce?: (value: string) => Infer<T>[]; // 文字列から配列への変換
}

// メソッドチェーン
.length(value: number, errMsg?: string)
.min(value: number, errMsg?: string)
.max(value: number, errMsg?: string)
.unique()
.withPredicate(fn, errMsg?)
.default(value)
.coerce(fn)
```

### その他の複合型
```typescript
myzod.tuple<T>(schemas: T): TupleType<T>
myzod.union<T>(schemas: T, opts?: UnionOptions<T>): UnionType<T>
myzod.intersection<T, K>(l: T, r: K): IntersectionResult<T, K>
myzod.record<T>(schema: T): ObjectType<{ [keySignature]: T }>
myzod.dictionary<T>(schema: T): ObjectType<{ [keySignature]: OptionalType<T> }>
myzod.enum<T>(enumObject: T, opts?: EnumOptions<T>): EnumType<T>
myzod.date(): DateType
myzod.lazy<T>(fn: () => T): LazyType<T>
```

## バリデーションメソッド

### parse()
```typescript
parse(value: unknown): T
// 値を検証し、成功時は型付きの値を返し、失敗時はValidationErrorをスロー
```

### try()
```typescript
try(value: unknown): T | ValidationError
// 値を検証し、成功時は値を、失敗時はValidationErrorインスタンスを返す（例外なし）
```

## 型変換・マッピング機能

### map()
```typescript
map<K>(fn: (value: T) => K): MappedType<K>
// 検証後に値を変換するマッピング機能

// 例
const stringToLengthSchema = myzod.string().map(s => s.length)
const length = stringToLengthSchema.parse('hello') // 5
```

### coerce()
```typescript
// 型強制変換機能（数値とBigIntで利用可能）
const numberSchema = myzod.number().coerce()
const num = numberSchema.parse('42') // 42 (number)
```

## オプショナル・null許可

```typescript
.optional()     // T | undefined
.nullable()     // T | null
.required()     // Optional/Nullableを除去
```

## カスタムバリデーション

### withPredicate()
```typescript
withPredicate(fn: (value: T) => boolean, errMsg?: string | ((value: T) => string)): this

// 例
const evenNumberSchema = myzod.number()
  .withPredicate(n => n % 2 === 0, 'Must be even number')

const strongPasswordSchema = myzod.string()
  .min(8)
  .withPredicate(password => /[A-Z]/.test(password), 'Must contain uppercase')
  .withPredicate(password => /[a-z]/.test(password), 'Must contain lowercase')
  .withPredicate(password => /\d/.test(password), 'Must contain digit')
```

## エラーハンドリング

### ValidationError
```typescript
class ValidationError extends Error {
  name: string;
  path?: (string | number)[];  // エラーのパス
  collectedErrors?: Record<string, ValidationError>; // 収集されたエラー
}

// 使用例
try {
  schema.parse(data)
} catch (error) {
  if (error instanceof myzod.ValidationError) {
    console.log('Error path:', error.path)
  }
}
```

## ユーティリティ関数

```typescript
// 部分型
myzod.partial<T>(schema: T, opts?: { deep?: boolean }): ObjectType<PartialShape<T>>

// プロパティ選択
myzod.pick<T, K>(schema: T, keys: K[]): ObjectType<Pick<T, K>>

// プロパティ除外
myzod.omit<T, K>(schema: T, keys: K[]): ObjectType<Omit<T, K>>
```

## 型推論

### Infer<T>
```typescript
type Infer<T> = T extends Type<infer K> ? K : any

// 使用例
const userSchema = myzod.object({
  id: myzod.string(),
  name: myzod.string(),
  age: myzod.number().optional()
})

type User = Infer<typeof userSchema>
// { id: string; name: string; age?: number | undefined }
```

## 高度な機能

### 再帰型
```typescript
type Person = {
  name: string;
  friends: Person[];
};

const personSchema: myzod.Type<Person> = myzod.object({
  name: myzod.string(),
  friends: myzod.array(myzod.lazy(() => personSchema))
})
```

### インターセクション
```typescript
const baseSchema = myzod.object({ id: myzod.string() })
const nameSchema = myzod.object({ name: myzod.string() })

const fullSchema = baseSchema.and(nameSchema)
// または
const fullSchema = myzod.intersection(baseSchema, nameSchema)
```

### 独自機能

#### dictionary()
```typescript
const optionalStringMapSchema = myzod.dictionary(myzod.string())
// 以下と同等
const equivalentSchema = myzod.record(myzod.string().optional())
```

#### collectErrors() 
```typescript
const schema = myzod.object({
  name: myzod.string(),
  email: myzod.string()
}).collectErrors()
// 全フィールドのエラーを収集
```

#### allowUnknownKeys()
```typescript
const flexibleSchema = myzod.object({
  required: myzod.string()
}).allowUnknownKeys()
// 未定義のキーを許可
```

---
*myzodの全機能を網羅した完全APIリファレンス*