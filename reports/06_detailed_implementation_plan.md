# myzod-to-zod codemod 詳細実装計画

## 概要

zod-v3-to-v4 codemod の優れた設計パターンを参考に、テスト駆動開発による堅牢な myzod-to-zod 変換ツールを実装する。

### 参考実装からの学習ポイント

- **モジュラー関数型アプローチ**: 各変換を独立した純粋関数で実装
- **段階的変換**: `collectReferences` → 各種transformer関数の順次実行
- **エラー耐性**: ファイル単位でtry-catch、継続可能な処理
- **テスタブル設計**: 小さな単一責任関数への分割

## プロジェクト構造

```
src/
├── transformers/
│   ├── __tests__/              # 各transformer単体テスト
│   │   ├── import.test.ts
│   │   ├── schema.test.ts
│   │   ├── method.test.ts
│   │   ├── type.test.ts
│   │   └── error-handling.test.ts
│   ├── import.ts               # import文変換
│   ├── schema.ts               # 基本スキーマ変換  
│   ├── method.ts               # メソッドチェーン変換
│   ├── type.ts                 # 型推論変換
│   ├── error-handling.ts       # エラーハンドリング変換
│   └── index.ts                # transformer統合
├── utils/
│   ├── __tests__/
│   │   ├── ast-utils.test.ts
│   │   └── pattern-matcher.test.ts
│   ├── ast-utils.ts            # AST操作ヘルパー
│   ├── pattern-matcher.ts      # パターンマッチング
│   └── validation.ts           # 変換後検証
├── cli/
│   └── index.ts                # CLI実装
├── migrate.ts                  # メイン変換ロジック
└── index.ts                    # エントリーポイント

test/
├── fixtures/
│   ├── input/                  # 変換前のテストケース
│   │   ├── basic-schemas.ts
│   │   ├── complex-object.ts
│   │   ├── method-chains.ts
│   │   ├── error-handling.ts
│   │   └── real-world-example.ts
│   └── expected/               # 期待される変換結果
│       ├── basic-schemas.ts
│       ├── complex-object.ts
│       ├── method-chains.ts
│       ├── error-handling.ts
│       └── real-world-example.ts
├── integration/
│   └── full-transformation.test.ts
└── unit/
    └── transformers/
```

## Phase 1: 基礎実装（1-2週間）

### 1.1 Import変換の実装

```typescript
// src/transformers/import.ts
export function transformMyzodImports(sourceFile: SourceFile): void {
  const myzodImports = collectMyzodImports(sourceFile)
  
  for (const importDecl of myzodImports) {
    replaceImportDeclaration(importDecl)
  }
}

function collectMyzodImports(sourceFile: SourceFile): ImportDeclaration[] {
  return sourceFile.getImportDeclarations()
    .filter(imp => imp.getModuleSpecifierValue() === 'myzod')
}

function replaceImportDeclaration(importDecl: ImportDeclaration): void {
  // "import myzod, { Infer } from 'myzod'" 
  // → "import { z } from 'zod'"
  
  importDecl.setModuleSpecifier('zod')
  importDecl.removeDefaultImport()
  importDecl.addNamedImport('z')
  
  // Infer import削除（後でz.inferに変換）
  importDecl.getNamedImports()
    .filter(named => named.getName() === 'Infer')
    .forEach(named => named.remove())
}
```

### 1.2 テスト駆動開発アプローチ

```typescript
// src/transformers/__tests__/import.test.ts
import { describe, it, expect } from 'vitest'
import { Project } from 'ts-morph'
import { transformMyzodImports } from '../import'

describe('Import Transformer', () => {
  function transform(input: string): string {
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', input)
    
    transformMyzodImports(sourceFile)
    
    return sourceFile.getFullText()
  }
  
  it('should transform basic myzod import', () => {
    const input = `import myzod from 'myzod'`
    const expected = `import { z } from 'zod'`
    
    expect(transform(input)).toBe(expected)
  })
  
  it('should transform import with Infer', () => {
    const input = `import myzod, { Infer } from 'myzod'`
    const expected = `import { z } from 'zod'`
    
    expect(transform(input)).toBe(expected)
  })
  
  it('should handle multiple imports correctly', () => {
    const input = `
      import myzod from 'myzod'
      import { other } from 'other-lib'
    `
    const expected = `
      import { z } from 'zod'
      import { other } from 'other-lib'
    `
    
    expect(transform(input)).toBe(expected)
  })
  
  it('should preserve other named imports', () => {
    const input = `import myzod, { Infer, Type } from 'myzod'`
    const expected = `import { z, Type } from 'zod'`
    
    expect(transform(input)).toBe(expected)
  })
})
```

