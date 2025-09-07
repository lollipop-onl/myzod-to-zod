#!/usr/bin/env node

import { Project } from 'ts-morph';
import { migrateMyzodToZodV3 } from './migrate.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Main entry point for the myzod-to-zod codemod
 */
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.error('Usage: myzod-to-zod <file-pattern> [--write]');
        console.error('Example: myzod-to-zod "src/**/*.ts" --write');
        process.exit(1);
    }
    
    const pattern = args[0];
    const shouldWrite = args.includes('--write');
    
    try {
        const project = new Project();
        project.addSourceFilesAtPaths(pattern);
        
        const sourceFiles = project.getSourceFiles();
        
        if (sourceFiles.length === 0) {
            console.log('No files found matching pattern:', pattern);
            return;
        }
        
        console.log(`Processing ${sourceFiles.length} file(s)...`);
        
        for (const sourceFile of sourceFiles) {
            const filePath = sourceFile.getFilePath();
            console.log(`Processing: ${filePath}`);
            
            const migratedContent = migrateMyzodToZodV3(sourceFile);
            
            if (shouldWrite) {
                fs.writeFileSync(filePath, migratedContent, 'utf-8');
                console.log(`✅ Updated: ${filePath}`);
            } else {
                console.log(`--- ${filePath} ---`);
                console.log(migratedContent);
                console.log('');
            }
        }
        
        if (!shouldWrite) {
            console.log('\nRe-run with --write to apply changes');
        }
        
    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
}

// Check if this module is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { migrateMyzodToZodV3 } from './migrate.js';