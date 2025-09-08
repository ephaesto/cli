import { describe, expect, it } from "vitest";
import type { GenObject } from "~/src/entities/GenObject";
import { sanitizeGenObject } from "./sanitizeGenJson";

describe("sanitizeGenObject", () => {
	it("should detect array of GenObject", () => {
		const input: GenObject[] = [
			{ genName: "gen1", genId: "1", genMeta: {} },
			{ genName: "gen2", genId: "2", genMeta: {} },
		];

		const result = sanitizeGenObject(input);

		expect(result.isGenObject).toBe(true);
		expect(result.isArrays).toBe(true);
		expect(result.args).toEqual(input);
	});

	it("should detect single GenObject", () => {
		const input: GenObject = {
			genName: "single",
			genId: "123",
			genMeta: {},
		};

		const result = sanitizeGenObject(input);

		expect(result.isGenObject).toBe(true);
		expect(result.isArrays).toBe(false);
		expect(result.args).toEqual(input);
	});

	it("should return non-genObject as raw", () => {
		const input = { foo: "bar" };

		const result = sanitizeGenObject(input);

		expect(result.isGenObject).toBe(false);
		expect(result.isArrays).toBe(false);
		expect(result.args).toEqual(input);
	});

	it("should return non-object values as raw", () => {
		const input = "just-a-string";

		const result = sanitizeGenObject(input);

		expect(result.isGenObject).toBe(false);
		expect(result.isArrays).toBe(false);
		expect(result.args).toBe("just-a-string");
	});

	it("should handle empty array safely", () => {
		const input: unknown[] = [];

		const result = sanitizeGenObject(input);

		expect(result.isGenObject).toBe(false);
		expect(result.isArrays).toBe(false);
		expect(result.args).toEqual([]);
	});
});
