# 基本オプショナルの変換テスト

## テスト目的

myzodの`.optional()`メソッドが正しくZod v3の`.optional()`メソッドに変換されることを検証します。

## 変換内容

### 変換前 (myzod)
```typescript
import myzod from 'myzod'
const schema = myzod.string().optional()
```

### 変換後 (Zod v3)
```typescript
import { z } from 'zod'
const schema = z.string().optional()
```

## 検証ポイント

1. **オプショナルメソッドの保持**: `.optional()` メソッドが正しく変換されること
2. **undefined値の許可**: `undefined`値を有効として受け入れること
3. **通常値の処理**: 有効な文字列値を正しく処理すること
4. **無効値の拒否**: 文字列でもundefinedでもない値を拒否すること

## テストデータ

- **有効データ**: `"hello"` - 通常の文字列値
- **有効データ**: `undefined` - オプショナルとして許可される値
- **無効データ**: `null` - null値（オプショナルでも許可されない）
- **無効データ**: `42` - 数値（文字列ではない）

## 特記事項

オプショナル機能により、プロパティが存在しないか`undefined`である場合に、バリデーションエラーを発生させません。これは特にオブジェクトのプロパティで有用です。