# 基本文字列の変換テスト

## テスト目的

myzodの基本的な文字列スキーマが正しくZod v3の文字列スキーマに変換されることを検証します。

## 変換内容

### 変換前 (myzod)
```typescript
import myzod from 'myzod'
const schema = myzod.string()
```

### 変換後 (Zod v3)
```typescript
import { z } from 'zod'
const schema = z.string()
```

## 検証ポイント

1. **インポート文の変換**: `import myzod from 'myzod'` → `import { z } from 'zod'`
2. **名前空間の変換**: `myzod.string()` → `z.string()`
3. **バリデーション動作の一致**: 両方のスキーマが同じ文字列に対して同様の結果を返すこと
4. **エラーハンドリングの一致**: 無効なデータ（数値など）に対して適切にエラーを返すこと

## テストデータ

- **有効データ**: `"hello world"` - 基本的な文字列
- **無効データ**: `42` - 数値（文字列ではない）

このテストケースは、myzod → Zod v3変換の最も基本的なパターンを確認するものです。