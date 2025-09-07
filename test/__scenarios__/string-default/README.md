# 文字列デフォルト値の変換テスト

## テスト目的

myzodの`.default()`メソッドが正しくZod v3の`.default()`メソッドに変換されることを検証します。

## 変換内容

### 変換前 (myzod)
```typescript
import myzod from 'myzod'
const schema = myzod.string().default('default value')
```

### 変換後 (Zod v3)
```typescript
import { z } from 'zod'
const schema = z.string().default('default value')
```

## 検証ポイント

1. **デフォルト値メソッドの保持**: `.default()` メソッドが正しく変換されること
2. **デフォルト値の適用**: `undefined`値に対してデフォルト値が使用されること
3. **通常値の処理**: 有効な文字列値がそのまま使用されること
4. **型エラーの処理**: 無効な型に対して適切にエラーを返すこと

## テストデータ

- **有効データ**: `"provided value"` - 明示的に提供された文字列
- **デフォルト適用ケース**: `undefined` - デフォルト値が適用される
- **無効データ**: `42` - 数値（文字列ではない）

## 特記事項

デフォルト値機能は、値が`undefined`の場合にのみ適用されます。`null`や他の無効な値に対してはエラーが発生します。