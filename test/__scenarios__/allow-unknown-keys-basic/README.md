# allowUnknownKeys Basic Test Scenario

## 概要

myzodの`allowUnknownKeys()`メソッドをzodの`passthrough()`に変換するテストシナリオです。

## 変換パターン

### 基本パターン
```typescript
// myzod
myzod.object({}).allowUnknownKeys()

// zod
z.object({}).passthrough()
```

### チェーンパターン
```typescript
// myzod
myzod.object({}).allowUnknownKeys().optional()

// zod
z.object({}).passthrough().optional()
```

### ネストパターン
```typescript
// myzod
myzod.object({
  user: myzod.object({}).allowUnknownKeys()
})

// zod
z.object({
  user: z.object({}).passthrough()
})
```

## 動作

- myzodの`allowUnknownKeys()`は、オブジェクトで定義されていない追加のプロパティを許可する
- zodの`passthrough()`は同等の機能を提供する
- 両方とも、予期しないプロパティを検証エラーではなく通すことができる