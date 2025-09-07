# myzod → Zod v3 変換テスト実装サマリー

## 概要

[nicoespeon/zod-v3-to-v4](https://github.com/nicoespeon/zod-v3-to-v4)を参考に、myzodからZod v3への変換を検証する**22個の包括的なテストケース**を実装しました。すべてのテストが正常に通過し、myzodとZod v3の機能的な互換性を確認しています。

## 実装されたテストケース（22個）

### A. 基本型スキーマ（9個）

| # | テストケース | myzod | Zod v3 | 説明 |
|---|-------------|-------|---------|------|
| 1 | `basic-string` | `myzod.string()` | `z.string()` | 基本文字列型 |
| 2 | `basic-number` | `myzod.number()` | `z.number()` | 基本数値型 |
| 3 | `basic-boolean` | `myzod.boolean()` | `z.boolean()` | ブール型 |
| 4 | `basic-literal` | `myzod.literal('hello')` | `z.literal('hello')` | リテラル型 |
| 5 | `basic-object` | `myzod.object({...})` | `z.object({...})` | オブジェクト型 |
| 6 | `basic-array` | `myzod.array(myzod.string())` | `z.array(z.string())` | 配列型 |
| 7 | `union-basic` | `myzod.union([...])` | `z.union([...])` | ユニオン型 |
| 8 | `tuple-basic` | `myzod.tuple([...])` | `z.tuple([...])` | タプル型 |
| 9 | `record-basic` | `myzod.record(myzod.string())` | `z.record(z.string())` | レコード型 |

### B. 文字列制約（3個）

| # | テストケース | myzod | Zod v3 | 説明 |
|---|-------------|-------|---------|------|
| 10 | `string-min-max` | `.min(5).max(10)` | `.min(5).max(10)` | 長さ制限 |
| 11 | `string-pattern` | `.pattern(/^[A-Z]+$/)` | `.regex(/^[A-Z]+$/)` | 正規表現 |
| 12 | `string-default` | `.default('value')` | `.default('value')` | デフォルト値 |

### C. オプショナル・null許可（2個）

| # | テストケース | myzod | Zod v3 | 説明 |
|---|-------------|-------|---------|------|
| 13 | `optional-basic` | `.optional()` | `.optional()` | オプショナル |
| 14 | `nullable-basic` | `.nullable()` | `.nullable()` | null許可 |

### D. カスタムバリデーション（1個）

| # | テストケース | myzod | Zod v3 | 説明 |
|---|-------------|-------|---------|------|
| 15 | `predicate-string` | `.withPredicate(fn, msg)` | `.refine(fn, msg)` | カスタム検証 |

### E. 型変換・強制（2個）

| # | テストケース | myzod | Zod v3 | 説明 |
|---|-------------|-------|---------|------|
| 16 | `map-string-to-length` | `.map(s => s.length)` | `.transform(s => s.length)` | 値変換 |
| 17 | `number-coerce` | `.coerce()` | `z.coerce.number()` | 型強制 |

### F. 複合オブジェクト操作（1個）

| # | テストケース | myzod | Zod v3 | 説明 |
|---|-------------|-------|---------|------|
| 18 | `object-partial` | `.partial()` | `.partial()` | 部分型 |

### G. 配列制約（1個）

| # | テストケース | myzod | Zod v3 | 説明 |
|---|-------------|-------|---------|------|
| 19 | `array-min-max` | `.min(1).max(3)` | `.min(1).max(3)` | 要素数制限 |

### H. 高度な型（3個）

| # | テストケース | myzod | Zod v3 | 説明 |
|---|-------------|-------|---------|------|
| 20 | `intersection-basic` | `myzod.intersection(a, b)` | `z.intersection(a, b)` | 交差型 |
| 21 | `literals-multiple` | `myzod.literals('a', 'b', 'c')` | `z.union([z.literal('a'), ...])` | 複数リテラル |
| 22 | `enum-basic` | `myzod.enum(MyEnum)` | `z.nativeEnum(MyEnum)` | 列挙型 |

## テストフレームワーク設計

### ディレクトリ構造
```
test/
├── scenarios.ts                    # メインテストファイル
└── __scenarios__/
    ├── basic-string/
    │   ├── myzod.ts               # myzodスキーマ + テストデータ
    │   └── zodv3.ts               # Zod v3スキーマ + テストデータ
    ├── basic-number/
    │   ├── myzod.ts
    │   └── zodv3.ts
    └── ...（22個のテストケース）
```

### テスト実行方式
1. **フィクスチャベース**: 各テストケースは独立したmyzod/zodv3ファイルペア
2. **動的インポート**: テスト実行時にスキーマを動的にロード
3. **多重検証**: valid/invalid データの複数バリエーションをサポート
4. **変換検証**: map/transformの出力値まで検証

### 検証ロジック
```typescript
// 成功パターン
expect(myzodSuccess).toBe(true);
expect(zodv3Result.success).toBe(true);

// 失敗パターン  
expect(myzodFailed).toBe(true);
expect(zodv3Result.success).toBe(false);

// 変換結果の検証
expect(myzodResult).toBe(expectedOutput);
expect(zodv3Result.data).toBe(expectedOutput);
```

## 主要な発見と実装メモ

### 1. API対応マッピング

| myzod | Zod v3 | 備考 |
|-------|---------|------|
| `withPredicate()` | `refine()` | カスタムバリデーション |
| `map()` | `transform()` | 値変換 |
| `pattern()` | `regex()` | 正規表現 |
| `literals()` | `union([literal(), ...])` | 複数リテラル展開 |
| `enum()` | `nativeEnum()` | TypeScript enum |

### 2. エラーハンドリングの違い

**myzod**:
- `try()`: 成功時は値、失敗時はErrorオブジェクト
- `parse()`: 成功時は値、失敗時は例外

**Zod v3**:
- `safeParse()`: `{success: boolean, data?: T, error?: ZodError}`
- `parse()`: 成功時は値、失敗時は例外

### 3. 型推論の違い

**myzod**: `Infer<typeof schema>`
**Zod v3**: `z.infer<typeof schema>`

## テスト実行結果

```bash
> pnpm test

✓ test/scenarios.ts (22 tests) 343ms

Test Files  1 passed (1)
     Tests  22 passed (22)
```

**すべてのテストが成功**し、myzodとZod v3の機能的互換性を確認しました。

## プレースホルダー変換関数

現在の`convertMyzodToZodV3()`は基本的な文字列置換のプレースホルダーです：

```typescript
function convertMyzodToZodV3(myzodCode: string): string {
    return myzodCode
        .replace(/import myzod from 'myzod'/g, "import { z } from 'zod'")
        .replace(/myzod\./g, 'z.')
        .replace(/\.withPredicate\(/g, '.refine(')
        .replace(/\.map\(/g, '.transform(');
}
```

## 今後の発展可能性

### 1. 実際のAST変換実装
- ts-morphを活用した本格的なコード変換
- より複雑な変換パターンの対応
- コメントや型注釈の保持

### 2. 追加テストケース
- 再帰型（`lazy`）
- 複雑なネストした構造
- エラーメッセージのカスタマイズ
- 非同期バリデーション

### 3. 変換できない機能の対応
- `collectErrors()` → 注記付きで警告
- `dictionary()` → `record().optional()`への変換
- `allowUnknownKeys()` → `passthrough()`への変換

## 結論

**22個の包括的なテストケース**により、myzodからZod v3への変換が技術的に実現可能であることを実証しました。両ライブラリの API は高い互換性を持ち、ほとんどの機能において1対1の対応関係が確認できています。

このテストスイートは、実際の変換ツール開発における**信頼性の高い品質保証基盤**として機能します。