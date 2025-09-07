#!/usr/bin/env node

import * as fs from "node:fs";
import { Project } from "ts-morph";
import {
	type ManualMigrationIssue,
	migrateMyzodToZodV3WithIssues,
} from "./migrate.js";

/**
 * Main entry point for the myzod-to-zod codemod
 */
async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.error("Usage: myzod-to-zod <file-pattern> [--write]");
		console.error('Example: myzod-to-zod "src/**/*.ts" --write');
		process.exit(1);
	}

	const pattern = args[0];
	const shouldWrite = args.includes("--write");

	try {
		const project = new Project();
		project.addSourceFilesAtPaths(pattern);

		const sourceFiles = project.getSourceFiles();

		if (sourceFiles.length === 0) {
			console.log("No files found matching pattern:", pattern);
			return;
		}

		console.log(`Processing ${sourceFiles.length} file(s)...`);

		const allManualIssues: Array<{
			filePath: string;
			issues: ManualMigrationIssue[];
		}> = [];

		for (const sourceFile of sourceFiles) {
			const filePath = sourceFile.getFilePath();
			console.log(`Processing: ${filePath}`);

			const originalContent = sourceFile.getText();
			const result = migrateMyzodToZodV3WithIssues(sourceFile);

			// Collect manual issues for summary
			if (result.manualIssues.length > 0) {
				allManualIssues.push({ filePath, issues: result.manualIssues });
			}

			if (shouldWrite) {
				fs.writeFileSync(filePath, result.content, "utf-8");
				console.log(`✅ Updated: ${filePath}`);
			} else {
				// Check if content changed
				if (originalContent === result.content) {
					console.log(`📄 No changes needed: ${filePath}`);
				} else {
					console.log(`--- ${filePath} ---`);
					console.log(result.content);
					console.log("");
				}
			}
		}

		// Display manual migration summary
		displayManualMigrationSummary(allManualIssues);

		if (!shouldWrite) {
			console.log("\nRe-run with --write to apply changes");
		}
	} catch (error) {
		console.error("Error during migration:", error);
		process.exit(1);
	}
}

// Check if this module is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error);
}

interface FileWithIssues {
	filePath: string;
	issues: ManualMigrationIssue[];
}

/**
 * Displays manual migration summary following t-wada principles
 */
export function displayManualMigrationSummary(fileIssues: FileWithIssues[]) {
	if (fileIssues.length === 0) {
		displayNoIssuesMessage();
		return;
	}

	displayIssuesHeader();
	displayIssuesByFile(fileIssues);
	displayHelpReference();
}

function displayNoIssuesMessage() {
	console.log(
		"\n🎉 All files migrated automatically! No manual changes required.",
	);
}

function displayIssuesHeader() {
	console.log("\n⚠️  Manual Migration Required");
	console.log("═".repeat(50));
}

function displayIssuesByFile(fileIssues: FileWithIssues[]) {
	if (fileIssues.length > 1) {
		console.log(`Found ${fileIssues.length} files requiring manual changes:`);
	}

	for (const { filePath, issues } of fileIssues) {
		console.log(`\n📁 ${filePath}`);
		displayIssuesForFile(issues);
	}
}

function displayIssuesForFile(issues: ManualMigrationIssue[]) {
	for (const issue of issues) {
		console.log(`  Line ${issue.line}: ${issue.description}`);
		if (issue.snippet) {
			console.log(`    > ${issue.snippet}`);
		}
	}
}

function displayHelpReference() {
	console.log("\n📖 For detailed migration instructions, see:");
	console.log(
		"   https://github.com/lollipop-onl/myzod-to-zod#-manual-migration-required",
	);
}

export { migrateMyzodToZodV3 } from "./migrate.js";
