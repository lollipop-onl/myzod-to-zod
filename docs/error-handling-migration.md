# エラーハンドリング移行ガイド

## 概要

myzodとZod v3では、エラーハンドリングのアプローチが根本的に異なる。このドキュメントでは、myzodの`ValidationError`と`try`メソッドをZod v3で置き換える具体的な方法を示す。

## 基本的なエラーハンドリングパターン

### 1. 基本的な検証とエラーハンドリング

#### myzod
```typescript
import myzod from 'myzod';

const schema = myzod.string().min(3);

// try()を使用したエラーハンドリング
const result = schema.try('ab');
if (result instanceof myzod.ValidationError) {
  console.log('エラー:', result.message);
  console.log('パス:', result.path);
} else {
  console.log('成功:', result);
}
```

#### Zod v3での置き換え
```typescript
import { z } from 'zod';

const schema = z.string().min(3);

// safeParse()を使用したエラーハンドリング
const result = schema.safeParse('ab');
if (!result.success) {
  console.log('エラー:', result.error.message);
  console.log('パス:', result.error.issues[0]?.path);
} else {
  console.log('成功:', result.data);
}
```

### 2. 例外を投げる場合

#### myzod
```typescript
try {
  const value = schema.parse('ab');
  console.log('成功:', value);
} catch (error) {
  if (error instanceof myzod.ValidationError) {
    console.log('エラー:', error.message);
  }
}
```

#### Zod v3での置き換え
```typescript
try {
  const value = schema.parse('ab');
  console.log('成功:', value);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log('エラー:', error.message);
  }
}
```

## 複雑なオブジェクト検証

### オブジェクトスキーマでのエラーハンドリング

#### myzod
```typescript
const userSchema = myzod.object({
  name: myzod.string().min(1),
  email: myzod.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: myzod.number().min(0).max(150)
}).collectErrors();

const invalidUser = {
  name: '',
  email: 'invalid-email',
  age: -5
};

const result = userSchema.try(invalidUser);
if (result instanceof myzod.ValidationError) {
  console.log('検証エラー:');
  
  // 収集されたエラーを処理
  if (result.collectedErrors) {
    Object.entries(result.collectedErrors).forEach(([field, error]) => {
      console.log(`- ${field}: ${error.message}`);
    });
  }
}
```

#### Zod v3での置き換え
```typescript
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: z.number().min(0).max(150)
});

const invalidUser = {
  name: '',
  email: 'invalid-email',
  age: -5
};

const result = userSchema.safeParse(invalidUser);
if (!result.success) {
  console.log('検証エラー:');
  
  // すべてのエラーを処理（Zodは標準で全エラーを収集）
  result.error.issues.forEach(issue => {
    const field = issue.path.join('.');
    console.log(`- ${field}: ${issue.message}`);
  });
}
```

## カスタムエラーメッセージの処理

### カスタム検証でのエラーハンドリング

#### myzod
```typescript
const passwordSchema = myzod.string()
  .min(8, '8文字以上である必要があります')
  .withPredicate(
    password => /[A-Z]/.test(password),
    '大文字を含む必要があります'
  )
  .withPredicate(
    password => /[a-z]/.test(password),
    '小文字を含む必要があります'
  )
  .withPredicate(
    password => /\d/.test(password),
    '数字を含む必要があります'
  );

const result = passwordSchema.try('weak');
if (result instanceof myzod.ValidationError) {
  console.log('パスワードエラー:', result.message);
}
```

#### Zod v3での置き換え
```typescript
const passwordSchema = z.string()
  .min(8, { message: '8文字以上である必要があります' })
  .refine(
    password => /[A-Z]/.test(password),
    { message: '大文字を含む必要があります' }
  )
  .refine(
    password => /[a-z]/.test(password),
    { message: '小文字を含む必要があります' }
  )
  .refine(
    password => /\d/.test(password),
    { message: '数字を含む必要があります' }
  );

const result = passwordSchema.safeParse('weak');
if (!result.success) {
  // 最初のエラーメッセージを表示
  console.log('パスワードエラー:', result.error.issues[0]?.message);
  
  // または、すべてのエラーメッセージを表示
  result.error.issues.forEach(issue => {
    console.log('エラー:', issue.message);
  });
}
```

