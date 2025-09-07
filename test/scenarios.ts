import { describe, expect, it } from 'vitest';
import {readFile} from "node:fs/promises";
import {Project} from "ts-morph";
import * as prettier from "prettier";
import { convertMyzodToZodV3String } from "../src/migrate.js";

describe('myzod to zod conversion', () => {
    // TDD Step 1 (RED): Start with simplest test case
    describe('basic-string conversion', () => {
        it('should convert basic string schema', async () => {
            const { myzod, zodv3 } = await readFixtures('basic-string');
            
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('basic-string');
        });
    });
    
    // TDD Step 3: Add next test case (predicate-string requires .withPredicate -> .refine)
    describe('predicate-string conversion', () => {
        it('should convert string with predicate to refine', async () => {
            const { myzod, zodv3 } = await readFixtures('predicate-string');
            
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            
            // This should fail until we implement .withPredicate -> .refine conversion
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('predicate-string');
        });
    });
    
    // Additional test cases following TDD cycle - remove .skip when ready to implement
    describe('basic-number conversion', () => {
        it('should convert basic number schema', async () => {
            const { myzod, zodv3 } = await readFixtures('basic-number');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('basic-number');
        });
    });
    
    describe.skip('basic-boolean conversion', () => {
        it('should convert basic boolean schema', async () => {
            const { myzod, zodv3 } = await readFixtures('basic-boolean');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('basic-boolean');
        });
    });
    
    describe.skip('basic-literal conversion', () => {
        it('should convert basic literal schema', async () => {
            const { myzod, zodv3 } = await readFixtures('basic-literal');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('basic-literal');
        });
    });
    
    describe.skip('basic-object conversion', () => {
        it('should convert basic object schema', async () => {
            const { myzod, zodv3 } = await readFixtures('basic-object');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('basic-object');
        });
    });
    
    describe.skip('basic-array conversion', () => {
        it('should convert basic array schema', async () => {
            const { myzod, zodv3 } = await readFixtures('basic-array');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('basic-array');
        });
    });
    
    describe('map-string-to-length conversion', () => {
        it('should convert map to transform', async () => {
            const { myzod, zodv3 } = await readFixtures('map-string-to-length');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('map-string-to-length');
        });
    });
    
    describe.skip('union-basic conversion', () => {
        it('should convert union schema', async () => {
            const { myzod, zodv3 } = await readFixtures('union-basic');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('union-basic');
        });
    });
    
    describe.skip('tuple-basic conversion', () => {
        it('should convert tuple schema', async () => {
            const { myzod, zodv3 } = await readFixtures('tuple-basic');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('tuple-basic');
        });
    });
    
    describe.skip('record-basic conversion', () => {
        it('should convert record schema', async () => {
            const { myzod, zodv3 } = await readFixtures('record-basic');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('record-basic');
        });
    });
    
    describe.skip('string-min-max conversion', () => {
        it('should convert string with min/max constraints', async () => {
            const { myzod, zodv3 } = await readFixtures('string-min-max');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('string-min-max');
        });
    });
    
    describe.skip('string-pattern conversion', () => {
        it('should convert string with pattern', async () => {
            const { myzod, zodv3 } = await readFixtures('string-pattern');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('string-pattern');
        });
    });
    
    describe.skip('string-default conversion', () => {
        it('should convert string with default value', async () => {
            const { myzod, zodv3 } = await readFixtures('string-default');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('string-default');
        });
    });
    
    describe.skip('optional-basic conversion', () => {
        it('should convert optional schema', async () => {
            const { myzod, zodv3 } = await readFixtures('optional-basic');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('optional-basic');
        });
    });
    
    describe.skip('nullable-basic conversion', () => {
        it('should convert nullable schema', async () => {
            const { myzod, zodv3 } = await readFixtures('nullable-basic');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('nullable-basic');
        });
    });
    
    describe.skip('number-coerce conversion', () => {
        it('should convert number coercion', async () => {
            const { myzod, zodv3 } = await readFixtures('number-coerce');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('number-coerce');
        });
    });
    
    describe.skip('object-partial conversion', () => {
        it('should convert partial object', async () => {
            const { myzod, zodv3 } = await readFixtures('object-partial');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('object-partial');
        });
    });
    
    describe.skip('array-min-max conversion', () => {
        it('should convert array with min/max constraints', async () => {
            const { myzod, zodv3 } = await readFixtures('array-min-max');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('array-min-max');
        });
    });
    
    describe.skip('intersection-basic conversion', () => {
        it('should convert intersection schema', async () => {
            const { myzod, zodv3 } = await readFixtures('intersection-basic');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('intersection-basic');
        });
    });
    
    describe.skip('literals-multiple conversion', () => {
        it('should convert multiple literals', async () => {
            const { myzod, zodv3 } = await readFixtures('literals-multiple');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('literals-multiple');
        });
    });
    
    describe.skip('enum-basic conversion', () => {
        it('should convert enum schema', async () => {
            const { myzod, zodv3 } = await readFixtures('enum-basic');
            const migratedCode = convertMyzodToZodV3String(myzod);
            const { source, expected } = await formatCode(migratedCode, zodv3);
            expect(source).toBe(expected);
        });
        
        it('should maintain same validation behavior', async () => {
            await validateSchemas('enum-basic');
        });
    });
});

