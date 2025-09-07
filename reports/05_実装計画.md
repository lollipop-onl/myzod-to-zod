# ts-morph を使った myzod to zod 3 codemod 実装計画

## プロジェクト概要

### 目標
myzod から zod 3 への **90-95%自動マイグレーション** を実現するts-morph基盤のcodemodツールを開発する。

### スコープ
- TypeScriptファイルの自動変換
- Import文の変更
- スキーマ定義の変換
- メソッドチェーンの変換
- エラーハンドリングパターンの部分変換
- 型推論コードの変換

## アーキテクチャ設計

### 全体構造
```
myzod-to-zod-codemod/
├── src/
│   ├── transformers/
│   │   ├── ImportTransformer.ts      // Import文変換
│   │   ├── SchemaTransformer.ts      // 基本スキーマ変換
│   │   ├── MethodTransformer.ts      // メソッドチェーン変換
│   │   ├── TypeTransformer.ts        // 型推論変換
│   │   ├── ErrorHandlingTransformer.ts // エラーハンドリング変換
│   │   └── index.ts
│   ├── utils/
│   │   ├── ASTUtils.ts               // AST操作ユーティリティ
│   │   ├── PatternMatcher.ts         // パターンマッチング
│   │   └── ValidationUtils.ts        // 変換検証
│   ├── config/
│   │   ├── TransformationRules.ts    // 変換ルール定義
│   │   └── Config.ts                 // 設定管理
│   ├── cli/
│   │   └── index.ts                  // CLI実装
│   └── index.ts                      // メインエントリーポイント
├── test/
│   ├── fixtures/                     // テストケース
│   ├── transformers/                 // 各transformer単体テスト
│   └── integration/                  // 統合テスト
├── docs/
└── examples/
```

## 実装フェーズ

### Phase 1: 基礎実装（Week 1-2）

#### 1.1 プロジェクトセットアップ
```typescript
// package.json dependencies
{
  "ts-morph": "^26.0.0",
  "commander": "^9.0.0",
  "chalk": "^5.0.0",
  "glob": "^8.0.0"
}
```

#### 1.2 基本Import変換
```typescript
// ImportTransformer.ts
export class ImportTransformer {
  transform(sourceFile: SourceFile): void {
    // "import myzod, { Infer } from 'myzod'"
    // ↓
    // "import { z } from 'zod'"
    
    const myzodImports = sourceFile.getImportDeclarations()
      .filter(imp => imp.getModuleSpecifierValue() === 'myzod')
    
    for (const importDecl of myzodImports) {
      this.replaceMyzodImport(importDecl, sourceFile)
    }
  }
  
  private replaceMyzodImport(importDecl: ImportDeclaration, sourceFile: SourceFile): void {
    // myzod import を zod import に置換
    importDecl.setModuleSpecifier('zod')
    importDecl.removeDefaultImport()
    
    // 名前付きimportを設定
    importDecl.addNamedImport('z')
    
    // Infer import を削除（後でz.inferに変換）
    const namedImports = importDecl.getNamedImports()
    namedImports.forEach(namedImport => {
      if (namedImport.getName() === 'Infer') {
        namedImport.remove()
      }
    })
  }
}
```

#### 1.3 基本スキーマ変換
```typescript
// SchemaTransformer.ts
export class SchemaTransformer {
  private readonly basicTransformations = [
    { from: 'myzod.string', to: 'z.string' },
    { from: 'myzod.number', to: 'z.number' },
    { from: 'myzod.boolean', to: 'z.boolean' },
    { from: 'myzod.object', to: 'z.object' },
    { from: 'myzod.array', to: 'z.array' },
    // ... その他の基本型
  ]
  
  transform(sourceFile: SourceFile): void {
    // PropertyAccessExpression を検索・変換
    sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
      .forEach(node => this.transformPropertyAccess(node))
  }
  
  private transformPropertyAccess(node: PropertyAccessExpression): void {
    const text = node.getText()
    
    for (const rule of this.basicTransformations) {
      if (text.startsWith(rule.from)) {
        const expression = node.getExpression()
        if (Node.isIdentifier(expression) && expression.getText() === 'myzod') {
          expression.replaceWithText('z')
        }
        break
      }
    }
  }
}
```

### Phase 2: メソッドチェーン変換（Week 3-4）