## ネストしたオブジェクトのエラーハンドリング

### 深くネストしたデータ構造

#### myzod
```typescript
const nestedSchema = myzod.object({
  user: myzod.object({
    profile: myzod.object({
      name: myzod.string().min(1),
      contacts: myzod.array(
        myzod.object({
          type: myzod.string(),
          value: myzod.string().min(1)
        })
      )
    })
  })
});

const invalidData = {
  user: {
    profile: {
      name: '',
      contacts: [
        { type: 'email', value: '' }
      ]
    }
  }
};

const result = nestedSchema.try(invalidData);
if (result instanceof myzod.ValidationError) {
  console.log('エラーパス:', result.path);
  console.log('エラーメッセージ:', result.message);
}
```

#### Zod v3での置き換え
```typescript
const nestedSchema = z.object({
  user: z.object({
    profile: z.object({
      name: z.string().min(1),
      contacts: z.array(
        z.object({
          type: z.string(),
          value: z.string().min(1)
        })
      )
    })
  })
});

const invalidData = {
  user: {
    profile: {
      name: '',
      contacts: [
        { type: 'email', value: '' }
      ]
    }
  }
};

const result = nestedSchema.safeParse(invalidData);
if (!result.success) {
  result.error.issues.forEach(issue => {
    console.log('エラーパス:', issue.path.join('.'));
    console.log('エラーメッセージ:', issue.message);
  });
}
```

## 実用的なユーティリティ関数

### エラーハンドリングのヘルパー関数

#### myzodスタイルのヘルパー
```typescript
// myzodの try() のような動作を模倣するヘルパー
export function tryParse<T>(schema: z.ZodSchema<T>, data: unknown): T | z.ZodError {
  const result = schema.safeParse(data);
  return result.success ? result.data : result.error;
}

// 使用例
const schema = z.string().min(3);
const result = tryParse(schema, 'ab');

if (result instanceof z.ZodError) {
  console.log('エラー:', result.message);
} else {
  console.log('成功:', result);
}
```

#### ZodErrorをmyzod ValidationErrorインターフェースに変換

```typescript
// myzod ValidationError互換インターフェース
interface MyzodCompatibleError extends Error {
  name: string;
  message: string;
  path?: (string | number)[];
  collectedErrors?: Record<string, MyzodCompatibleError>;
}

// ZodErrorをmyzod ValidationError形式に変換
export function convertToMyzodError(zodError: z.ZodError): MyzodCompatibleError {
  const firstIssue = zodError.issues[0];
  
  const error: MyzodCompatibleError = {
    name: 'ValidationError',
    message: firstIssue?.message || 'Validation failed',
    path: firstIssue?.path,
  };
  
  // 複数のエラーがある場合は collectedErrors として格納
  if (zodError.issues.length > 1) {
    error.collectedErrors = {};
    
    zodError.issues.forEach((issue, index) => {
      const fieldPath = issue.path.join('.') || `error_${index}`;
      error.collectedErrors![fieldPath] = {
        name: 'ValidationError',
        message: issue.message,
        path: issue.path,
      } as MyzodCompatibleError;
    });
  }
  
  return error;
}

// myzod互換のtryパース関数
export function tryParseCompatible<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): T | MyzodCompatibleError {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return convertToMyzodError(result.error);
  }
  
  return result.data;
}

// 使用例 - myzodコードとほぼ同じ書き方が可能
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0)
});

const result = tryParseCompatible(userSchema, {
  name: '',
  email: 'invalid-email',
  age: -1
});

// myzodと同じようにエラーチェック
if ('name' in result && result.name === 'ValidationError') {
  console.log('検証エラー:', result.message);
  console.log('エラーパス:', result.path);
  
  // 複数エラーの処理
  if (result.collectedErrors) {
    Object.entries(result.collectedErrors).forEach(([field, error]) => {
      console.log(`- ${field}: ${error.message}`);
    });
  }
} else {
  console.log('成功:', result);
}
```