async function validateSchemas(testCase: string) {
    // Dynamic import to test actual schema behavior
    const myzodModule = await import(`./__scenarios__/${testCase}/myzod.ts`);
    const zodv3Module = await import(`./__scenarios__/${testCase}/zodv3.ts`);
    
    const myzodSchema = myzodModule.schema;
    const zodv3Schema = zodv3Module.schema;
    
    // Helper function to test data
    const testData = (data: any, shouldSucceed: boolean, dataName: string) => {
        const myzodResult = myzodSchema.try(data);
        const zodv3Result = zodv3Schema.safeParse(data);
        
        const myzodSuccess = !(myzodResult && typeof myzodResult === 'object' && 'message' in myzodResult);
        
        expect(myzodSuccess).toBe(shouldSucceed);
        expect(zodv3Result.success).toBe(shouldSucceed);
        
        // If both succeed, compare parsed values for transformation tests
        if (shouldSucceed && myzodSuccess && zodv3Result.success) {
            // For transform/map operations, check if expected output matches
            if ('expectedOutput' in myzodModule) {
                expect(myzodResult).toBe(myzodModule.expectedOutput);
                expect(zodv3Result.data).toBe(myzodModule.expectedOutput);
            }
        }
    };
    
    // Test all valid data variants
    const dataKeys = Object.keys(myzodModule).filter(key => key.startsWith('valid'));
    dataKeys.forEach(key => {
        const data = myzodModule[key];
        if (data !== undefined) {
            testData(data, true, key);
        }
    });
    
    // Test primary valid data if no variants
    if (dataKeys.length === 0 && 'validData' in myzodModule) {
        testData(myzodModule.validData, true, 'validData');
    }
    
    // Test all invalid data variants
    const invalidKeys = Object.keys(myzodModule).filter(key => key.startsWith('invalid'));
    invalidKeys.forEach(key => {
        const data = myzodModule[key];
        if (data !== undefined) {
            testData(data, false, key);
        }
    });
    
    // Test primary invalid data if no variants
    if (invalidKeys.length === 0 && 'invalidData' in myzodModule) {
        testData(myzodModule.invalidData, false, 'invalidData');
    }
}


async function readFixtures(name: string) {
    const [myzod, zodv3] = await Promise.all(
        ['myzod', 'zodv3'].map((lib) => readFile(
            new URL(`./__scenarios__/${name}/${lib}.ts`, import.meta.url),
            'utf-8'
        ))
    );

    return { myzod, zodv3 };
}

async function formatCode(sourceCode: string, expectedCode: string) {
    let source = sourceCode;
    let expected = expectedCode;

    try {
        source = await prettier.format(source, { parser: 'typescript' });
    } catch {
        throw new Error(`Failed to format source code: ${source}`);
    }

    try {
        expected = await prettier.format(expected, { parser: 'typescript' });
    } catch {
        throw new Error(`Failed to format expected code: ${expected}`);
    }

    return { source, expected };
}