import { describe, expect, it } from 'vitest';
import {readFile} from "node:fs/promises";
import {Project} from "ts-morph";
import * as prettier from "prettier";

describe('myzod to zod', () => {

})

async function runScenario(fixturePath: string) {
    const { myzod, zodv3 } = await readFixtures(fixturePath);
    const { source, expected} = await transform(myzod, zodv3, () => { /* TODO */});

    expect(source).toEqual(expected);
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

async function transform(beforeText: string, afterText: string, migrate: (...args:any[]) => any) {
    const project = new Project({
        useInMemoryFileSystem: true,
        skipFileDependencyResolution: true,
    });


    const sourceFile = project.createSourceFile('source.ts');
    let source = migrate(beforeText); // migrate to myzod to zod v3

    let expected = project.createSourceFile(`expected.ts`, afterText).getFullText();

    try {
        source = await prettier.format(source, { parser: 'typescript' })
    } catch {
        throw new Error(`Failed to format source code: ${source}`)
    }

    try {
        expected = await prettier.format(expected, { parser: 'typescript' })
    } catch {
        throw new Error(`Failed to format expected code: ${expected}`)
    }

    return { source, expected };
}