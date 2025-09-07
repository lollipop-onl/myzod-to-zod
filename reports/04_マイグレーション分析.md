# myzod から zod 3 への マイグレーション可能性詳細分析

## 総合評価

| 項目 | 自動化可能度 | 難易度 | 備考 |
|------|--------------|--------|------|
| **総合評価** | **90-95%** | **中** | 実用的なレベルで自動化可能 |

## 詳細分析

### ✅ **完全自動変換可能（95-100%）**

#### 基本スキーマ変換
| myzod | zod 3 | 自動化 | 変換例 |
|-------|-------|--------|--------|
| `myzod.string()` | `z.string()` | ✅ | 直接置換 |
| `myzod.number()` | `z.number()` | ✅ | 直接置換 |
| `myzod.boolean()` | `z.boolean()` | ✅ | 直接置換 |
| `myzod.bigint()` | `z.bigint()` | ✅ | 直接置換 |
| `myzod.date()` | `z.date()` | ✅ | 直接置換 |
| `myzod.undefined()` | `z.undefined()` | ✅ | 直接置換 |
| `myzod.null()` | `z.null()` | ✅ | 直接置換 |
| `myzod.unknown()` | `z.unknown()` | ✅ | 直接置換 |

#### 複合型変換
| myzod | zod 3 | 自動化 | 変換例 |
|-------|-------|--------|--------|
| `myzod.object({...})` | `z.object({...})` | ✅ | 直接置換 |
| `myzod.array(T)` | `z.array(T)` | ✅ | 直接置換 |
| `myzod.tuple([...])` | `z.tuple([...])` | ✅ | 直接置換 |
| `myzod.union([...])` | `z.union([...])` | ✅ | 直接置換 |
| `myzod.record(T)` | `z.record(T)` | ✅ | 直接置換 |
| `myzod.lazy(() => T)` | `z.lazy(() => T)` | ✅ | 直接置換 |

#### リテラル型変換
| myzod | zod 3 | 自動化 | 変換例 |
|-------|-------|--------|--------|
| `myzod.literal('x')` | `z.literal('x')` | ✅ | 直接置換 |
| `myzod.literals('a', 'b', 'c')` | `z.enum(['a', 'b', 'c'])` | ✅ | 構文変換 |

### ✅ **高度自動変換可能（85-95%）**

#### メソッドチェーン変換
| myzod | zod 3 | 自動化 | 変換例 |
|-------|-------|--------|--------|
| `.optional()` | `.optional()` | ✅ | 直接置換 |
| `.nullable()` | `.nullable()` | ✅ | 直接置換 |
| `.default(val)` | `.default(val)` | ✅ | 直接置換 |
| `.min(n)` | `.min(n)` | ✅ | 直接置換 |
| `.max(n)` | `.max(n)` | ✅ | 直接置換 |
| `.pattern(regex)` | `.regex(regex)` | ✅ | メソッド名変更 |
| `.map(fn)` | `.transform(fn)` | ✅ | メソッド名変更 |
| `.withPredicate(fn, msg)` | `.refine(fn, msg)` | ✅ | メソッド名変更 |
| `.coerce()` | `z.coerce.number()` | ⚠️ | 構文変更必要 |

#### 演算子変換
| myzod | zod 3 | 自動化 | 変換例 |
|-------|-------|--------|--------|
| `T.or(U)` | `z.union([T, U])` | ✅ | 構文変換 |
| `T.and(U)` | `z.intersection(T, U)` | ✅ | 構文変換 |

#### バリデーションメソッド
| myzod | zod 3 | 自動化 | 変換例 |
|-------|-------|--------|--------|
| `.parse(data)` | `.parse(data)` | ✅ | 直接置換 |
| `.try(data)` | `.safeParse(data)` | ⚠️ | メソッド名 + 戻り値構造変更 |

### ⚠️ **部分自動変換可能（60-85%）**

#### Import文の変換
```typescript
// myzod
import myzod, { Infer } from 'myzod'

// zod (自動変換)
import { z } from 'zod'
```
**課題**: デフォルトimportから名前付きimportへの変換

#### 型推論の変換
```typescript
// myzod
type User = Infer<typeof schema>

// zod (自動変換)
type User = z.infer<typeof schema>
```
**課題**: `Infer` → `z.infer` の置換、import文との連携

#### Enum変換
```typescript
// myzod
myzod.enum(MyEnum)

// zod (自動変換)
z.nativeEnum(MyEnum)
```
**課題**: メソッド名変更 `enum` → `nativeEnum`

### ❌ **手動調整必要（20-60%）**