#### 2.1 メソッド名変換
```typescript
// MethodTransformer.ts
export class MethodTransformer {
  private readonly methodTransformations = [
    { from: 'pattern', to: 'regex' },
    { from: 'map', to: 'transform' },
    { from: 'withPredicate', to: 'refine' },
    { from: 'try', to: 'safeParse' },
  ]
  
  transform(sourceFile: SourceFile): void {
    // CallExpression のメソッド呼び出しを変換
    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
      .forEach(callExpr => this.transformMethodCall(callExpr))
  }
  
  private transformMethodCall(callExpr: CallExpression): void {
    const expression = callExpr.getExpression()
    
    if (Node.isPropertyAccessExpression(expression)) {
      const methodName = expression.getName()
      const transformation = this.methodTransformations
        .find(t => t.from === methodName)
      
      if (transformation) {
        expression.getNameNode().replaceWithText(transformation.to)
      }
    }
  }
}
```

#### 2.2 特殊構文変換
```typescript
// 複雑な変換パターンの実装
export class ComplexTransformer {
  transformUnionOperator(sourceFile: SourceFile): void {
    // T.or(U) → z.union([T, U])
    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
      .forEach(callExpr => {
        if (this.isOrMethodCall(callExpr)) {
          this.convertToUnion(callExpr)
        }
      })
  }
  
  transformLiterals(sourceFile: SourceFile): void {
    // myzod.literals('a', 'b', 'c') → z.enum(['a', 'b', 'c'])
    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
      .forEach(callExpr => {
        if (this.isLiteralsCall(callExpr)) {
          this.convertToEnum(callExpr)
        }
      })
  }
}
```

### Phase 3: 型推論変換（Week 5）

#### 3.1 型推論変換
```typescript
// TypeTransformer.ts
export class TypeTransformer {
  transform(sourceFile: SourceFile): void {
    // Infer<typeof schema> → z.infer<typeof schema>
    sourceFile.getDescendantsOfKind(SyntaxKind.TypeReference)
      .forEach(typeRef => this.transformInferType(typeRef))
  }
  
  private transformInferType(typeRef: TypeReferenceNode): void {
    const typeName = typeRef.getTypeName()
    
    if (Node.isIdentifier(typeName) && typeName.getText() === 'Infer') {
      // Infer<T> を z.infer<T> に変換
      typeRef.replaceWithText(
        `z.infer<${typeRef.getTypeArguments()[0]?.getText()}>`
      )
    }
  }
}
```

### Phase 4: エラーハンドリング変換（Week 6）

#### 4.1 try()メソッド変換
```typescript
// ErrorHandlingTransformer.ts
export class ErrorHandlingTransformer {
  transform(sourceFile: SourceFile): void {
    // schema.try(data) の使用箇所を特定し、
    // safeParse() に変換 + エラーハンドリングパターンを更新
    
    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
      .forEach(callExpr => {
        if (this.isTryMethodCall(callExpr)) {
          this.transformTryToSafeParse(callExpr)
        }
      })
  }
  
  private transformTryToSafeParse(callExpr: CallExpression): void {
    // メソッド名を変更
    const propertyAccess = callExpr.getExpression() as PropertyAccessExpression
    propertyAccess.getNameNode().replaceWithText('safeParse')
    
    // 後続のエラーハンドリングパターンを検出・変更
    this.updateErrorHandlingPattern(callExpr)
  }
  
  private updateErrorHandlingPattern(callExpr: CallExpression): void {
    // if (result instanceof myzod.ValidationError)
    // ↓
    // if (!result.success)
    
    const parent = callExpr.getParent()
    // 複雑なパターンマッチングとAST変換を実装
  }
}
```

### Phase 5: 統合とCLI（Week 7-8）

#### 5.1 メインTransformer
```typescript
// index.ts
export class MyzodToZodTransformer {
  private transformers = [
    new ImportTransformer(),
    new SchemaTransformer(),
    new MethodTransformer(),
    new TypeTransformer(),
    new ErrorHandlingTransformer(),
  ]
  
  async transformProject(projectPath: string): Promise<TransformResult> {
    const project = new Project({
      tsConfigFilePath: path.join(projectPath, 'tsconfig.json'),
    })
    
    const sourceFiles = project.getSourceFiles()
    const results: FileTransformResult[] = []
    
    for (const sourceFile of sourceFiles) {
      if (this.shouldTransformFile(sourceFile)) {
        const result = await this.transformFile(sourceFile)
        results.push(result)
      }
    }
    
    return {
      totalFiles: results.length,
      successfulTransforms: results.filter(r => r.success).length,
      errors: results.filter(r => !r.success),
      details: results
    }
  }
  
  private async transformFile(sourceFile: SourceFile): Promise<FileTransformResult> {
    try {
      // 各transformerを順次実行
      for (const transformer of this.transformers) {
        transformer.transform(sourceFile)
      }
      
      // TypeScript コンパイルエラーをチェック
      const diagnostics = sourceFile.getPreEmitDiagnostics()
      
      if (diagnostics.length === 0) {
        await sourceFile.save()
        return { filePath: sourceFile.getFilePath(), success: true }
      } else {
        return { 
          filePath: sourceFile.getFilePath(), 
          success: false, 
          errors: diagnostics.map(d => d.getMessageText())
        }
      }
    } catch (error) {
      return { 
        filePath: sourceFile.getFilePath(), 
        success: false, 
        errors: [error.message] 
      }
    }
  }
}
```

