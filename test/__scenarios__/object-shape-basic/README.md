# object-shape-basic

## 概要

`myzod.object().shape()` を `z.object().shape` に変換するテストケース。

## 変換パターン

```typescript
// myzod
const schema = myzod.object({
  name: myzod.string(),
  age: myzod.number()
});
const shape = schema.shape(); // ObjectShape を取得

// zod
const schema = z.object({
  name: z.string(),
  age: z.number()
});  
const shape = schema.shape; // ZodRawShape を取得（プロパティアクセス）
```

## 重要な違い

- myzod: `shape()` はメソッド呼び出し
- zod: `shape` はプロパティアクセス

この変換により、スキーマの形状を取得するAPIが統一されます。