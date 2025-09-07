import { SourceFile, Node, SyntaxKind, CallExpression, PropertyAccessExpression, Project } from 'ts-morph';
import { collectMyzodImportDeclarations, getMyzodName, getMyzodNamedImports, hasNamedImports, collectNamedImportReferences } from './collect-imports.js';
import { isMyzodReference, getRootIdentifier } from './myzod-node.js';

export interface ManualMigrationIssue {
    type: 'try-method' | 'validation-error' | 'other';
    description: string;
    line?: number;
    snippet?: string;
}

export interface MigrationResult {
    content: string;
    manualIssues: ManualMigrationIssue[];
}

/**
 * Migrates myzod code to zod v3 using AST transformations.
 */
export function migrateMyzodToZodV3(sourceFile: SourceFile): string {
    const result = migrateMyzodToZodV3WithIssues(sourceFile);
    return result.content;
}

/**
 * Migrates myzod code to zod v3 and returns both content and manual migration issues.
 */
export function migrateMyzodToZodV3WithIssues(sourceFile: SourceFile): MigrationResult {
    const myzodImports = collectMyzodImportDeclarations(sourceFile);
    const manualIssues: ManualMigrationIssue[] = [];
    
    if (myzodImports.length === 0) {
        // No myzod imports found, return original content
        return {
            content: sourceFile.getFullText(),
            manualIssues: []
        };
    }

    // Check for manual migration issues before transformation
    detectManualMigrationIssues(sourceFile, manualIssues);

    // Process each myzod import
    for (const importDeclaration of myzodImports) {
        const myzodName = getMyzodName(importDeclaration);
        const namedImports = getMyzodNamedImports(importDeclaration);
        const hasNamed = hasNamedImports(importDeclaration);
        
        // Transform import statement
        transformImportStatement(importDeclaration);
        
        // First handle special transformations that require structural changes
        handleSpecialTransformations(sourceFile, myzodName);
        
        // Handle named imports transformations
        if (hasNamed) {
            handleNamedImportTransformations(sourceFile, namedImports);
        }
        
        // Transform type references
        transformTypeReferences(sourceFile, namedImports);
        
        // Then transform basic myzod references in the file
        transformMyzodReferences(sourceFile, myzodName);
    }

    return {
        content: sourceFile.getFullText(),
        manualIssues
    };
}

/**
 * Transforms myzod import statement to zod import
 */
function transformImportStatement(importDeclaration: any) {
    // Change module specifier from 'myzod' to 'zod'
    importDeclaration.setModuleSpecifier('zod');
    
    // Remove all existing imports (default and named)
    const defaultImport = importDeclaration.getDefaultImport();
    if (defaultImport) {
        importDeclaration.removeDefaultImport();
    }
    
    // Remove all named imports
    const namedImports = importDeclaration.getNamedImports();
    for (const namedImport of namedImports) {
        namedImport.remove();
    }
    
    // Add only { z } as named import
    importDeclaration.addNamedImport('z');
}

/**
 * Handles special transformations that require structural changes
 */
