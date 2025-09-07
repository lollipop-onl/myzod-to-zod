import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";
import { migrateMyzodToZodV3WithIssues } from "../src/migrate.js";

describe("Manual Migration Detection", () => {
	function createSourceFile(code: string) {
		const project = new Project({ useInMemoryFileSystem: true });
		return project.createSourceFile("test.ts", code);
	}

	it("should detect .try() method calls requiring manual conversion", () => {
		const code = `
import myzod from 'myzod';

const schema = myzod.string();
const result = schema.try(data);
        `;

		const sourceFile = createSourceFile(code);
		const result = migrateMyzodToZodV3WithIssues(sourceFile);

		expect(result.manualIssues).toHaveLength(1);
		expect(result.manualIssues[0].type).toBe("try-method");
		expect(result.manualIssues[0].description).toBe(
			"Replace .try() with .safeParse()",
		);
		expect(result.manualIssues[0].line).toBe(5);
	});

	it("should detect ValidationError instanceof checks", () => {
		const code = `
import myzod from 'myzod';

const result = schema.try(data);
if (result instanceof myzod.ValidationError) {
    console.log('error');
}
        `;

		const sourceFile = createSourceFile(code);
		const result = migrateMyzodToZodV3WithIssues(sourceFile);

		expect(result.manualIssues).toHaveLength(2); // .try() + instanceof
		const validationErrorIssue = result.manualIssues.find(
			(issue) => issue.type === "validation-error",
		);
		expect(validationErrorIssue).toBeDefined();
		expect(validationErrorIssue?.description).toBe(
			"Replace instanceof ValidationError with !result.success pattern",
		);
	});

	it("should detect multiple manual issues in single file", () => {
		const code = `
import myzod from 'myzod';

const schema = myzod.string();
const result1 = schema.try(data1);
const result2 = schema.try(data2);

if (result1 instanceof myzod.ValidationError) {
    console.log('error1');
}
if (result2 instanceof myzod.ValidationError) {
    console.log('error2');
}
        `;

		const sourceFile = createSourceFile(code);
		const result = migrateMyzodToZodV3WithIssues(sourceFile);

		expect(result.manualIssues).toHaveLength(4); // 2 .try() + 2 instanceof
	});

	it("should detect ValidationError imports requiring manual conversion", () => {
		const code = `
import myzod, { ValidationError } from 'myzod';

const schema = myzod.string();
        `;

		const sourceFile = createSourceFile(code);
		const result = migrateMyzodToZodV3WithIssues(sourceFile);

		expect(result.manualIssues).toHaveLength(1);
		expect(result.manualIssues[0].type).toBe("validation-error");
		expect(result.manualIssues[0].description).toBe(
			"Remove ValidationError import and update error handling patterns",
		);
	});

	it("should detect multiple ValidationError patterns in imports and usage", () => {
		const code = `
import myzod, { ValidationError } from 'myzod';

const result = schema.try(data);
if (result instanceof ValidationError) {
    console.log('error');
}
        `;

		const sourceFile = createSourceFile(code);
		const result = migrateMyzodToZodV3WithIssues(sourceFile);

		expect(result.manualIssues).toHaveLength(3); // import + .try() + instanceof
		const importIssue = result.manualIssues.find((issue) =>
			issue.description.includes("Remove ValidationError import"),
		);
		expect(importIssue).toBeDefined();
		expect(importIssue?.type).toBe("validation-error");
	});

	it("should return empty issues for fully automated code", () => {
		const code = `
import myzod from 'myzod';

const schema = myzod.string().min(1).max(50);
const userSchema = myzod.object({
    name: myzod.string(),
    age: myzod.number().optional()
});
        `;

		const sourceFile = createSourceFile(code);
		const result = migrateMyzodToZodV3WithIssues(sourceFile);

		expect(result.manualIssues).toHaveLength(0);
	});
});
