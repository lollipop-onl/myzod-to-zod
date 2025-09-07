# 基本数値の変換テスト

## テスト目的

myzodの基本的な数値スキーマが正しくZod v3の数値スキーマに変換されることを検証します。

## 変換内容

### 変換前 (myzod)
```typescript
import myzod from 'myzod'
const schema = myzod.number()
```

### 変換後 (Zod v3)
```typescript
import { z } from 'zod'
const schema = z.number()
```

## 検証ポイント

1. **基本数値型の変換**: `myzod.number()` → `z.number()`
2. **バリデーション動作の一致**: 両方のスキーマが数値に対して同様の結果を返すこと
3. **型エラーの一致**: 文字列など数値以外のデータに対して適切にエラーを返すこと

## テストデータ

- **有効データ**: `42` - 基本的な数値
- **無効データ**: `"not a number"` - 文字列（数値ではない）

このテストケースは、基本的な数値型変換の動作を確認します。