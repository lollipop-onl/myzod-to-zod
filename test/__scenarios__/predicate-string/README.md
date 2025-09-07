# 述語文字列の変換テスト

## テスト目的

myzodの`.withPredicate()`メソッドがZod v3の`.refine()`メソッドに正しく変換されることを検証します。

## 変換内容

### 変換前 (myzod)
```typescript
import myzod from 'myzod'
const schema = myzod.string().withPredicate(
  s => s.length > 3,
  'String must be longer than 3 characters'
)
```

### 変換後 (Zod v3)
```typescript
import { z } from 'zod'
const schema = z.string().refine(
  s => s.length > 3,
  'String must be longer than 3 characters'
)
```

## 検証ポイント

1. **メソッド名の変換**: `.withPredicate()` → `.refine()`
2. **引数の互換性**: 述語関数とエラーメッセージが正しく変換されること
3. **カスタムバリデーションの動作**: 両方のスキーマで同じ条件判定が行われること
4. **エラーメッセージの保持**: カスタムエラーメッセージが適切に変換されること

## テストデータ

- **有効データ**: `"hello"` - 3文字より長い文字列
- **無効データ**: `"hi"` - 3文字以下の文字列

このテストケースは、カスタムバリデーション機能の変換を確認する重要なパターンです。