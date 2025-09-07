import { ImportDeclaration, SourceFile, SyntaxKind, Node } from 'ts-morph';

/**
 * Collects myzod import declarations from a source file
 */
export function collectMyzodImportDeclarations(sourceFile: SourceFile): ImportDeclaration[] {
    return sourceFile.getImportDeclarations().filter(importDeclaration => {
        const moduleSpecifier = importDeclaration.getModuleSpecifierValue();
        return moduleSpecifier === 'myzod';
    });
}

/**
 * Gets the imported myzod identifier name, defaults to 'myzod' if not aliased
 */
export function getMyzodName(importDeclaration: ImportDeclaration): string {
    const defaultImport = importDeclaration.getDefaultImport();
    return defaultImport?.getText() ?? 'myzod';
}

/**
 * Collects all references to myzod imports in the source file
 */
export function collectMyzodReferences(sourceFile: SourceFile, myzodName: string) {
    const identifiers = sourceFile.getDescendantsOfKind(SyntaxKind.Identifier)
        .filter(node => node.getText() === myzodName);

    // Filter out the import declaration itself
    return identifiers.filter(node => {
        const parent = node.getParent();
        return !parent || parent.getKind() !== SyntaxKind.ImportDeclaration;
    });
}