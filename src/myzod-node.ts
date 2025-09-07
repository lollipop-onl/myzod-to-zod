import { Node, type SyntaxKind } from "ts-morph";

/**
 * Checks if a node is a myzod-related node
 */
export function isMyzodNode(node: Node): boolean {
	return (
		Node.isCallExpression(node) ||
		Node.isPropertyAccessExpression(node) ||
		Node.isExpressionStatement(node)
	);
}

/**
 * Gets direct descendants of a specific syntax kind, excluding nested function expressions
 */
export function getDirectDescendantsOfKind<T extends Node>(
	node: Node,
	kind: SyntaxKind,
): T[] {
	const descendants: T[] = [];

	for (const child of node.getChildren()) {
		if (child.getKind() === kind) {
			descendants.push(child as T);
		} else if (
			!Node.isFunctionExpression(child) &&
			!Node.isArrowFunction(child)
		) {
			descendants.push(...getDirectDescendantsOfKind<T>(child, kind));
		}
	}

	return descendants;
}

/**
 * Determines if an expression references myzod
 */
export function isMyzodReference(node: Node, myzodName: string): boolean {
	if (!Node.isPropertyAccessExpression(node) && !Node.isCallExpression(node)) {
		return false;
	}

	// For property access: myzod.string()
	if (Node.isPropertyAccessExpression(node)) {
		const expression = node.getExpression();
		if (Node.isIdentifier(expression)) {
			return expression.getText() === myzodName;
		}
	}

	// For call expressions: myzod.string().withPredicate()
	if (Node.isCallExpression(node)) {
		const expression = node.getExpression();
		if (Node.isPropertyAccessExpression(expression)) {
			return isMyzodReference(expression, myzodName);
		}
		if (Node.isIdentifier(expression)) {
			return expression.getText() === myzodName;
		}
	}

	return false;
}

/**
 * Gets the root identifier from a complex expression
 */
export function getRootIdentifier(node: Node): string | undefined {
	if (Node.isIdentifier(node)) {
		return node.getText();
	}

	if (Node.isPropertyAccessExpression(node)) {
		return getRootIdentifier(node.getExpression());
	}

	if (Node.isCallExpression(node)) {
		return getRootIdentifier(node.getExpression());
	}

	return undefined;
}