#### エラーハンドリングパターン
```typescript
// myzod
const result = schema.try(data)
if (result instanceof myzod.ValidationError) {
  console.log('Error:', result.message)
  console.log('Path:', result.path)
} else {
  console.log('Success:', result)
}

// zod (手動調整必要)
const result = schema.safeParse(data)
if (!result.success) {
  console.log('Error:', result.error.message)
  console.log('Path:', result.error.issues[0]?.path)
} else {
  console.log('Success:', result.data)
}
```
**課題**: 
- 戻り値の構造が根本的に異なる
- エラー情報へのアクセス方法が異なる
- 条件分岐のロジックが異なる

#### coerce()の構文変換
```typescript
// myzod
const schema = myzod.number().coerce()

// zod (手動調整必要)
const schema = z.coerce.number()
```
**課題**: メソッドチェーンから関数呼び出しへの構造変更

### ❌ **マイグレーション困難（独自機能）**

#### dictionary()
```typescript
// myzod独自
const schema = myzod.dictionary(myzod.string())

// zod代替案（手動実装）
const schema = z.record(z.string().optional())
```

#### collectErrors()
```typescript
// myzod独自
const schema = myzod.object({...}).collectErrors()

// zod（標準でエラー収集、特別な対応不要）
const schema = z.object({...})
```

#### allowUnknownKeys()
```typescript
// myzod独自
const schema = myzod.object({...}).allowUnknownKeys()

// zod代替案
const schema = z.object({...}).passthrough()
```

## ts-morphを使った実装戦略

### Phase 1: 基本変換（70%の自動化）
```typescript
// 実装すべき変換ルール
const basicTransformations = [
  { from: 'myzod.string()', to: 'z.string()' },
  { from: 'myzod.number()', to: 'z.number()' },
  { from: 'myzod.object(', to: 'z.object(' },
  { from: 'myzod.array(', to: 'z.array(' },
  // ... 他の基本型
]
```

### Phase 2: メソッドチェーン変換（15%の自動化）
```typescript
// メソッド名の変換
const methodTransformations = [
  { from: '.pattern(', to: '.regex(' },
  { from: '.map(', to: '.transform(' },
  { from: '.withPredicate(', to: '.refine(' },
  { from: '.try(', to: '.safeParse(' },
]
```

### Phase 3: 構造変換（10%の自動化）
```typescript
// 複雑な構文変更
// T.or(U) → z.union([T, U])
// myzod.literals('a', 'b') → z.enum(['a', 'b'])
// import文の変換
```

### Phase 4: 手動調整（5%）
- エラーハンドリングパターンの変更
- 独自APIの代替実装
- 型定義の微調整

## 実装上の技術的課題

### 1. AST解析の複雑さ
```typescript
// 複雑なネストした構造の解析
const complex = myzod.object({
  user: myzod.object({
    name: myzod.string().min(1),
    tags: myzod.array(myzod.string()).optional()
  }).optional(),
  meta: myzod.record(myzod.unknown())
})
```

### 2. スコープとインポートの管理
```typescript
// myzodとzodが混在する場合の識別
import myzod from 'myzod'
import { z } from 'zod'

const schema1 = myzod.string()  // 変換対象
const schema2 = z.string()      // 変換対象外
```

### 3. 型情報の保持
```typescript
// 型推論の整合性確保
type User = Infer<typeof userSchema>
const user: User = userSchema.parse(data)
```

## 成功指標

### 自動化率目標
- **Phase 1完了**: 70%自動化
- **Phase 2完了**: 85%自動化  
- **Phase 3完了**: 95%自動化
- **全体完了**: 95%自動化（手動調整5%）

### 品質指標
- TypeScriptコンパイルエラー: 0%
- 実行時エラー: 0%
- テストケース通過率: 100%
- パフォーマンス劣化: 許容範囲内

## リスク評価

### 高リスク
- 複雑なエラーハンドリングパターンの変換
- 大規模コードベースでの実行時間
- 予期しないエッジケースの存在

### 中リスク  
- Import文の完全自動化
- 型推論の整合性確保
- サードパーティライブラリとの競合

### 低リスク
- 基本スキーマの変換
- メソッドチェーンの変換
- テストケースでの検証

## 推奨実装順序

1. **プロトタイプ作成**: 基本変換のみの簡単な実装
2. **テストケース構築**: 全パターンを網羅するテストスイート
3. **段階的実装**: Phase毎の機能追加と検証
4. **実プロジェクト検証**: 実際のコードベースでの動作確認
5. **最適化**: パフォーマンスと正確性の向上

---
*詳細な技術分析に基づくマイグレーション戦略*