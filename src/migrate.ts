import { SourceFile } from 'ts-morph';

/**
 * Migrates myzod code to zod v3 using string-based transformations.
 * Future: Will be enhanced with AST transformations using ts-morph.
 */
export function migrateMyzodToZodV3(sourceFile: SourceFile): string {
    const sourceCode = sourceFile.getFullText();
    return convertMyzodToZodV3(sourceCode);
}

/**
 * Simple string-based transformation for basic myzod -> zod v3 migration
 * Future: Will be enhanced with AST transformations using ts-morph
 */
function convertMyzodToZodV3(myzodCode: string): string {
    return myzodCode
        // Convert import statement: myzod -> zod
        .replace(/import myzod from 'myzod';/g, "import { z } from 'zod';")
        // Convert namespace: myzod -> z
        .replace(/myzod\./g, 'z.')
        // Convert method names: myzod API -> zod API
        .replace(/\.withPredicate\(/g, '.refine(')
        .replace(/\.map\(/g, '.transform(');
}

/**
 * Convenience function for direct string transformation (used by tests)
 */
export function convertMyzodToZodV3String(myzodCode: string): string {
    return convertMyzodToZodV3(myzodCode);
}