function handleSpecialTransformations(sourceFile: SourceFile, myzodName: string) {
    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
    
    // Collect special transformations first to avoid issues with node invalidation
    const coerceTransformations: { callExpr: CallExpression, typeName: string }[] = [];
    const literalsTransformations: { callExpr: CallExpression, args: string[] }[] = [];
    const enumTransformations: { callExpr: CallExpression, enumArg: string }[] = [];
    const collectErrorsTransformations: { callExpr: CallExpression }[] = [];
    const dictionaryTransformations: { callExpr: CallExpression, schemaArg: string }[] = [];
    
    for (const callExpr of callExpressions) {
        const expression = callExpr.getExpression();
        
        if (Node.isPropertyAccessExpression(expression)) {
            const rootId = getRootIdentifier(expression);
            
            // Only transform if it's part of a myzod chain
            if (rootId === myzodName) {
                const methodName = expression.getName();
                
                // Handle coerce transformation specially
                if (methodName === 'coerce') {
                    const baseExpression = expression.getExpression();
                    
                    // Check if base expression is a call expression (like myzod.number())
                    if (Node.isCallExpression(baseExpression)) {
                        const baseCallExpression = baseExpression.getExpression();
                        
                        if (Node.isPropertyAccessExpression(baseCallExpression)) {
                            const typeName = baseCallExpression.getName(); // e.g., 'number'
                            const rootExpression = baseCallExpression.getExpression(); // e.g., 'myzod'
                            
                            if (Node.isIdentifier(rootExpression) && rootExpression.getText() === myzodName) {
                                coerceTransformations.push({ callExpr, typeName });
                            }
                        }
                    }
                }
                
                // Handle literals transformation specially
                if (methodName === 'literals') {
                    const args = callExpr.getArguments();
                    const literalValues = args.map(arg => {
                        if (Node.isStringLiteral(arg)) {
                            return `"${arg.getLiteralValue()}"`;
                        }
                        return arg.getText();
                    });
                    
                    literalsTransformations.push({ callExpr, args: literalValues });
                }
                
                // Handle enum transformation specially
                if (methodName === 'enum') {
                    const args = callExpr.getArguments();
                    if (args.length === 1) {
                        const enumArg = args[0].getText();
                        enumTransformations.push({ callExpr, enumArg });
                    }
                }
                
                // Handle collectErrors transformation specially
                if (methodName === 'collectErrors') {
                    collectErrorsTransformations.push({ callExpr });
                }
                
                // Handle dictionary transformation specially
                if (methodName === 'dictionary') {
                    const args = callExpr.getArguments();
                    if (args.length === 1) {
                        const schemaArg = args[0].getText();
                        dictionaryTransformations.push({ callExpr, schemaArg });
                    }
                }
            }
        }
    }
    
    // Apply coerce transformations
    for (const { callExpr, typeName } of coerceTransformations) {
        const newExpression = `z.coerce.${typeName}()`;
        callExpr.replaceWithText(newExpression);
    }
    
    // Apply literals transformations
    for (const { callExpr, args } of literalsTransformations) {
        const literalUnions = args.map(arg => `z.literal(${arg})`).join(', ');
        const newExpression = `z.union([${literalUnions}])`;
        callExpr.replaceWithText(newExpression);
    }
    
    // Apply enum transformations
    for (const { callExpr, enumArg } of enumTransformations) {
        const newExpression = `z.nativeEnum(${enumArg})`;
        callExpr.replaceWithText(newExpression);
    }
    
    // Apply collectErrors transformations (remove the method call)
    for (const { callExpr } of collectErrorsTransformations) {
        const expression = callExpr.getExpression();
        if (Node.isPropertyAccessExpression(expression)) {
            const baseExpression = expression.getExpression();
            callExpr.replaceWithText(baseExpression.getText());
        }
    }
    
    // Apply dictionary transformations (dictionary -> record with optional handling)
    for (const { callExpr, schemaArg } of dictionaryTransformations) {
        // Check if the schema argument already has .optional()
        const hasOptional = schemaArg.includes('.optional()');
        
        let recordArg: string;
        if (hasOptional) {
            // Already optional, use as-is
            recordArg = schemaArg;
        } else {
            // Not optional, wrap with .optional()
            recordArg = `${schemaArg}.optional()`;
        }
        
        const newExpression = `z.record(${recordArg})`;
        callExpr.replaceWithText(newExpression);
    }
}

/**
 * Handles transformations for named imports from myzod
 */
function handleNamedImportTransformations(sourceFile: SourceFile, namedImports: string[]) {
    const references = collectNamedImportReferences(sourceFile, namedImports);
    
    for (const { name, nodes } of references) {
        for (const node of nodes) {
            const parent = node.getParent();
            
            // Handle function calls like string(), literals(), etc.
            if (Node.isCallExpression(parent) && parent.getExpression() === node) {
                switch (name) {
                    case 'string':
                    case 'number':
                    case 'boolean':
                    case 'object':
                    case 'array':
                    case 'union':
                    case 'tuple':
                    case 'record':
                    case 'literal':
                        // Basic types: string() -> z.string()
                        node.replaceWithText(`z.${name}`);
                        break;
                    case 'literals':
                        // Handle literals specially - transform to union of literals
                        const literalsCall = parent as CallExpression;
                        const args = literalsCall.getArguments();
                        const literalValues = args.map(arg => {
                            if (Node.isStringLiteral(arg)) {
                                return `"${arg.getLiteralValue()}"`;
                            }
                            return arg.getText();
                        });
                        const literalUnions = literalValues.map(val => `z.literal(${val})`).join(', ');
                        literalsCall.replaceWithText(`z.union([${literalUnions}])`);
                        break;
                }
            }
            
            // Handle type references like Infer<T>
            else if (Node.isTypeReference(parent) && parent.getTypeName() === node) {
                if (name === 'Infer') {
                    const typeArgs = parent.getTypeArguments();
                    if (typeArgs.length === 1) {
                        const schemaType = typeArgs[0].getText();
                        parent.replaceWithText(`z.infer<typeof ${schemaType.replace(/typeof\s+/, '')}>`);
                    }
                }
            }
        }
    }
}

/**
 * Transforms type references: myzod.Infer<T> -> z.infer<typeof T>
 */
function transformTypeReferences(sourceFile: SourceFile, namedImports: string[] = []) {
    const typeReferences = sourceFile.getDescendantsOfKind(SyntaxKind.TypeReference);
    
    for (const typeRef of typeReferences) {
        const typeName = typeRef.getTypeName();
        
        // Handle myzod.Infer<T> pattern
        if (Node.isQualifiedName(typeName)) {
            const left = typeName.getLeft();
            const right = typeName.getRight();
            
            if (Node.isIdentifier(left) && left.getText() === 'myzod' && 
                Node.isIdentifier(right) && right.getText() === 'Infer') {
                
                const typeArgs = typeRef.getTypeArguments();
                if (typeArgs.length === 1) {
                    const schemaType = typeArgs[0].getText();
                    // Replace myzod.Infer<typeof schema> with z.infer<typeof schema>
                    typeRef.replaceWithText(`z.infer<typeof ${schemaType.replace(/typeof\s+/, '')}>`);
                }
            }
        }
    }
}

