# 複数リテラルの変換テスト

## テスト目的

myzodの`literals()`関数がZod v3の`z.union([z.literal(), ...])`形式に正しく変換されることを検証します。

## 変換内容

### 変換前 (myzod)
```typescript
import myzod from 'myzod'
const schema = myzod.literals('red', 'green', 'blue')
```

### 変換後 (Zod v3)
```typescript
import { z } from 'zod'
const schema = z.union([
  z.literal('red'),
  z.literal('green'),
  z.literal('blue')
])
```

## 検証ポイント

1. **便利関数の展開**: `myzod.literals()` → `z.union([z.literal(), ...])`
2. **リテラル値の保持**: すべてのリテラル値が正しく変換されること
3. **選択肢の検証**: 指定されたリテラル値のいずれかを受け入れること
4. **範囲外値の拒否**: 指定されていない値を拒否すること

## テストデータ

- **有効データ**: `'red'` - 指定されたリテラル値の一つ
- **有効データ**: `'green'` - 指定されたリテラル値の一つ
- **有効データ**: `'blue'` - 指定されたリテラル値の一つ
- **無効データ**: `'yellow'` - 指定されていないリテラル値
- **無効データ**: `42` - 文字列ではない値

## 特記事項

myzodの`literals()`は便利関数で、Zod v3では複数のリテラルをユニオンとして展開する必要があります。これは構造的な変換を伴う複雑なパターンです。

## 実装ステータス

⏳ **未実装** - この複雑な構造変換は現在のAST変換エンジンでは対応していません。