## Phase 2: スキーマ変換（2-3週間）

### 2.1 基本スキーマ変換実装

```typescript
// src/transformers/schema.ts
export function transformSchemaDefinitions(sourceFile: SourceFile): void {
  const myzodReferences = collectMyzodReferences(sourceFile)
  
  for (const reference of myzodReferences) {
    transformSchemaReference(reference)
  }
}

function collectMyzodReferences(sourceFile: SourceFile): PropertyAccessExpression[] {
  return sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
    .filter(prop => {
      const expression = prop.getExpression()
      return Node.isIdentifier(expression) && expression.getText() === 'myzod'
    })
}

function transformSchemaReference(reference: PropertyAccessExpression): void {
  const methodName = reference.getName()
  const transformation = SCHEMA_TRANSFORMATIONS[methodName]
  
  if (transformation) {
    // myzod → z に変更
    const expression = reference.getExpression()
    if (Node.isIdentifier(expression)) {
      expression.replaceWithText('z')
    }
    
    // メソッド名変更（必要に応じて）
    if (transformation.newName) {
      reference.getNameNode().replaceWithText(transformation.newName)
    }
    
    // 特殊変換処理
    if (transformation.transform) {
      transformation.transform(reference)
    }
  }
}

const SCHEMA_TRANSFORMATIONS = {
  string: { newName: 'string' },
  number: { newName: 'number' },
  boolean: { newName: 'boolean' },
  object: { newName: 'object' },
  array: { newName: 'array' },
  literals: { 
    newName: 'enum',
    transform: transformLiteralsToEnum
  },
  dictionary: {
    // 複雑な変換が必要
    transform: transformDictionaryToRecord
  }
} as const

function transformLiteralsToEnum(reference: PropertyAccessExpression): void {
  // myzod.literals('active', 'inactive') 
  // → z.enum(['active', 'inactive'])
  const parent = reference.getParent()
  if (Node.isCallExpression(parent)) {
    const args = parent.getArguments()
    const enumValues = args.map(arg => arg.getText()).join(', ')
    parent.replaceWithText(`z.enum([${enumValues}])`)
  }
}

function transformDictionaryToRecord(reference: PropertyAccessExpression): void {
  // myzod.dictionary(valueSchema)
  // → z.record(z.string(), valueSchema) 
  const parent = reference.getParent()
  if (Node.isCallExpression(parent)) {
    const args = parent.getArguments()
    if (args.length === 1) {
      const valueSchema = args[0].getText()
      parent.replaceWithText(`z.record(z.string(), ${valueSchema})`)
    }
  }
}
```

### 2.2 複雑なスキーマ変換のテスト

```typescript
// src/transformers/__tests__/schema.test.ts
describe('Schema Transformer', () => {
  function transform(input: string): string {
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', input)
    
    transformSchemaDefinitions(sourceFile)
    
    return sourceFile.getFullText()
  }
  
  it('should transform basic types', () => {
    const input = `
      const stringSchema = myzod.string()
      const numberSchema = myzod.number()
      const booleanSchema = myzod.boolean()
    `
    const expected = `
      const stringSchema = z.string()
      const numberSchema = z.number()
      const booleanSchema = z.boolean()
    `
    
    expect(transform(input)).toBe(expected)
  })
  
  it('should transform object schema', () => {
    const input = `
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
    
    expect(transform(input)).toBe(expected)
  })
  
  it('should transform literals to enum', () => {  
    const input = `const status = myzod.literals('active', 'inactive')`
    const expected = `const status = z.enum(['active', 'inactive'])`
    
    expect(transform(input)).toBe(expected)
  })
  
  it('should transform dictionary to record', () => {
    const input = `const dict = myzod.dictionary(myzod.string())`
    const expected = `const dict = z.record(z.string(), z.string())`
    
    expect(transform(input)).toBe(expected)
  })
  
  it('should handle nested schemas', () => {
    const input = `
      const nestedSchema = myzod.object({
        user: myzod.object({
          profile: myzod.object({
            name: myzod.string()
          })
        })
      })
    `
    
    const result = transform(input)
    expect(result).toContain('z.object')
    expect(result).not.toContain('myzod')
  })
})
```

## Phase 3: メソッドチェーン変換（3-4週間）

### 3.1 メソッドチェーン変換実装

```typescript
// src/transformers/method.ts
export function transformMethodChains(sourceFile: SourceFile): void {
  const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
  
  for (const callExpr of callExpressions) {
    transformMethodCall(callExpr)
  }
}

