# ライブラリ比較リファレンス

## 概要

TypeScriptバリデーションライブラリの比較と、myzodからZod v3への移行理由について解説する。

## なぜ myzod から Zod に移行するのか

### エコシステムの収束

TypeScriptバリデーションライブラリのエコシステムは**Standard Schema準拠**に収束している。

#### Standard Schema準拠状況

| ライブラリ | 準拠状況 | エコシステム | パフォーマンス |
|-----------|---------|-------------|---------------|
| **Zod** | ✅ サポート済み | 成熟（週間4200万DL） | 標準 |
| **Valibot** | ✅ サポート済み | 成長中 | 高速・軽量 |
| **ArkType** | ✅ サポート済み | 新しい | 最高速 |
| **myzod** | ❓ 不明/未対応 | 小規模 | 最高速（25倍） |

### myzod の制約

1. **不確実なStandard Schemaサポート**: 将来の移行リスク
2. **小さなエコシステム**: 統合オプションの制限  
3. **メンテナーベースが小さい**: 開発活動が低調
4. **フレームワーク統合**: Standard Schema準拠ライブラリを優先する傾向

### 移行の価値

- **長期的な安定性**: 成熟したエコシステム
- **豊富な統合**: tRPC、Hono等での広範な採用
- **将来の移行柔軟性**: Standard Schema準拠により

## パフォーマンス比較

### ベンチマーク結果（1秒あたりのオブジェクト解析数）

1. **ArkType**: Zod 4より約20倍高速
2. **myzod**: 1,288,659 objects/秒（Zodより約25倍高速）
3. **Joi**: 194,325 objects/秒
4. **Zod**: 51,861 objects/秒

### パフォーマンス劣化の文脈

#### Zod 4 の劣化
- 文字列検証: Zod 3が1.56倍高速
- 数値検証: Zod 3が1.29倍高速  
- バンドルサイズ: 49.8kb gzip（前バージョンから増加）

#### myzod の速度優位性の理由
- 抽象化レイヤーが少ないシンプルな検証ロジック
- 最適化されたホットパス
- 検証中のオブジェクト生成の削減
- TypeScript型システムとの連携

### パフォーマンスが重要な場面 vs そうでない場面

#### パフォーマンスが問題となる場面
- 高スループットAPI検証（毎秒数千回の検証）
- リアルタイムデータ処理アプリケーション  
- バンドルサイズ重視のクライアントアプリケーション
- 複雑なネストしたスキーマ検証

#### パフォーマンスが許容できる場面
- 標準的なフォーム検証
- 一般的なAPIスキーマ検証
- 使用頻度の低い管理インターフェース
- 一般的なWebアプリケーション

### 実際の選択指針

**重要なポイント**: 特定の使用ケースでパフォーマンスが**文書化されたボトルネック**でない限り、不確実な準拠状況を持つ高パフォーマンス代替品よりも、Standard Schema準拠ライブラリを選択すべき。

## API比較: myzod vs Zod v3

### インポート文

```typescript
// myzod
import myzod, { Infer } from 'myzod'

// Zod v3
import { z } from 'zod'
```

### 基本的なAPI類似性

多くのAPIは類似しているため、変換が可能:

```typescript
// 基本型（類似）
myzod.string() ↔ z.string()
myzod.number() ↔ z.number()
myzod.object() ↔ z.object()

// 制約（類似）  
.min(5) ↔ .min(5)
.max(10) ↔ .max(10)
.optional() ↔ .optional()
```

### 主要な相違点

#### メソッド名の違い

```typescript
// パターンマッチング
myzod.string().pattern(/regex/) → z.string().regex(/regex/)

// カスタム検証
myzod.string().withPredicate(fn) → z.string().refine(fn)

// 値変換
myzod.string().map(fn) → z.string().transform(fn)
```

#### 構造的な違い

```typescript
// 型強制（構造変更）
myzod.number().coerce() → z.coerce.number()

// 複数リテラル（構造変更）
myzod.literals('a', 'b') → z.union([z.literal('a'), z.literal('b')])

// TypeScript enum
myzod.enum(MyEnum) → z.nativeEnum(MyEnum)

// 型推論
myzod.Infer<T> → z.infer<typeof T>
```

#### 根本的な違い（手動調整必要）

```typescript
// エラーハンドリング
myzod: schema.try(data) → ValidationError | T
Zod: schema.safeParse(data) → { success: boolean, data?: T, error?: ZodError }

// 独自機能
myzod.dictionary() → 直接的な対応なし（z.record()で近似）
myzod.collectErrors() → zodでは標準動作
myzod.allowUnknownKeys() → z.passthrough()で近似
```

## 新規プロジェクト推奨事項（2024-2025）

### 推奨順位

1. **ArkType**: 最大パフォーマンスが必要でエコシステムの制限が許容できる場合
2. **Valibot**: バンドルサイズが重要な場合（クライアントサイド、サーバーレス）
3. **Zod**: 成熟したエコシステムと豊富な統合が必要な場合

### 既存プロジェクト

- **Zodプロジェクト**: 特定のパフォーマンスボトルネックが特定されない限りZodで継続
- **myzodプロジェクト**: このcodemodによりZodへの移行を推奨

## myzod 独自機能とZod代替案

### dictionary()

```typescript
// myzod独自
const schema = myzod.dictionary(myzod.string())

// Zod代替案
const schema = z.record(z.string().optional())
```

### collectErrors()

```typescript
// myzod独自
const schema = myzod.object({...}).collectErrors()

// Zod（標準でエラー収集、特別な対応不要）
const schema = z.object({...})
```

### allowUnknownKeys()

```typescript
// myzod独自
const schema = myzod.object({...}).allowUnknownKeys()

// Zod代替案
const schema = z.object({...}).passthrough()
```

## バンドルサイズ比較

- **Valibot**: 700バイト未満から開始（Zodより最大95%小さい）
- **Zod v3**: ~20kb gzip（v4: 49.8kb）
- **myzod**: Zodよりも小さなフットプリント
- **ArkType**: 他の軽量代替品と同等

## 結論

myzodは大幅なパフォーマンス優位性を提供するが、TypeScriptバリデーションライブラリエコシステムは**Standard Schema準拠**に収束している。ほとんどのアプリケーションでは、Zodのパフォーマンスは許容できるレベルであり、その成熟したエコシステムは長期的に大きな価値を提供する。

このcodemodにより、myzodからZod v3への**100%自動変換**が可能となり、エコシステムの恩恵を受けながら、開発工数を最小限に抑えた移行が実現できる。

## 参考資料

### 公式ドキュメント
- [Zod Official Documentation](https://zod.dev/)
- [myzod GitHub Repository](https://github.com/davidmdm/myzod)
- [Valibot Official Website](https://valibot.dev/)
- [ArkType Official Website](https://arktype.io/)
- [Standard Schema Specification](https://github.com/standard-schema/standard-schema)

### パフォーマンス情報
- [Zod Performance Regression #5189](https://github.com/colinhacks/zod/issues/5189)
- [myzod Performance Claims](https://github.com/davidmdm/myzod#performance)
- [ArkType Benchmark Results](https://arktype.io/docs/intro#performance)