# 基本配列の変換テスト

## テスト目的

myzodの基本的な配列スキーマが正しくZod v3の配列スキーマに変換されることを検証します。

## 変換内容

### 変換前 (myzod)
```typescript
import myzod from 'myzod'
const schema = myzod.array(myzod.string())
```

### 変換後 (Zod v3)
```typescript
import { z } from 'zod'
const schema = z.array(z.string())
```

## 検証ポイント

1. **配列型の変換**: `myzod.array()` → `z.array()`
2. **要素スキーマの変換**: 配列要素のスキーマが正しく変換されること
3. **配列バリデーション**: すべての要素が指定された型であることの確認
4. **型エラーの一致**: 無効な要素が含まれた配列に対して適切にエラーを返すこと

## テストデータ

- **有効データ**: `["hello", "world"]` - 文字列要素の配列
- **無効データ**: `["hello", 42]` - 異なる型が混在した配列

このテストケースは、同質な要素からなる配列の変換パターンを確認します。