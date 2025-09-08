import { describe, expect, it } from "vitest";
import { mergeInitsConfig } from "./mergeInitsConfig";

describe("mergeInitsConfig", () => {
	it("merges all three configs correctly", () => {
		const result = mergeInitsConfig({
			defaultDirConfig: {
				genA: {
					nameDir: "default",
					InitFn: () => ({ description: "default" }),
				},
			},
			dirConfig: {
				genB: { nameDir: "dir", InitFn: () => ({ description: "dir" }) },
			},
			rootConfig: {
				genC: { nameDir: "root", InitFn: () => ({ description: "root" }) },
			},
		});

		expect(Object.keys(result)).toEqual(["genA", "genB", "genC"]);
	});

	it("merges with missing defaultDirConfig", () => {
		const result = mergeInitsConfig({
			defaultDirConfig: undefined,
			dirConfig: {
				genB: { nameDir: "dir", InitFn: () => ({ description: "dir" }) },
			},
			rootConfig: {
				genC: { nameDir: "root", InitFn: () => ({ description: "root" }) },
			},
		});

		expect(Object.keys(result)).toEqual(["genB", "genC"]);
	});

	it("merges with only rootConfig", () => {
		const result = mergeInitsConfig({
			defaultDirConfig: undefined,
			dirConfig: undefined,
			rootConfig: {
				genC: { nameDir: "root", InitFn: () => ({ description: "root" }) },
			},
		});

		expect(Object.keys(result)).toEqual(["genC"]);
	});

	it("resolves key conflicts with later configs overriding earlier ones", () => {
		const result = mergeInitsConfig({
			defaultDirConfig: {
				genX: {
					nameDir: "default",
					InitFn: () => ({ description: "default" }),
				},
			},
			dirConfig: {
				genX: { nameDir: "dir", InitFn: () => ({ description: "dir" }) },
			},
			rootConfig: {
				genX: { nameDir: "root", InitFn: () => ({ description: "root" }) },
			},
		});

		expect((result.genX as any)?.nameDir).toBe("root"); // ✅ rootConfig overrides dirConfig and defaultDirConfig
	});

	it("merges nested values deeply", () => {
		const result = mergeInitsConfig({
			defaultDirConfig: {
				genY: {
					nameDir: "default",
					InitFn: () => ({
						description: "default",
						actions: [{ type: "add", path: "default.ts" }],
					}),
				},
			},
			dirConfig: {
				genY: {
					InitFn: () => ({
						actions: [{ type: "modify", path: "dir.ts" }],
					}),
				} as any,
			},
			rootConfig: {},
		});

		expect((result.genY as any)?.InitFn?.({})?.actions).toEqual([
			{ type: "modify", path: "dir.ts" },
		]);
	});

	it("uses empty object when rootConfig is undefined", () => {
		const result = mergeInitsConfig({
			defaultDirConfig: {
				genA: {
					nameDir: "default",
					InitFn: () => ({ description: "default" }),
				},
			},
			dirConfig: {
				genB: { nameDir: "dir", InitFn: () => ({ description: "dir" }) },
			},
			rootConfig: undefined,
		});

		expect(result).toEqual({
			genA: expect.any(Object),
			genB: expect.any(Object),
		});
		expect((result.genA as any)?.nameDir).toBe("default");
		expect((result.genB as any)?.nameDir).toBe("dir");
	});
});
