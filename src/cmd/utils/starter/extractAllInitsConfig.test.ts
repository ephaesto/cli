import { describe, expect, it } from "vitest";
import { extractAllInitsConfig } from "./extractAllInitsConfig";

describe("extractAllInitsConfig", () => {
	it("should extract all inits configs when present", () => {
		const input = {
			defaultDirConfig: { inits: { a: 1 } },
			dirConfig: { inits: { b: 2 } },
			rootConfig: { inits: { c: 3 } },
		};

		const result = extractAllInitsConfig(input as any);

		expect(result).toEqual({
			defaultDirConfig: { a: 1 },
			dirConfig: { b: 2 },
			rootConfig: { c: 3 },
		});
	});

	it("should return null for missing inits keys", () => {
		const input = {
			defaultDirConfig: {},
			dirConfig: null,
			rootConfig: { inits: { c: 3 } },
		};

		const result = extractAllInitsConfig(input as any);

		expect(result).toEqual({
			defaultDirConfig: null,
			dirConfig: null,
			rootConfig: { c: 3 },
		});
	});

	it("should return all null when input is empty", () => {
		const result = extractAllInitsConfig({
			defaultDirConfig: null,
			dirConfig: null,
			rootConfig: null,
		});

		expect(result).toEqual({
			defaultDirConfig: null,
			dirConfig: null,
			rootConfig: null,
		});
	});
});
