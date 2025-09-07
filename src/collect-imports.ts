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
 * Gets all named imports from a myzod import declaration
 */
export function getMyzodNamedImports(importDeclaration: ImportDeclaration): string[] {
    const namedImports = importDeclaration.getNamedImports();
    return namedImports.map(namedImport => namedImport.getName());
}

/**
 * Checks if the import declaration has named imports
 */
export function hasNamedImports(importDeclaration: ImportDeclaration): boolean {
    return importDeclaration.getNamedImports().length > 0;
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

/**
 * Collects all references to named imports from myzod in the source file
 */
export function collectNamedImportReferences(sourceFile: SourceFile, namedImports: string[]) {
    const references: { name: string; nodes: Node[] }[] = [];
    
    for (const importName of namedImports) {
        const identifiers = sourceFile.getDescendantsOfKind(SyntaxKind.Identifier)
            .filter(node => node.getText() === importName);
        
        // Filter out the import declaration itself
        const filteredNodes = identifiers.filter(node => {
            const parent = node.getParent();
            return !parent || parent.getKind() !== SyntaxKind.ImportDeclaration;
        });
        
        if (filteredNodes.length > 0) {
            references.push({ name: importName, nodes: filteredNodes });
        }
    }
    
    return references;
}