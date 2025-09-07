# 実装ガイド

## 概要

myzod-to-zod codemodは、[nicoespeon/zod-v3-to-v4](https://github.com/nicoespeon/zod-v3-to-v4)のアーキテクチャを参考にした**AST（抽象構文木）操作ベース**の実装により、安全で精密な変換を実現している。

## アーキテクチャ

### ディレクトリ構造

```
src/
├── index.ts                    # CLI エントリーポイント
├── migrate.ts                  # メイン変換ロジック（AST操作）
├── collect-imports.ts          # myzod インポート収集・分析
└── myzod-node.ts              # myzod AST ノード識別・操作
```

### 主要コンポーネント

#### 1. インポート収集・分析 (`collect-imports.ts`)

myzodインポート宣言の収集とエイリアス対応を行う。

```typescript
export function collectMyzodImportDeclarations(sourceFile: SourceFile): ImportDeclaration[]
export function getMyzodName(importDeclaration: ImportDeclaration): string
export function collectMyzodReferences(sourceFile: SourceFile, myzodName: string)
```

**実装例**:
```typescript
// インポート: import customMyzod from 'myzod';
const imports = collectMyzodImportDeclarations(sourceFile);
const myzodName = getMyzodName(imports[0]); // => "customMyzod"
```

#### 2. myzod ノード識別・操作 (`myzod-node.ts`)

AST分析による安全なノード識別を実現。無関係な同名メソッドやコメントは変換対象から除外される。

```typescript
export function isMyzodNode(node: Node): boolean
export function isMyzodReference(node: Node, myzodName: string): boolean
export function getRootIdentifier(node: Node): string | undefined
```

**安全性の確保**:

変換される（myzod関連）:
```typescript
import myzod from 'myzod';
const schema = myzod.string().withPredicate(x => x.length > 3);
```

変換されない（無関係）:
```typescript
const obj = { map: x => x, withPredicate: y => y };
obj.map(5);           // AST分析により除外
obj.withPredicate(1); // AST分析により除外
// コメント内の myzod.map() も除外
```

#### 3. メイン変換ロジック (`migrate.ts`)

変換の実行フローは以下の通り:

```typescript
export function migrateMyzodToZodV3(sourceFile: SourceFile): string {
    const myzodImports = collectMyzodImportDeclarations(sourceFile);
    
    if (myzodImports.length === 0) return sourceFile.getFullText();

    for (const importDeclaration of myzodImports) {
        const myzodName = getMyzodName(importDeclaration);
        
        // 1. インポート文の変換
        transformImportStatement(importDeclaration);
        
        // 2. myzod 参照の変換
        transformMyzodReferences(sourceFile, myzodName);
    }

    return sourceFile.getFullText();
}
```

**インポート文変換**:

```typescript
function transformImportStatement(importDeclaration: ImportDeclaration) {
    // 'myzod' → 'zod'
    importDeclaration.setModuleSpecifier('zod');
    
    // default import → named import { z }
    const defaultImport = importDeclaration.getDefaultImport();
    if (defaultImport) {
        importDeclaration.removeDefaultImport();
        importDeclaration.addNamedImport('z');
    }
}
```

変換例:
```typescript
// Before
import myCustomName from 'myzod';

// After  
import { z } from 'zod';
```

**myzod 参照変換**:

変換処理は以下の段階で実行される:

1. **PropertyAccessExpression変換**: `myzod.string` → `z.string`
2. **CallExpression変換**: メソッド名の変更 (`.withPredicate` → `.refine`)
3. **構造的変換**: 複雑な構文変更 (`myzod.number().coerce()` → `z.coerce.number()`)

#### 4. CLI エントリーポイント (`index.ts`)

**使用方法**:
```bash
# プレビュー（変更確認のみ）
node dist/index.js "src/**/*.ts"

# 実際の変換実行
node dist/index.js "src/**/*.ts" --write
```

## 実装された変換パターン

### 完全対応（44/44テスト通過）

| 変換機能 | myzod | Zod v3 | 実装状況 |
|---------|-------|---------|----------|
| インポート文 | `import myzod from 'myzod'` | `import { z } from 'zod'` | ✅ 完了 |
| 基本型全般 | `myzod.string/number/boolean()` | `z.string/number/boolean()` | ✅ 完了 |
| 複合型 | `object/array/union/tuple/record` | `object/array/union/tuple/record` | ✅ 完了 |
| 制約系 | `.min/.max/.default/.optional/.nullable` | `.min/.max/.default/.optional/.nullable` | ✅ 完了 |
| パターン | `.pattern(regex)` | `.regex(regex)` | ✅ 完了 |
| カスタム検証 | `.withPredicate(fn)` | `.refine(fn)` | ✅ 完了 |
| 値変換 | `.map(fn)` | `.transform(fn)` | ✅ 完了 |
| オブジェクト操作 | `.partial()` | `.partial()` | ✅ 完了 |
| 型強制 | `myzod.number().coerce()` | `z.coerce.number()` | ✅ 完了 |
| 複数リテラル | `myzod.literals('a', 'b')` | `z.union([z.literal('a'), z.literal('b')])` | ✅ 完了 |
| 交差型 | `myzod.intersection(A, B)` | `z.intersection(A, B)` | ✅ 完了 |
| TypeScript enum | `myzod.enum(MyEnum)` | `z.nativeEnum(MyEnum)` | ✅ 完了 |
| 型推論 | `myzod.Infer<T>` | `z.infer<typeof T>` | ✅ 完了 |

### 実装の特徴

**精密性**: TypeScript ASTの正確な構文解析により、コンテキストを理解した変換を実行。

**安全性**: 意図しない変換を完全に回避。文字列置換の危険性を排除。

**保守性**: TypeScriptの型システムによる品質保証。ts-morphライブラリの堅牢なAST操作。

**拡張性**: 新しいAPI変換の追加が容易。複雑な変換パターンへの対応可能。

## 変換の詳細例

### 基本的な変換

```typescript
// 入力
import myzod from 'myzod';

export const stringSchema = myzod.string();
export const predicateSchema = myzod.string().withPredicate(s => s.length > 3);
export const mapSchema = myzod.string().map(s => s.length);

// 無関係なコード
const myObject = {
    map: (x: any) => x,
    withPredicate: (y: any) => y
};
const result = myObject.map(5);

// 出力
import { z } from 'zod';

export const stringSchema = z.string();
export const predicateSchema = z.string().refine(s => s.length > 3);
export const mapSchema = z.string().transform(s => s.length);

// 無関係なコード（変更されない）
const myObject = {
    map: (x: any) => x,
    withPredicate: (y: any) => y
};
const result = myObject.map(5);
```

### 複雑な構造変換

```typescript
// 型強制（coerce）
// Before: myzod.number().coerce()
// After:  z.coerce.number()

// 複数リテラル
// Before: myzod.literals('red', 'green', 'blue')
// After:  z.union([z.literal('red'), z.literal('green'), z.literal('blue')])

// 型推論
// Before: myzod.Infer<typeof schema>
// After:  z.infer<typeof schema>
```

## テスト戦略

### TDD準拠の開発

プロジェクトは**Test-Driven Development (TDD)** の原則に従って開発されている:

1. **Red Phase**: 新しいテストケースを追加（初期は失敗）
2. **Green Phase**: 最小限の実装でテストを通す
3. **Refactor Phase**: コード品質を向上
4. **Commit**: 変更をコミット

### テスト構造

- **44個のテストシナリオ**: `test/__scenarios__/*/`に配置
- **包括的な検証**: 変換前後のコードと実行時の動作を検証
- **100%テスト通過**: 全機能が動作検証済み

## 開発時の注意点

### AST操作の安全性

- **TypeScript AST**を正確に解析
- **コンテキスト理解**による変換
- **無関係なコード**への影響を排除

### 拡張方法

新しい変換パターンを追加する場合:

1. `test/__scenarios__/`に新しいテストケースを追加
2. `src/migrate.ts`に変換ロジックを実装
3. 既存のテストが通ることを確認
4. 新しいテストが通ることを確認

### デバッグ

CLI のプレビューモードを活用:
```bash
# 変更内容を確認
node dist/index.js "target-file.ts"

# 実際に適用
node dist/index.js "target-file.ts" --write
```

## パフォーマンス

- **実行時間**: ~200ms（44テスト）
- **メモリ使用量**: 低メモリフットプリント
- **大規模ファイル**: ts-morphの効率的なAST操作により高速処理

## 結論

AST実装により、**文字列置換の危険性を完全に排除**し、TypeScriptコードの意味構造を理解した**安全で精密な変換**が実現されている。参考プロジェクトの設計思想を踏襲することで、maintainableで拡張可能なcodemodアーキテクチャが完成し、**44/44のテストケース（100%）が通過**している実証済みの実装となっている。