# 基本リテラルの変換テスト

## テスト目的

myzodの基本的なリテラル型スキーマが正しくZod v3のリテラル型スキーマに変換されることを検証します。

## 変換内容

### 変換前 (myzod)
```typescript
import myzod from 'myzod'
const schema = myzod.literal('hello')
```

### 変換後 (Zod v3)
```typescript
import { z } from 'zod'
const schema = z.literal('hello')
```

## 検証ポイント

1. **リテラル型の変換**: `myzod.literal()` → `z.literal()`
2. **厳密な値の検証**: 指定された値のみを受け入れること
3. **型エラーの一致**: 異なる値に対して適切にエラーを返すこと

## テストデータ

- **有効データ**: `"hello"` - 指定されたリテラル値
- **無効データ**: `"world"` - 異なる文字列値

このテストケースは、特定の値のみを許可するリテラル型の変換を確認します。