import { beforeEach, describe, expect, it, vi } from "vitest";
import { displayManualMigrationSummary } from "../src/index.js";
import type { ManualMigrationIssue } from "../src/migrate.js";

describe("CLI Manual Migration Summary", () => {
	let consoleSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	it("should display no issues message when no manual migration needed", () => {
		displayManualMigrationSummary([]);

		expect(consoleSpy).toHaveBeenCalledWith(
			"\n🎉 All files migrated automatically! No manual changes required.",
		);
	});

	it("should display summary for single file with manual issues", () => {
		const issues: ManualMigrationIssue[] = [
			{
				type: "try-method",
				description: "Replace .try() with .safeParse()",
				line: 5,
				snippet: "schema.try(data)",
			},
		];

		const fileIssues = [{ filePath: "/test/file.ts", issues }];
		displayManualMigrationSummary(fileIssues);

		expect(consoleSpy).toHaveBeenCalledWith("\n⚠️  Manual Migration Required");
		expect(consoleSpy).toHaveBeenCalledWith("═".repeat(50));
		expect(consoleSpy).toHaveBeenCalledWith("\n📁 /test/file.ts");
		expect(consoleSpy).toHaveBeenCalledWith(
			"  Line 5: Replace .try() with .safeParse()",
		);
		expect(consoleSpy).toHaveBeenCalledWith("    > schema.try(data)");
	});

	it("should display summary for multiple files with manual issues", () => {
		const issues1: ManualMigrationIssue[] = [
			{
				type: "try-method",
				description: "Replace .try() with .safeParse()",
				line: 5,
				snippet: "schema.try(data)",
			},
		];

		const issues2: ManualMigrationIssue[] = [
			{
				type: "validation-error",
				description:
					"Replace instanceof ValidationError with !result.success pattern",
				line: 10,
				snippet: "result instanceof myzod.ValidationError",
			},
		];

		const fileIssues = [
			{ filePath: "/test/file1.ts", issues: issues1 },
			{ filePath: "/test/file2.ts", issues: issues2 },
		];

		displayManualMigrationSummary(fileIssues);

		expect(consoleSpy).toHaveBeenCalledWith("\n⚠️  Manual Migration Required");
		expect(consoleSpy).toHaveBeenCalledWith(
			"Found 2 files requiring manual changes:",
		);
		expect(consoleSpy).toHaveBeenCalledWith("\n📁 /test/file1.ts");
		expect(consoleSpy).toHaveBeenCalledWith("\n📁 /test/file2.ts");
	});

	it("should display helpful migration guide reference", () => {
		const issues: ManualMigrationIssue[] = [
			{
				type: "try-method",
				description: "Replace .try() with .safeParse()",
				line: 5,
				snippet: "schema.try(data)",
			},
		];

		const fileIssues = [{ filePath: "/test/file.ts", issues }];
		displayManualMigrationSummary(fileIssues);

		expect(consoleSpy).toHaveBeenCalledWith(
			"\n📖 For detailed migration instructions, see:",
		);
		expect(consoleSpy).toHaveBeenCalledWith(
			"   https://github.com/lollipop-onl/myzod-to-zod#manual-migration-required",
		);
	});
});