function transformMethodCall(callExpr: CallExpression): void {
  const expression = callExpr.getExpression()
  
  if (Node.isPropertyAccessExpression(expression)) {
    const methodName = expression.getName()
    const transformation = METHOD_TRANSFORMATIONS[methodName]
    
    if (transformation) {
      if (transformation.newName) {
        expression.getNameNode().replaceWithText(transformation.newName)
      }
      
      if (transformation.transformArgs) {
        transformation.transformArgs(callExpr)
      }
      
      if (transformation.transform) {
        transformation.transform(callExpr)
      }
    }
  }
}

const METHOD_TRANSFORMATIONS = {
  pattern: { 
    newName: 'regex',
    transform: transformPatternToRegex
  },
  map: { newName: 'transform' },
  withPredicate: { 
    newName: 'refine',
    transformArgs: transformPredicateArgs
  },
  try: { 
    newName: 'safeParse',
    // エラーハンドリングも同時に変換が必要
  },
  or: {
    transform: transformOrToUnion
  },
  allowUnknownKeys: {
    newName: 'passthrough'
  }
} as const

function transformPatternToRegex(callExpr: CallExpression): void {
  // .pattern(/regex/) → .regex(/regex/)
  // .pattern('string') → .regex(new RegExp('string'))
  const args = callExpr.getArguments()
  if (args.length === 1) {
    const arg = args[0]
    if (Node.isStringLiteral(arg)) {
      const pattern = arg.getLiteralValue()
      arg.replaceWithText(`new RegExp('${pattern}')`)
    }
  }
}

function transformPredicateArgs(callExpr: CallExpression): void {
  // withPredicate(fn, message) → refine(fn, { message })
  const args = callExpr.getArguments()
  if (args.length === 2) {
    const [predicate, message] = args
    callExpr.removeArgument(1)
    callExpr.addArgument(`{ message: ${message.getText()} }`)
  }
}

function transformOrToUnion(callExpr: CallExpression): void {
  // schema.or(other) → z.union([schema, other])
  const expression = callExpr.getExpression()
  if (Node.isPropertyAccessExpression(expression)) {
    const baseSchema = expression.getExpression().getText()
    const args = callExpr.getArguments()
    if (args.length === 1) {
      const otherSchema = args[0].getText()
      callExpr.replaceWithText(`z.union([${baseSchema}, ${otherSchema}])`)
    }
  }
}
```

### 3.2 メソッドチェーンのテスト

```typescript
// src/transformers/__tests__/method.test.ts
describe('Method Transformer', () => {
  it('should transform pattern to regex', () => {
    const input = `const schema = z.string().pattern(/test/)`
    const expected = `const schema = z.string().regex(/test/)`
    
    expect(transform(input)).toBe(expected)
  })
  
  it('should transform string pattern to regex constructor', () => {
    const input = `const schema = z.string().pattern('test')`
    const expected = `const schema = z.string().regex(new RegExp('test'))`
    
    expect(transform(input)).toBe(expected)
  })
  
  it('should transform withPredicate to refine', () => {
    const input = `const schema = z.number().withPredicate(n => n > 0, 'Must be positive')`
    const expected = `const schema = z.number().refine(n => n > 0, { message: 'Must be positive' })`
    
    expect(transform(input)).toBe(expected)
  })
  
  it('should transform or to union', () => {
    const input = `const schema = stringSchema.or(numberSchema)`
    const expected = `const schema = z.union([stringSchema, numberSchema])`
    
    expect(transform(input)).toBe(expected)
  })
  
  it('should handle complex method chains', () => {
    const input = `
      const schema = myzod.string()
        .pattern(/test/)
        .withPredicate(s => s.length > 5, 'Too short')
        .or(myzod.number())
    `
    
    const result = transform(input)
    expect(result).toContain('z.union')
    expect(result).toContain('refine')
    expect(result).toContain('regex')
  })
})
```

## Phase 4: 型推論変換（4週間目）

### 4.1 型推論変換実装

```typescript
// src/transformers/type.ts
export function transformTypeInferences(sourceFile: SourceFile): void {
  // Infer<typeof schema> → z.infer<typeof schema>
  const typeReferences = sourceFile.getDescendantsOfKind(SyntaxKind.TypeReference)
  
  for (const typeRef of typeReferences) {
    transformInferType(typeRef)
  }
}

