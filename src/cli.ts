#!/usr/bin/env node

import { defineCommand, runMain } from "citty";
import { description, name, version } from "../package.json";
import { codemod } from ".";

const main = defineCommand({
	meta: {
		name,
		description,
		version,
	},
	args: {
		filePattern: {
			description:
				'File pattern to match TypeScript files (e.g., "src/**/*.ts")',
			type: "positional",
		},
		write: {
			description:
				"Apply transformations to files (without this flag, only preview changes)",
			type: "boolean",
		},
		quiet: {
			description: "Suppress file transformation logs (only show summary)",
			type: "boolean",
		},
	},
	async setup({ args }) {
		await codemod(args.filePattern, args.write, args.quiet);
	},
});

runMain(main);
