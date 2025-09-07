# 基本交差型の変換テスト

## テスト目的

myzodの`intersection()`関数がZod v3の`z.intersection()`関数に正しく変換されることを検証します。

## 変換内容

### 変換前 (myzod)
```typescript
import myzod from 'myzod'
const schema = myzod.intersection(
  myzod.object({ name: myzod.string() }),
  myzod.object({ age: myzod.number() })
)
```

### 変換後 (Zod v3)
```typescript
import { z } from 'zod'
const schema = z.intersection(
  z.object({ name: z.string() }),
  z.object({ age: z.number() })
)
```

## 検証ポイント

1. **intersection関数の変換**: `myzod.intersection()` → `z.intersection()`
2. **交差スキーマの変換**: 交差される各スキーマが正しく変換されること
3. **プロパティマージ**: 両方のスキーマの要件を満たすオブジェクトを受け入れること
4. **部分的不一致の拒否**: いずれかのスキーマの要件を満たさないオブジェクトを拒否すること

## テストデータ

- **有効データ**: `{ name: "Alice", age: 30 }` - 両方のスキーマを満たすオブジェクト
- **無効データ**: `{ name: "Bob" }` - age プロパティが欠如
- **無効データ**: `{ age: 25 }` - name プロパティが欠如
- **無効データ**: `{ name: "Charlie", age: "not a number" }` - 型が無効

## 特記事項

交差型は複数のスキーマのすべての要件を同時に満たす必要がある型です。オブジェクトの場合、すべてのプロパティが必要になります。

## 実装ステータス

⏳ **未実装** - この高度な交差型変換は現在のAST変換エンジンでは対応していません。