#### 5.2 CLI実装
```typescript
// cli/index.ts
import { program } from 'commander'
import { MyzodToZodTransformer } from '../index'

program
  .name('myzod-to-zod')
  .description('Transform myzod code to zod v3')
  .version('1.0.0')

program
  .command('transform <path>')
  .description('Transform TypeScript files from myzod to zod')
  .option('-d, --dry-run', 'Preview changes without writing files')
  .option('-v, --verbose', 'Verbose output')
  .action(async (projectPath, options) => {
    const transformer = new MyzodToZodTransformer()
    
    console.log('🔄 Starting myzod to zod transformation...')
    
    const result = await transformer.transformProject(projectPath)
    
    console.log(`✅ Transformation complete!`)
    console.log(`📁 Files processed: ${result.totalFiles}`)
    console.log(`✅ Successful: ${result.successfulTransforms}`)
    console.log(`❌ Errors: ${result.errors.length}`)
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:')
      result.errors.forEach(error => {
        console.log(`  ${error.filePath}: ${error.errors.join(', ')}`)
      })
    }
  })

program.parse()
```

## テスト戦略

### Unit Tests
```typescript
// test/transformers/SchemaTransformer.test.ts
describe('SchemaTransformer', () => {
  it('should transform basic string schema', () => {
    const source = `const schema = myzod.string()`
    const expected = `const schema = z.string()`
    
    const result = transformCode(source)
    expect(result).toBe(expected)
  })
  
  it('should transform complex object schema', () => {
    const source = `
      const userSchema = myzod.object({
        name: myzod.string(),
        age: myzod.number().min(0)
      })
    `
    const expected = `
      const userSchema = z.object({
        name: z.string(),
        age: z.number().min(0)
      })
    `
    
    const result = transformCode(source)
    expect(result).toBe(expected)
  })
})
```

### Integration Tests
```typescript
// test/integration/full-transformation.test.ts
describe('Full Transformation', () => {
  it('should transform complete myzod file', async () => {
    const inputFile = 'test/fixtures/input/user-validation.ts'
    const expectedFile = 'test/fixtures/expected/user-validation.ts'
    
    const transformer = new MyzodToZodTransformer()
    await transformer.transformFile(inputFile)
    
    const result = await fs.readFile(inputFile, 'utf-8')
    const expected = await fs.readFile(expectedFile, 'utf-8')
    
    expect(result).toBe(expected)
  })
})
```

## パフォーマンス考慮事項

### 最適化戦略
1. **並列処理**: 複数ファイルの同時変換
2. **AST キャッシュ**: 同一プロジェクト内での再利用
3. **段階的処理**: 必要な箇所のみを変換
4. **メモリ管理**: 大規模プロジェクト対応

### パフォーマンス目標
- **小規模プロジェクト** (〜50ファイル): < 10秒
- **中規模プロジェクト** (〜500ファイル): < 1分
- **大規模プロジェクト** (〜5000ファイル): < 10分

## エラーハンドリング戦略

### エラーカテゴリ
1. **構文エラー**: TypeScript パースエラー
2. **変換エラー**: 未対応パターン
3. **型エラー**: 変換後の型不整合
4. **実行時エラー**: ファイルI/Oエラー

### 復旧戦略
1. **部分変換**: エラー箇所をスキップして継続
2. **ロールバック**: 元ファイルのバックアップ復元
3. **詳細ログ**: エラー原因の特定支援
4. **手動修正**: 修正すべき箇所の明示

## 配布・運用計画

### パッケージ配布
```json
{
  "name": "myzod-to-zod-codemod",
  "version": "1.0.0",
  "bin": {
    "myzod-to-zod": "./dist/cli/index.js"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

### 使用方法
```bash
# インストール
npm install -g myzod-to-zod-codemod

# 実行
myzod-to-zod transform ./src
myzod-to-zod transform ./src --dry-run
myzod-to-zod transform ./src --verbose
```

## 今後の拡張

### Phase 6+: 高度な機能
1. **設定ファイル対応**: カスタム変換ルール
2. **プラグインシステム**: サードパーティ拡張
3. **IDE統合**: VSCode拡張
4. **CI/CD統合**: 自動化ワークフロー

### メンテナンス計画
1. **zod新バージョン対応**: API変更への追従
2. **バグ修正**: ユーザーフィードバック対応
3. **パフォーマンス改善**: 継続的最適化
4. **ドキュメント更新**: 使用例の追加

---
*ts-morphを活用した実用的なcodemod実装計画*