function transformInferType(typeRef: TypeReferenceNode): void {
  const typeName = typeRef.getTypeName()
  
  if (Node.isIdentifier(typeName) && typeName.getText() === 'Infer') {
    const typeArgs = typeRef.getTypeArguments()
    if (typeArgs.length === 1) {
      const schemaType = typeArgs[0].getText()
      typeRef.replaceWithText(`z.infer<${schemaType}>`)
    }
  }
}
```

### 4.2 型推論変換のテスト

```typescript
// src/transformers/__tests__/type.test.ts
describe('Type Transformer', () => {
  it('should transform Infer to z.infer', () => {
    const input = `type User = Infer<typeof userSchema>`
    const expected = `type User = z.infer<typeof userSchema>`
    
    expect(transform(input)).toBe(expected)
  })
  
  it('should handle complex type expressions', () => {
    const input = `
      type ComplexType = {
        user: Infer<typeof userSchema>
        settings: Infer<typeof settingsSchema>
      }
    `
    const expected = `
      type ComplexType = {
        user: z.infer<typeof userSchema>
        settings: z.infer<typeof settingsSchema>
      }
    `
    
    expect(transform(input)).toBe(expected)
  })
})
```

## Phase 5: エラーハンドリング変換（5週間目）

### 5.1 エラーハンドリング変換実装

```typescript
// src/transformers/error-handling.ts
export function transformErrorHandling(sourceFile: SourceFile): void {
  // schema.try(data) の使用箇所を特定し、
  // safeParse() に変換 + エラーハンドリングパターンを更新
  
  const tryCallExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter(callExpr => isTryMethodCall(callExpr))
  
  for (const callExpr of tryCallExpressions) {
    transformTryToSafeParse(callExpr)
  }
}

function isTryMethodCall(callExpr: CallExpression): boolean {
  const expression = callExpr.getExpression()
  return Node.isPropertyAccessExpression(expression) && 
         expression.getName() === 'try'
}

function transformTryToSafeParse(callExpr: CallExpression): void {
  // メソッド名を変更
  const propertyAccess = callExpr.getExpression() as PropertyAccessExpression
  propertyAccess.getNameNode().replaceWithText('safeParse')
  
  // 後続のエラーハンドリングパターンを検出・変更
  updateErrorHandlingPattern(callExpr)
}

function updateErrorHandlingPattern(callExpr: CallExpression): void {
  // if (result instanceof myzod.ValidationError)
  // ↓
  // if (!result.success)
  
  const variableStatement = findVariableAssignment(callExpr)
  if (variableStatement) {
    const varName = getVariableName(variableStatement)
    updateInstanceofChecks(callExpr.getSourceFile(), varName)
  }
}

function updateInstanceofChecks(sourceFile: SourceFile, varName: string): void {
  const binaryExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression)
    .filter(expr => 
      expr.getOperatorToken().getKind() === SyntaxKind.InstanceOfKeyword &&
      expr.getLeft().getText() === varName
    )
  
  for (const expr of binaryExpressions) {
    const right = expr.getRight().getText()
    if (right.includes('ValidationError')) {
      expr.replaceWithText(`!${varName}.success`)
    }
  }
}
```

## Phase 6: 統合とCLI（6週間目）

### 6.1 メイン変換関数

```typescript
// src/migrate.ts（zod-v3-to-v4パターンを参考）
import { SourceFile } from 'ts-morph'
import { transformMyzodImports } from './transformers/import'
import { transformSchemaDefinitions } from './transformers/schema'
import { transformMethodChains } from './transformers/method'
import { transformTypeInferences } from './transformers/type'
import { transformErrorHandling } from './transformers/error-handling'

export function migrateSourceFile(sourceFile: SourceFile): void {
  // 順序重要: import → schema → method → type → error-handling
  transformMyzodImports(sourceFile)
  transformSchemaDefinitions(sourceFile)
  transformMethodChains(sourceFile)
  transformTypeInferences(sourceFile)
  transformErrorHandling(sourceFile)
}

export function transformMyzodToZod(input: string): string {
  const project = new Project({ useInMemoryFileSystem: true })
  const sourceFile = project.createSourceFile('temp.ts', input)
  
  migrateSourceFile(sourceFile)
  
  return sourceFile.getFullText()
}
```

### 6.2 実行戦略の最適化

```typescript
// src/index.ts
import { Project } from 'ts-morph'
import { join } from 'path'
import { migrateSourceFile } from './migrate'