#### ValidationErrorクラスの完全な再現

```typescript
// myzod ValidationErrorクラスの完全な再現
export class ValidationError extends Error {
  public name = 'ValidationError';
  public path?: (string | number)[];
  public collectedErrors?: Record<string, ValidationError>;
  
  constructor(
    message: string, 
    path?: (string | number)[], 
    collectedErrors?: Record<string, ValidationError>
  ) {
    super(message);
    this.path = path;
    this.collectedErrors = collectedErrors;
  }
  
  // ZodErrorから ValidationError インスタンスを作成
  static fromZodError(zodError: z.ZodError): ValidationError {
    const firstIssue = zodError.issues[0];
    const message = firstIssue?.message || 'Validation failed';
    const path = firstIssue?.path;
    
    let collectedErrors: Record<string, ValidationError> | undefined;
    
    // 複数のエラーがある場合
    if (zodError.issues.length > 1) {
      collectedErrors = {};
      
      zodError.issues.forEach((issue, index) => {
        const fieldPath = issue.path.join('.') || `error_${index}`;
        collectedErrors![fieldPath] = new ValidationError(
          issue.message,
          issue.path
        );
      });
    }
    
    return new ValidationError(message, path, collectedErrors);
  }
}

// 完全にmyzod互換のtryパース関数
export function tryParseMyzod<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): T | ValidationError {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return ValidationError.fromZodError(result.error);
  }
  
  return result.data;
}

// 使用例 - myzodのコードをそのまま使用可能
const result2 = tryParseMyzod(userSchema, {
  name: '',
  email: 'invalid-email'
});

if (result2 instanceof ValidationError) {
  console.log('エラー:', result2.message);
  console.log('パス:', result2.path);
  
  // myzodと同じ方法で複数エラーを処理
  if (result2.collectedErrors) {
    Object.entries(result2.collectedErrors).forEach(([field, error]) => {
      console.log(`フィールドエラー ${field}:`, error.message);
      console.log(`パス:`, error.path);
    });
  }
} else {
  console.log('検証成功:', result2);
}
```

#### 既存myzodコードの最小限変更での移行

```typescript
// 既存のmyzodコードを最小限の変更で移行
// 元のmyzodコード:
// const result = myzodSchema.try(data);
// if (result instanceof myzod.ValidationError) { ... }

// 移行後 - インポートとスキーマ定義のみ変更
import { z } from 'zod';
import { tryParseMyzod, ValidationError } from './validation-utils';

// スキーマはcodemodで自動変換済み
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});

// この部分は変更不要！
const result = tryParseMyzod(schema, data);
if (result instanceof ValidationError) {
  console.log('エラー:', result.message);
  console.log('パス:', result.path);
  
  if (result.collectedErrors) {
    Object.entries(result.collectedErrors).forEach(([field, error]) => {
      console.log(`- ${field}: ${error.message}`);
    });
  }
} else {
  console.log('成功:', result);
}
```

#### フィールド別エラー取得ヘルパー
```typescript
// フィールド別のエラーメッセージを取得
export function getFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  
  error.issues.forEach(issue => {
    const path = issue.path.join('.');
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  });
  
  return fieldErrors;
}

// 使用例
const result = userSchema.safeParse(invalidUser);
if (!result.success) {
  const fieldErrors = getFieldErrors(result.error);
  
  Object.entries(fieldErrors).forEach(([field, messages]) => {
    console.log(`${field}:`, messages.join(', '));
  });
}
```

## 非同期検証でのエラーハンドリング

### 非同期バリデーション（Zod v3の追加機能）

