# 基本列挙型の変換テスト

## テスト目的

myzodの`enum()`関数がZod v3の`z.nativeEnum()`関数に正しく変換されることを検証します。

## 変換内容

### 変換前 (myzod)
```typescript
import myzod from 'myzod'

enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue'
}

const schema = myzod.enum(Color)
```

### 変換後 (Zod v3)
```typescript
import { z } from 'zod'

enum Color {
  Red = 'red',
  Green = 'green',
  Blue = 'blue'
}

const schema = z.nativeEnum(Color)
```

## 検証ポイント

1. **enum関数の変換**: `myzod.enum()` → `z.nativeEnum()`
2. **TypeScript enum対応**: ネイティブなTypeScript enumとの互換性
3. **enum値の検証**: enum に定義された値のみを受け入れること
4. **無効値の拒否**: enum に定義されていない値を拒否すること

## テストデータ

- **有効データ**: `Color.Red` - enum値（'red'）
- **有効データ**: `'green'` - enum の文字列値
- **無効データ**: `'yellow'` - enum に定義されていない値
- **無効データ**: `42` - 文字列ではない値

## 特記事項

TypeScript の native enum は、Zod v3 では `z.nativeEnum()` を使用して処理されます。これにより、既存の TypeScript enum 定義をそのまま活用できます。

## 実装ステータス

⏳ **未実装** - この enum 変換は現在のAST変換エンジンでは対応していません。