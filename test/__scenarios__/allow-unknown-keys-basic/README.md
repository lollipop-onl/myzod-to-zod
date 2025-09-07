# allowUnknownKeys Basic Test Scenario

## 概要

myzodの`allowUnknownKeys()`メソッドをzodのデフォルト動作に変換するテストシナリオです。

## 変換パターン

### 基本パターン
```typescript
// myzod
myzod.object({}).allowUnknownKeys()

// zod (allowUnknownKeysメソッドは削除される)
z.object({})
```

### チェーンパターン
```typescript
// myzod
myzod.object({}).allowUnknownKeys().optional()

// zod
z.object({}).optional()
```

### ネストパターン
```typescript
// myzod
myzod.object({
  user: myzod.object({}).allowUnknownKeys()
})

// zod
z.object({
  user: z.object({})
})
```

## 動作

- myzodの`allowUnknownKeys()`は、未知のキーを許可するが結果からは削除する（strip動作）
- zodのデフォルト動作（`.strip()`）は同等の機能を提供する
- 両方とも、予期しないプロパティでエラーを投げずに、結果からは除外する