export interface MigrationResult {
  totalFiles: number
  successfulTransforms: number
  failedTransforms: FileResult[]
  results: FileResult[]
}

export interface FileResult {
  filePath: string
  success: boolean
  errors: string[]
}

export async function runMigration(projectPath: string): Promise<MigrationResult> {
  const project = new Project({
    tsConfigFilePath: join(projectPath, 'tsconfig.json'),
  })
  
  const sourceFiles = project.getSourceFiles()
    .filter(shouldTransformFile)
  
  const results: FileResult[] = []
  
  // ファイル単位でエラー耐性のある処理
  for (const sourceFile of sourceFiles) {
    try {
      migrateSourceFile(sourceFile)
      
      // TypeScript診断でエラー確認
      const diagnostics = sourceFile.getPreEmitDiagnostics()
      
      results.push({
        filePath: sourceFile.getFilePath(),
        success: diagnostics.length === 0,
        errors: diagnostics.map(d => d.getMessageText().toString())
      })
    } catch (error) {
      results.push({
        filePath: sourceFile.getFilePath(),
        success: false,
        errors: [error.message]
      })
    }
  }
  
  // 成功したファイルのみ保存
  const successfulFiles = results.filter(r => r.success)
  if (successfulFiles.length > 0) {
    await project.save()
  }
  
  return {
    totalFiles: sourceFiles.length,
    successfulTransforms: successfulFiles.length,
    failedTransforms: results.filter(r => !r.success),
    results
  }
}

function shouldTransformFile(sourceFile: SourceFile): boolean {
  const content = sourceFile.getFullText()
  return content.includes('myzod') && 
         !sourceFile.getFilePath().includes('node_modules') &&
         !sourceFile.getFilePath().includes('.d.ts')
}
```

### 6.3 CLI実装

```typescript
// src/cli/index.ts
import { program } from 'commander'
import { runMigration } from '../index'
import chalk from 'chalk'

program
  .name('myzod-to-zod')
  .description('Transform myzod code to zod v3')
  .version('1.0.0')

program
  .command('transform <path>')
  .description('Transform TypeScript files from myzod to zod')
  .option('-d, --dry-run', 'Preview changes without writing files')
  .option('-v, --verbose', 'Verbose output')
  .action(async (projectPath: string, options) => {
    console.log(chalk.blue('🔄 Starting myzod to zod transformation...'))
    
    try {
      const result = await runMigration(projectPath)
      
      console.log(chalk.green('✅ Transformation complete!'))
      console.log(`📁 Files processed: ${result.totalFiles}`)
      console.log(`✅ Successful: ${result.successfulTransforms}`)
      console.log(`❌ Errors: ${result.failedTransforms.length}`)
      
      if (result.failedTransforms.length > 0) {
        console.log(chalk.red('\n❌ Errors:'))
        result.failedTransforms.forEach(error => {
          console.log(`  ${error.filePath}: ${error.errors.join(', ')}`)
        })
      }
      
      if (options.verbose) {
        console.log(chalk.gray('\n📊 Detailed Results:'))
        result.results.forEach(r => {
          const status = r.success ? chalk.green('✅') : chalk.red('❌')
          console.log(`  ${status} ${r.filePath}`)
          if (!r.success && r.errors.length > 0) {
            r.errors.forEach(err => console.log(`    ${chalk.red(err)}`))
          }
        })
      }
    } catch (error) {
      console.error(chalk.red('❌ Migration failed:'), error.message)
      process.exit(1)
    }
  })

program.parse()
```

## 統合テスト戦略

### Fixture ベースの統合テスト

```typescript
// test/integration/full-transformation.test.ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { transformMyzodToZod } from '../../src/migrate'
import { Project } from 'ts-morph'

