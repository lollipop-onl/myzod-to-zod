# 基本null許可の変換テスト

## テスト目的

myzodの`.nullable()`メソッドが正しくZod v3の`.nullable()`メソッドに変換されることを検証します。

## 変換内容

### 変換前 (myzod)
```typescript
import myzod from 'myzod'
const schema = myzod.string().nullable()
```

### 変換後 (Zod v3)
```typescript
import { z } from 'zod'
const schema = z.string().nullable()
```

## 検証ポイント

1. **nullableメソッドの保持**: `.nullable()` メソッドが正しく変換されること
2. **null値の許可**: `null`値を有効として受け入れること
3. **通常値の処理**: 有効な文字列値を正しく処理すること
4. **無効値の拒否**: 文字列でもnullでもない値を拒否すること

## テストデータ

- **有効データ**: `"hello"` - 通常の文字列値
- **有効データ**: `null` - nullable として許可される値
- **無効データ**: `undefined` - undefined値（nullableでは許可されない）
- **無効データ**: `42` - 数値（文字列ではない）

## 特記事項

nullable機能により、値が明示的に`null`である場合にバリデーションエラーを発生させません。これは`undefined`とは異なる概念で、明示的に「値がない」ことを表現します。