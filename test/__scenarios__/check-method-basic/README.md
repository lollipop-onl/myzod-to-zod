# check-method-basic

## 概要

myzodの`.check()`メソッドをZod v3の`.safeParse().success`に自動変換するテストケース。

## 変換パターン

### 基本的な変換
```typescript
// Before
schema.check(data)

// After  
schema.safeParse(data).success
```

### 条件分岐での使用
```typescript
// Before
if (schema.check(data)) { ... }

// After
if (schema.safeParse(data).success) { ... }
```

## 技術的詳細

- **変換対象**: PropertyAccessExpression + CallExpression
- **AST変換**: `.check(args)` → `.safeParse(args).success`
- **戻り値**: boolean（変換前後で同じ）