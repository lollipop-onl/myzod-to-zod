# 数値強制変換のテスト

## テスト目的

myzodの`.coerce()`メソッドがZod v3の`z.coerce.number()`に正しく変換されることを検証します。これは構造的な変更を伴う高度な変換パターンです。

## 変換内容

### 変換前 (myzod)
```typescript
import myzod from 'myzod'
const schema = myzod.number().coerce()
```

### 変換後 (Zod v3)
```typescript
import { z } from 'zod'
const schema = z.coerce.number()
```

## 検証ポイント

1. **構造的変換**: `myzod.number().coerce()` → `z.coerce.number()` の構造変更
2. **型強制の動作**: 文字列数値が数値に変換されること
3. **無効値の処理**: 変換不可能な値に対して適切にエラーを返すこと
4. **数値の直接受け入れ**: 既に数値である値をそのまま受け入れること

## テストデータ

- **有効データ**: `"42"` - 数値文字列（42に変換される）
- **有効データ**: `42` - 既に数値である値
- **無効データ**: `"not a number"` - 変換不可能な文字列
- **無効データ**: `null` - null値

## 特記事項

この変換は単純なメソッド名変更ではなく、コード構造の変更を伴います。myzodでは既存のスキーマにcoerceメソッドを追加しますが、Zod v3では`z.coerce.number()`という専用の構文を使用します。

## 実装ステータス

⏳ **未実装** - この高度な構造変換は現在のAST変換エンジンでは対応していません。