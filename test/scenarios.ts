import { readFile } from "node:fs/promises";
import * as prettier from "prettier";
import { describe, expect, it } from "vitest";
import { convertMyzodToZodV3String } from "../src/migrate.js";

describe("myzod から zod への変換", () => {
	// TDD ステップ1 (RED): 最もシンプルなテストケースから開始
	describe("基本文字列の変換", () => {
		it("基本的な文字列スキーマを変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("basic-string");

			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);

			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("basic-string");
		});
	});

	// TDD ステップ3: 次のテストケースを追加 (predicate-string は .withPredicate -> .refine が必要)
	describe("述語文字列の変換", () => {
		it("述語付き文字列をrefineに変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("predicate-string");

			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);

			// .withPredicate -> .refine 変換を実装するまで、これは失敗するべき
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("predicate-string");
		});
	});

	// TDD サイクルに従った追加テストケース - 実装準備ができたら .skip を削除
	describe("基本数値の変換", () => {
		it("基本的な数値スキーマを変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("basic-number");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("basic-number");
		});
	});

	describe("基本ブール値の変換", () => {
		it("基本的なブール値スキーマを変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("basic-boolean");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("basic-boolean");
		});
	});

	describe("基本リテラルの変換", () => {
		it("基本的なリテラルスキーマを変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("basic-literal");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("basic-literal");
		});
	});

	describe("基本オブジェクトの変換", () => {
		it("基本的なオブジェクトスキーマを変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("basic-object");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("basic-object");
		});
	});

	describe("基本配列の変換", () => {
		it("基本的な配列スキーマを変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("basic-array");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("basic-array");
		});
	});

	describe("文字列から長さへのマップ変換", () => {
		it("mapをtransformに変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("map-string-to-length");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("map-string-to-length");
		});
	});

	describe("基本ユニオンの変換", () => {
		it("ユニオンスキーマを変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("union-basic");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("union-basic");
		});
	});

	describe("基本タプルの変換", () => {
		it("タプルスキーマを変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("tuple-basic");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("tuple-basic");
		});
	});

	describe("基本レコードの変換", () => {
		it("レコードスキーマを変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("record-basic");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("record-basic");
		});
	});

	describe("文字列長さ制限の変換", () => {
		it("最小/最大制限付き文字列を変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("string-min-max");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("string-min-max");
		});
	});

	describe("文字列パターンの変換", () => {
		it("パターン付き文字列を変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("string-pattern");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("string-pattern");
		});
	});

	describe("文字列デフォルト値の変換", () => {
		it("デフォルト値付き文字列を変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("string-default");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("string-default");
		});
	});

	describe("基本オプショナルの変換", () => {
		it("オプショナルスキーマを変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("optional-basic");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("optional-basic");
		});
	});

	describe("基本null許可の変換", () => {
		it("null許可スキーマを変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("nullable-basic");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("nullable-basic");
		});
	});

	describe("数値強制変換", () => {
		it("数値強制を変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("number-coerce");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("number-coerce");
		});
	});

	describe("オブジェクト部分型の変換", () => {
		it("部分オブジェクトを変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("object-partial");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("object-partial");
		});
	});

	describe("配列長さ制限の変換", () => {
		it("最小/最大制限付き配列を変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("array-min-max");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("array-min-max");
		});
	});

	describe("基本交差型の変換", () => {
		it("交差型スキーマを変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("intersection-basic");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("intersection-basic");
		});
	});

	describe("複数リテラルの変換", () => {
		it("複数リテラルを変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("literals-multiple");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("literals-multiple");
		});
	});

	describe("基本列挙型の変換", () => {
		it("列挙型スキーマを変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("enum-basic");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("配列引数の列挙型をz.enumに変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("enum-array");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("const assertion配列の列挙型をz.enumに変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("enum-const-assertion");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("enum-basic");
		});

		it("配列列挙型で同じバリデーション動作を維持する", async () => {
			await validateSchemas("enum-array");
		});

		it("const assertion配列列挙型で同じバリデーション動作を維持する", async () => {
			await validateSchemas("enum-const-assertion");
		});
	});

	// Named importsのテスト
	describe("Named imports の変換", () => {
		it("基本的なnamed importsを変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("named-imports-basic");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("Mixed imports (default + named) を変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("named-imports-mixed");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});
	});

	// collectErrors の削除テスト
	describe("collectErrors の削除", () => {
		it("collectErrors メソッドを自動削除する", async () => {
			const { myzod, zodv3 } = await readFixtures("object-collect-errors");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});
	});

	// Dictionary の変換テスト
	describe("Dictionary の変換", () => {
		it("dictionary をrecordに変換し適切にoptionalを処理する", async () => {
			const { myzod, zodv3 } = await readFixtures("dictionary-basic");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});
	});

	// allowUnknownKeys の変換テスト
	describe("allowUnknownKeys の変換", () => {
		it("allowUnknownKeys を passthrough に変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("allow-unknown-keys-basic");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("allow-unknown-keys-basic");
		});
	});

	// TDD: 型変換テストケース - 実装までは失敗するべき
	describe("StringType型注釈の変換", () => {
		it("StringType型注釈をZodStringに変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("type-string-basic");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("type-string-basic");
		});
	});

	describe("NumberType型注釈の変換", () => {
		it("NumberType型注釈をZodNumberに変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("type-number-basic");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("type-number-basic");
		});
	});

	describe("ObjectType型注釈の変換", () => {
		it("ObjectType型注釈をZodObjectに変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("type-object-basic");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("type-object-basic");
		});
	});

	describe("基底Type<T>型注釈の変換", () => {
		it("Type<T>型注釈をZodType<T>に変換する", async () => {
			const { myzod, zodv3 } = await readFixtures("type-base-generic");
			const migratedCode = convertMyzodToZodV3String(myzod);
			const { source, expected } = await formatCode(migratedCode, zodv3);
			expect(source).toBe(expected);
		});

		it("同じバリデーション動作を維持する", async () => {
			await validateSchemas("type-base-generic");
		});
	});
});

