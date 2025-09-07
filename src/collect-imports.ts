import {
	type ImportDeclaration,
	type Node,
	type SourceFile,
	SyntaxKind,
	type TypeReferenceNode,
} from "ts-morph";

/**
 * Collects myzod import declarations from a source file
 */
export function collectMyzodImportDeclarations(
	sourceFile: SourceFile,
): ImportDeclaration[] {
	return sourceFile.getImportDeclarations().filter((importDeclaration) => {
		const moduleSpecifier = importDeclaration.getModuleSpecifierValue();
		return moduleSpecifier === "myzod";
	});
}

/**
 * Gets the imported myzod identifier name, defaults to 'myzod' if not aliased
 */
export function getMyzodName(importDeclaration: ImportDeclaration): string {
	const defaultImport = importDeclaration.getDefaultImport();
	return defaultImport?.getText() ?? "myzod";
}

/**
 * Gets all named imports from a myzod import declaration
 */
export function getMyzodNamedImports(
	importDeclaration: ImportDeclaration,
): string[] {
	const namedImports = importDeclaration.getNamedImports();
	return namedImports.map((namedImport) => namedImport.getName());
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
export function collectMyzodReferences(
	sourceFile: SourceFile,
	myzodName: string,
) {
	const identifiers = sourceFile
		.getDescendantsOfKind(SyntaxKind.Identifier)
		.filter((node) => node.getText() === myzodName);

	// Filter out the import declaration itself
	return identifiers.filter((node) => {
		const parent = node.getParent();
		return !parent || parent.getKind() !== SyntaxKind.ImportDeclaration;
	});
}

/**
 * Collects all references to named imports from myzod in the source file
 */
export function collectNamedImportReferences(
	sourceFile: SourceFile,
	namedImports: string[],
) {
	const references: { name: string; nodes: Node[] }[] = [];

	for (const importName of namedImports) {
		const identifiers = sourceFile
			.getDescendantsOfKind(SyntaxKind.Identifier)
			.filter((node) => node.getText() === importName);

		// Filter out the import declaration itself
		const filteredNodes = identifiers.filter((node) => {
			const parent = node.getParent();
			return !parent || parent.getKind() !== SyntaxKind.ImportDeclaration;
		});

		if (filteredNodes.length > 0) {
			references.push({ name: importName, nodes: filteredNodes });
		}
	}

	return references;
}

/**
 * Type mapping from myzod to zod type names
 */
export const MYZOD_TO_ZOD_TYPE_MAP: Record<string, string> = {
	StringType: "ZodString",
	NumberType: "ZodNumber",
	BooleanType: "ZodBoolean",
	ObjectType: "ZodObject",
	ArrayType: "ZodArray",
	Type: "ZodType",
	// Add more mappings as needed
	ObjectShape: "ZodRawShape",
	InferObjectShape: "ZodRawShape", // Map to closest equivalent
	AnyType: "ZodTypeAny",
};

/**
 * Gets myzod type imports that need to be transformed
 */
export function getMyzodTypeImports(
	importDeclaration: ImportDeclaration,
): string[] {
	const namedImports = importDeclaration.getNamedImports();
	return namedImports
		.map((namedImport) => namedImport.getName())
		.filter((name) => name in MYZOD_TO_ZOD_TYPE_MAP);
}

/**
 * Collects all type reference nodes in the source file that use myzod types
 */
export function collectMyzodTypeReferences(
	sourceFile: SourceFile,
	myzodTypeNames: string[],
) {
	const typeReferences: { name: string; nodes: TypeReferenceNode[] }[] = [];

	for (const typeName of myzodTypeNames) {
		const references = sourceFile
			.getDescendantsOfKind(SyntaxKind.TypeReference)
			.filter((typeRef) => {
				const typeName_inner = typeRef.getTypeName();
				return typeName_inner.getText() === typeName;
			});

		if (references.length > 0) {
			typeReferences.push({ name: typeName, nodes: references });
		}
	}

	return typeReferences;
}