describe('Full Transformation Integration', () => {
  const fixturesDir = join(__dirname, '../fixtures')
  
  const testCases = [
    'basic-schemas',
    'complex-object', 
    'method-chains',
    'error-handling',
    'real-world-example'
  ]
  
  testCases.forEach(testCase => {
    it(`should transform ${testCase} correctly`, () => {
      const inputPath = join(fixturesDir, 'input', `${testCase}.ts`)
      const expectedPath = join(fixturesDir, 'expected', `${testCase}.ts`)
      
      const input = readFileSync(inputPath, 'utf-8')
      const expected = readFileSync(expectedPath, 'utf-8')
      
      const result = transformMyzodToZod(input)
      
      expect(result.trim()).toBe(expected.trim())
    })
  })
  
  it('should handle TypeScript compilation after transformation', () => {
    const input = readFileSync(
      join(fixturesDir, 'input/real-world-example.ts'), 
      'utf-8'
    )
    
    const result = transformMyzodToZod(input)
    
    // TypeScript コンパイルエラーがないことを確認
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('test.ts', result)
    const diagnostics = sourceFile.getPreEmitDiagnostics()
    
    expect(diagnostics).toHaveLength(0)
  })
  
  it('should preserve code formatting', () => {
    const input = `
      // Comment preserved
      const schema = myzod.object({
        name: myzod.string(),
        age: myzod.number()
      })
      
      type User = Infer<typeof schema>
    `
    
    const result = transformMyzodToZod(input)
    
    expect(result).toContain('// Comment preserved')
    expect(result).toContain('z.object')
    expect(result).toContain('z.infer<typeof schema>')
  })
})
```

### テストフィクスチャ例

```typescript
// test/fixtures/input/basic-schemas.ts
import myzod, { Infer } from 'myzod'

const stringSchema = myzod.string()
const numberSchema = myzod.number().min(0)
const booleanSchema = myzod.boolean()
const arraySchema = myzod.array(myzod.string())

const objectSchema = myzod.object({
  name: myzod.string(),
  age: myzod.number(),
  active: myzod.boolean().optional()
})

const literalsSchema = myzod.literals('active', 'inactive', 'pending')
const dictionarySchema = myzod.dictionary(myzod.string())

type User = Infer<typeof objectSchema>
type Status = Infer<typeof literalsSchema>
```

```typescript
// test/fixtures/expected/basic-schemas.ts
import { z } from 'zod'

const stringSchema = z.string()
const numberSchema = z.number().min(0)
const booleanSchema = z.boolean()
const arraySchema = z.array(z.string())

const objectSchema = z.object({
  name: z.string(),
  age: z.number(),
  active: z.boolean().optional()
})

const literalsSchema = z.enum(['active', 'inactive', 'pending'])
const dictionarySchema = z.record(z.string(), z.string())

type User = z.infer<typeof objectSchema>
type Status = z.infer<typeof literalsSchema>
```

## 即座に開始可能な実装ステップ

### Day 1: プロジェクトセットアップ
```bash
# ディレクトリ構造作成
mkdir -p src/{transformers/{__tests__},utils/{__tests__},cli}
mkdir -p test/{fixtures/{input,expected},integration}

# 依存関係追加
npm install --save-dev commander chalk @types/node
```

### Day 1-2: Import変換の実装・テスト
1. `src/transformers/import.ts` 実装
2. `src/transformers/__tests__/import.test.ts` 作成
3. 基本的なtest-driven developmentサイクル確立

### Day 3-7: Schema変換の段階的実装
1. 基本型変換から開始
2. 複雑なオブジェクト・配列変換
3. エッジケースの網羅的テスト

### Day 5-7: 統合テスト環境構築
1. fixture ファイル作成
2. 実際のmyzodコードサンプル収集
3. 期待される変換結果の手動作成

## 推奨開発フロー

### Red-Green-Refactor サイクル
1. **Red**: 失敗するテストを先に書く
2. **Green**: 最小実装でテストを通す  
3. **Refactor**: リファクタリングで品質向上

### Transformer単位の独立開発
- 各transformerを完全に独立してテスト
- 統合テストで全体動作を検証
- エラー耐性のある設計

### 実用性重視の段階的リリース
- 70%変換できれば十分価値のあるツール
- 完璧を目指さず、実用的な完成度を目標

## 期待される自動化率

| Phase | 機能 | 自動化率 | 備考 |
|-------|------|----------|------|
| 1 | Import変換 | 100% | 直接的な置換 |
| 2 | 基本スキーマ | 95% | 大部分は直接対応 |
| 3 | メソッドチェーン | 85% | 一部複雑な変換 |
| 4 | 型推論 | 100% | 直接的な置換 |
| 5 | エラーハンドリング | 60% | 構造的な違い |

**総合自動化率: 90-95%**

この実装計画により、zod-v3-to-v4の優れた設計パターンを踏襲しつつ、単体テストで確実に検証可能な堅牢なcodemodが実装できます。

---
*実装計画策定日: 2025-09-07*
*参考実装: zod-v3-to-v4 codemod*