```typescript
// myzodでは基本的に同期のみだが、Zodでは非同期検証が可能
const asyncSchema = z.string().refine(async (email) => {
  // 外部APIでメールアドレスの存在確認
  const exists = await checkEmailExists(email);
  return exists;
}, {
  message: 'このメールアドレスは存在しません'
});

// 非同期検証の使用
async function validateEmail(email: string) {
  const result = await asyncSchema.safeParseAsync(email);
  
  if (!result.success) {
    console.log('非同期検証エラー:', result.error.issues[0]?.message);
    return false;
  }
  
  console.log('検証成功:', result.data);
  return true;
}

async function checkEmailExists(email: string): Promise<boolean> {
  // 実際のAPI呼び出し
  return true; // プレースホルダー
}
```

## パフォーマンス最適化

### 早期リターン戦略

```typescript
// myzod風の早期エラーリターン
export function parseOrError<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    // 最初のエラーのみを返す（パフォーマンス重視）
    return {
      success: false,
      error: result.error.issues[0]?.message || '検証エラー'
    };
  }
  
  return { success: true, data: result.data };
}

// 使用例
const result = parseOrError(z.string().min(3), 'ab');
if (!result.success) {
  console.log('エラー:', result.error);
} else {
  console.log('データ:', result.data);
}
```

## 移行チェックリスト

### myzod → Zod v3 エラーハンドリング移行手順

#### オプション1: 標準的なZod移行（推奨）

1. **`schema.try()`** → **`schema.safeParse()`**
   - 戻り値の構造変更に対応
   - `instanceof ValidationError` → `!result.success`

2. **`error.message`** → **`error.error.message`** または **`error.error.issues[0]?.message`**
   - エラーメッセージアクセス方法の変更

3. **`error.path`** → **`error.error.issues[0]?.path`**
   - エラーパス取得方法の変更

4. **`collectErrors()`** → **標準動作**
   - Zodはデフォルトで全エラーを収集

5. **カスタムエラーメッセージ**
   - `.withPredicate(fn, msg)` → `.refine(fn, { message: msg })`

6. **非同期検証**（Zodの追加機能）
   - `safeParseAsync()`を活用

#### オプション2: myzod互換ユーティリティ使用（最小限変更）

1. **ユーティリティファイルの作成**
   ```typescript
   // validation-utils.ts
   import { z } from 'zod';
   
   export class ValidationError extends Error {
     // 上記のValidationErrorクラスをコピー
   }
   
   export function tryParseMyzod<T>(schema: z.ZodSchema<T>, data: unknown): T | ValidationError {
     // 上記の関数をコピー
   }
   ```

2. **インポートの変更のみ**
   ```typescript
   // Before
   import myzod, { ValidationError } from 'myzod';
   
   // After
   import { z } from 'zod';
   import { tryParseMyzod as try, ValidationError } from './validation-utils';
   
   // スキーマ定義はcodemodで自動変換
   // エラーハンドリングコードは変更不要！
   ```

3. **既存のエラーハンドリングコードを保持**
   - `schema.try()` → `tryParseMyzod(schema, data)`に一括置換
   - `instanceof ValidationError`チェックはそのまま使用可能
   - `error.path`、`error.collectedErrors`もそのまま使用可能

#### 移行戦略の選択指針

**標準Zod移行を選ぶべき場合:**
- 新規プロジェクトまたは小規模なエラーハンドリング
- Zodの豊富な機能（非同期検証など）を活用したい
- 長期的な保守性を重視する

**myzod互換ユーティリティを選ぶべき場合:**
- 大規模なコードベースで多くのエラーハンドリングコードがある
- 短期間での移行が必要
- 既存のエラーハンドリングロジックを変更したくない

## まとめ

myzodの`ValidationError`と`try`メソッドは、Zod v3の`safeParse`と`ZodError`で完全に置き換え可能である。Zodはより詳細なエラー情報と非同期検証をサポートしており、myzodの機能を上回る柔軟性を提供する。

提供されたヘルパー関数を使用することで、既存のmyzodコードパターンをZodで再現できる。