/**
 * Transforms all myzod references to zod in the source file
 */
function transformMyzodReferences(sourceFile: SourceFile, myzodName: string) {
    // Find all property access expressions and call expressions
    const propertyAccesses = sourceFile.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression);
    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
    
    // Transform property access expressions (myzod.string -> z.string)
    for (const propAccess of propertyAccesses) {
        if (isMyzodReference(propAccess, myzodName)) {
            const expression = propAccess.getExpression();
            if (Node.isIdentifier(expression) && expression.getText() === myzodName) {
                expression.replaceWithText('z');
            }
        }
    }
    
    // Transform method calls (.withPredicate -> .refine, .map -> .transform, .coerce -> z.coerce.type)
    for (const callExpr of callExpressions) {
        const expression = callExpr.getExpression();
        
        if (Node.isPropertyAccessExpression(expression)) {
            const rootId = getRootIdentifier(expression);
            
            // Only transform if it's part of a myzod chain
            if (rootId === myzodName || rootId === 'z') {
                const methodName = expression.getName();
                
                // Skip coerce, literals, enum, collectErrors, and dictionary - already handled in special transformations
                if (methodName === 'coerce' || methodName === 'literals' || methodName === 'enum' || methodName === 'collectErrors' || methodName === 'dictionary') {
                    continue;
                }
                
                // Transform method names
                switch (methodName) {
                    case 'withPredicate':
                        expression.getNameNode().replaceWithText('refine');
                        break;
                    case 'map':
                        expression.getNameNode().replaceWithText('transform');
                        break;
                    case 'pattern':
                        expression.getNameNode().replaceWithText('regex');
                        break;
                }
            }
        }
    }
}


/**
 * Detects patterns that require manual migration
 */
function detectManualMigrationIssues(sourceFile: SourceFile, issues: ManualMigrationIssue[]) {
    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
    
    for (const callExpr of callExpressions) {
        const expression = callExpr.getExpression();
        
        // Check for .try() method calls
        if (Node.isPropertyAccessExpression(expression)) {
            const methodName = expression.getName();
            
            if (methodName === 'try') {
                const lineNumber = callExpr.getStartLineNumber();
                const snippet = callExpr.getText();
                
                issues.push({
                    type: 'try-method',
                    description: 'Replace .try() with .safeParse()',
                    line: lineNumber,
                    snippet: snippet
                });
            }
        }
        
        // Check for ValidationError references
        const identifiers = callExpr.getDescendantsOfKind(SyntaxKind.Identifier);
        for (const identifier of identifiers) {
            if (identifier.getText() === 'ValidationError') {
                const parent = identifier.getParent();
                if (Node.isPropertyAccessExpression(parent)) {
                    const rootId = getRootIdentifier(parent);
                    if (rootId === 'myzod') {
                        const lineNumber = identifier.getStartLineNumber();
                        const snippet = parent.getText();
                        
                        issues.push({
                            type: 'validation-error',
                            description: 'Update ValidationError handling to use result.success pattern',
                            line: lineNumber,
                            snippet: snippet
                        });
                    }
                }
            }
        }
    }
    
    // Check for myzod.ValidationError in type references and instanceof checks
    const typeReferences = sourceFile.getDescendantsOfKind(SyntaxKind.TypeReference);
    for (const typeRef of typeReferences) {
        const typeName = typeRef.getTypeName();
        if (Node.isQualifiedName(typeName)) {
            const left = typeName.getLeft();
            const right = typeName.getRight();
            
            if (Node.isIdentifier(left) && left.getText() === 'myzod' && 
                Node.isIdentifier(right) && right.getText() === 'ValidationError') {
                
                const lineNumber = typeRef.getStartLineNumber();
                const snippet = typeRef.getText();
                
                issues.push({
                    type: 'validation-error',
                    description: 'Update ValidationError type references for zod error handling',
                    line: lineNumber,
                    snippet: snippet
                });
            }
        }
    }
    
    // Check for instanceof ValidationError patterns
    const binaryExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression);
    for (const binExpr of binaryExpressions) {
        if (binExpr.getOperatorToken().getKind() === SyntaxKind.InstanceOfKeyword) {
            const right = binExpr.getRight();
            if (Node.isPropertyAccessExpression(right)) {
                const rootId = getRootIdentifier(right);
                const propName = right.getName();
                
                if (rootId === 'myzod' && propName === 'ValidationError') {
                    const lineNumber = binExpr.getStartLineNumber();
                    const snippet = binExpr.getText();
                    
                    issues.push({
                        type: 'validation-error',
                        description: 'Replace instanceof ValidationError with !result.success pattern',
                        line: lineNumber,
                        snippet: snippet
                    });
                }
            }
        }
    }
}

/**
 * Convenience function for direct string transformation (used by tests)
 */
export function convertMyzodToZodV3String(myzodCode: string): string {
    // Create a temporary source file for AST processing
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile('temp.ts', myzodCode);
    
    return migrateMyzodToZodV3(sourceFile);
}