# 基本タプルの変換テスト

## テスト目的

myzodの基本的なタプル型スキーマが正しくZod v3のタプル型スキーマに変換されることを検証します。

## 変換内容

### 変換前 (myzod)
```typescript
import myzod from 'myzod'
const schema = myzod.tuple([
  myzod.string(),
  myzod.number(),
  myzod.boolean()
])
```

### 変換後 (Zod v3)
```typescript
import { z } from 'zod'
const schema = z.tuple([
  z.string(),
  z.number(),
  z.boolean()
])
```

## 検証ポイント

1. **タプル型の変換**: `myzod.tuple()` → `z.tuple()`
2. **要素スキーマの変換**: 各位置の要素スキーマが正しく変換されること
3. **位置検証**: 指定された位置に正しい型の値があることの確認
4. **長さ検証**: タプルの要素数が正確であることの確認

## テストデータ

- **有効データ**: `["hello", 42, true]` - 正しい順序と型のタプル
- **無効データ**: `["hello", true, 42]` - 型の順序が間違ったタプル
- **無効データ**: `["hello", 42]` - 要素数が不足したタプル

このテストケースは、固定長で各位置に特定の型を持つタプルの変換を確認します。