# オブジェクト部分型の変換テスト

## テスト目的

myzodの`.partial()`メソッドが正しくZod v3の`.partial()`メソッドに変換されることを検証します。

## 変換内容

### 変換前 (myzod)
```typescript
import myzod from 'myzod'
const schema = myzod.object({
  name: myzod.string(),
  age: myzod.number()
}).partial()
```

### 変換後 (Zod v3)
```typescript
import { z } from 'zod'
const schema = z.object({
  name: z.string(),
  age: z.number()
}).partial()
```

## 検証ポイント

1. **partialメソッドの保持**: `.partial()` メソッドが正しく変換されること
2. **全プロパティのオプショナル化**: すべてのプロパティがオプショナルになること
3. **部分的なオブジェクトの受け入れ**: 一部のプロパティのみを持つオブジェクトを有効とすること
4. **完全なオブジェクトの受け入れ**: すべてのプロパティを持つオブジェクトも有効とすること

## テストデータ

- **有効データ**: `{ name: "Alice" }` - nameプロパティのみ
- **有効データ**: `{ age: 30 }` - ageプロパティのみ
- **有効データ**: `{ name: "Bob", age: 25 }` - 全プロパティ
- **有効データ**: `{}` - 空のオブジェクト
- **無効データ**: `{ name: "Charlie", age: "not a number" }` - 無効な型

## 特記事項

partial機能により、オブジェクトのすべてのプロパティがオプショナルになります。これは既存のスキーマを柔軟に使用したい場合に有用です。