import { describe, expect, it } from "vitest";
import type { Generators, GeneratorsConfig } from "~/src/entities/Generators";
import { mergeGeneratorConfig } from "./mergeGeneratorConfig";

const createGen = (label: string) => () => ({
	description: `Generator for ${label}`,
});

const createGroupedGen = (label: string): Generators => ({
	[`${label}-gen`]: createGen(label),
});

describe("mergeGeneratorConfig", () => {
	it("should merge flat configs into grouped structure if one has subGenConf", () => {
		const defaultDirConfig: Generators = {
			defaultGen: createGen("default"),
		};
		const dirConfig: Generators = {
			dirGen: createGen("dir"),
		};
		const rootConfig: GeneratorsConfig = {
			subGenConf: true,
			rootGroup: {
				rootGen: createGen("root"),
			},
		};

		const result = mergeGeneratorConfig({
			defaultDirConfig,
			dirConfig,
			rootConfig,
		});

		expect(result.subGenConf).toBe(true);
		expect(Object.keys(result)).toContain("default");
		expect(Object.keys(result)).toContain("rootGroup");
	});

	it("should preserve grouped structure when all configs have subGenConf", () => {
		const defaultDirConfig: GeneratorsConfig = {
			subGenConf: true,
			default: createGroupedGen("default"),
		};
		const dirConfig: GeneratorsConfig = {
			subGenConf: true,
			dir: createGroupedGen("dir"),
		};
		const rootConfig: GeneratorsConfig = {
			subGenConf: true,
			root: createGroupedGen("root"),
		};

		const result = mergeGeneratorConfig({
			defaultDirConfig,
			dirConfig,
			rootConfig,
		});

		expect(result.subGenConf).toBe(true);
		expect(Object.keys(result)).toEqual([
			"subGenConf",
			"default",
			"dir",
			"root",
		]);
	});

	it("should return flat config if none has subGenConf", () => {
		const defaultDirConfig: Generators = {
			defaultGen: createGen("default"),
		};
		const dirConfig: Generators = {
			dirGen: createGen("dir"),
		};
		const rootConfig: Generators = {
			rootGen: createGen("root"),
		};

		const result = mergeGeneratorConfig({
			defaultDirConfig,
			dirConfig,
			rootConfig,
		});

		expect("subGenConf" in result).toBe(false);
		expect(Object.keys(result)).toEqual(["defaultGen", "dirGen", "rootGen"]);
	});

	it("should wrap rootConfig into grouped structure when subGenConf is missing", () => {
		const defaultDirConfig: GeneratorsConfig = {
			subGenConf: true,
			default: createGroupedGen("default"),
		};

		const dirConfig: GeneratorsConfig = {
			subGenConf: true,
			dir: createGroupedGen("dir"),
		};

		const rootConfig: Generators = {
			rootGen: createGen("root"),
		};

		const result = mergeGeneratorConfig({
			defaultDirConfig,
			dirConfig,
			rootConfig,
		});

		expect(result.subGenConf).toBe(true);
		expect(result.default).toBeDefined();
		expect(result.dir).toBeDefined();
		expect(result.default).toMatchObject({
			"default-gen": expect.any(Function),
			rootGen: expect.any(Function),
		});
	});

	describe("mergeGeneratorConfig", () => {
		it("should handle all configs being null", () => {
			const result = mergeGeneratorConfig({
				defaultDirConfig: null,
				dirConfig: null,
				rootConfig: null,
			});

			expect(result).toEqual({});
		});
	});
});
