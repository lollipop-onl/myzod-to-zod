# 基本オブジェクトの変換テスト

## テスト目的

myzodの基本的なオブジェクトスキーマが正しくZod v3のオブジェクトスキーマに変換されることを検証します。

## 変換内容

### 変換前 (myzod)
```typescript
import myzod from 'myzod'
const schema = myzod.object({
  name: myzod.string(),
  age: myzod.number()
})
```

### 変換後 (Zod v3)
```typescript
import { z } from 'zod'
const schema = z.object({
  name: z.string(),
  age: z.number()
})
```

## 検証ポイント

1. **オブジェクト型の変換**: `myzod.object()` → `z.object()`
2. **ネストしたスキーマの変換**: オブジェクト内の各プロパティスキーマが正しく変換されること
3. **プロパティ検証**: 必要なプロパティが存在することの確認
4. **型エラーの一致**: 無効なオブジェクト構造に対して適切にエラーを返すこと

## テストデータ

- **有効データ**: `{ name: "Alice", age: 30 }` - 正しい構造のオブジェクト
- **無効データ**: `{ name: "Bob" }` - ageプロパティが欠如したオブジェクト

このテストケースは、構造化データの基本的な変換パターンを確認します。