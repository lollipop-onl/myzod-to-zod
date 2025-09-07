import { SourceFile, Node, SyntaxKind, CallExpression, PropertyAccessExpression, Project } from 'ts-morph';
import { collectMyzodImportDeclarations, getMyzodName } from './collect-imports.js';
import { isMyzodReference, getRootIdentifier } from './myzod-node.js';

/**
 * Migrates myzod code to zod v3 using AST transformations.
 */
export function migrateMyzodToZodV3(sourceFile: SourceFile): string {
    const myzodImports = collectMyzodImportDeclarations(sourceFile);
    
    if (myzodImports.length === 0) {
        // No myzod imports found, return original content
        return sourceFile.getFullText();
    }

    // Process each myzod import
    for (const importDeclaration of myzodImports) {
        const myzodName = getMyzodName(importDeclaration);
        
        // Transform import statement
        transformImportStatement(importDeclaration);
        
        // Transform all myzod references in the file
        transformMyzodReferences(sourceFile, myzodName);
    }

    return sourceFile.getFullText();
}

/**
 * Transforms myzod import statement to zod import
 */
function transformImportStatement(importDeclaration: any) {
    // Change module specifier from 'myzod' to 'zod'
    importDeclaration.setModuleSpecifier('zod');
    
    // Change default import to named import { z }
    const defaultImport = importDeclaration.getDefaultImport();
    if (defaultImport) {
        importDeclaration.removeDefaultImport();
        importDeclaration.addNamedImport('z');
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
    
    // Transform method calls (.withPredicate -> .refine, .map -> .transform)
    for (const callExpr of callExpressions) {
        const expression = callExpr.getExpression();
        
        if (Node.isPropertyAccessExpression(expression)) {
            const rootId = getRootIdentifier(expression);
            
            // Only transform if it's part of a myzod chain
            if (rootId === myzodName || rootId === 'z') {
                const methodName = expression.getName();
                
                // Transform method names
                switch (methodName) {
                    case 'withPredicate':
                        expression.getNameNode().replaceWithText('refine');
                        break;
                    case 'map':
                        expression.getNameNode().replaceWithText('transform');
                        break;
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