async function validateSchemas(testCase: string) {
	// 実際のスキーマ動作をテストするための動的インポート
	const myzodModule = await import(`./__scenarios__/${testCase}/myzod.ts`);
	const zodv3Module = await import(`./__scenarios__/${testCase}/zodv3.ts`);

	const myzodSchema = myzodModule.schema;
	const zodv3Schema = zodv3Module.schema;

	// データをテストするヘルパー関数
	const testData = (
		data: unknown,
		shouldSucceed: boolean,
		_dataName: string,
	) => {
		const myzodResult = myzodSchema.try(data);
		const zodv3Result = zodv3Schema.safeParse(data);

		const myzodSuccess = !(
			myzodResult &&
			typeof myzodResult === "object" &&
			"message" in myzodResult
		);

		expect(myzodSuccess).toBe(shouldSucceed);
		expect(zodv3Result.success).toBe(shouldSucceed);

		// 両方が成功した場合、変換テストのためパースされた値を比較
		if (shouldSucceed && myzodSuccess && zodv3Result.success) {
			// transform/map操作について、期待される出力が一致するかチェック
			if ("expectedOutput" in myzodModule) {
				expect(myzodResult).toBe(myzodModule.expectedOutput);
				expect(zodv3Result.data).toBe(myzodModule.expectedOutput);
			}
		}
	};

	// すべての有効データバリエーションをテスト
	const dataKeys = Object.keys(myzodModule).filter((key) =>
		key.startsWith("valid"),
	);
	dataKeys.forEach((key) => {
		const data = myzodModule[key];
		if (data !== undefined) {
			testData(data, true, key);
		}
	});

	// バリエーションがない場合、プライマリ有効データをテスト
	if (dataKeys.length === 0 && "validData" in myzodModule) {
		testData(myzodModule.validData, true, "validData");
	}

	// すべての無効データバリエーションをテスト
	const invalidKeys = Object.keys(myzodModule).filter((key) =>
		key.startsWith("invalid"),
	);
	invalidKeys.forEach((key) => {
		const data = myzodModule[key];
		if (data !== undefined) {
			testData(data, false, key);
		}
	});

	// バリエーションがない場合、プライマリ無効データをテスト
	if (invalidKeys.length === 0 && "invalidData" in myzodModule) {
		testData(myzodModule.invalidData, false, "invalidData");
	}
}

async function readFixtures(name: string) {
	const [myzod, zodv3] = await Promise.all(
		["myzod", "zodv3"].map((lib) =>
			readFile(
				new URL(`./__scenarios__/${name}/${lib}.ts`, import.meta.url),
				"utf-8",
			),
		),
	);

	return { myzod, zodv3 };
}

async function formatCode(sourceCode: string, expectedCode: string) {
	let source = sourceCode;
	let expected = expectedCode;

	try {
		source = await prettier.format(source, { parser: "typescript" });
	} catch {
		throw new Error(`Failed to format source code: ${source}`);
	}

	try {
		expected = await prettier.format(expected, { parser: "typescript" });
	} catch {
		throw new Error(`Failed to format expected code: ${expected}`);
	}

	return { source, expected };
}
