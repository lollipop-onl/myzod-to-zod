# 基本ブール値の変換テスト

## テスト目的

myzodの基本的なブール値スキーマが正しくZod v3のブール値スキーマに変換されることを検証します。

## 変換内容

### 変換前 (myzod)
```typescript
import myzod from 'myzod'
const schema = myzod.boolean()
```

### 変換後 (Zod v3)
```typescript
import { z } from 'zod'
const schema = z.boolean()
```

## 検証ポイント

1. **基本ブール値型の変換**: `myzod.boolean()` → `z.boolean()`
2. **true/false値の検証**: 両方のスキーマがブール値を正しく受け入れること
3. **型エラーの一致**: 文字列や数値に対して適切にエラーを返すこと

## テストデータ

- **有効データ**: `true` - ブール値
- **無効データ**: `"true"` - 文字列（ブール値ではない）

このテストケースは、基本的なブール値型変換の動作を確認します。