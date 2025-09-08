import { describe, expect, it } from "vitest";
import type { GeneratorsConfig } from "~/src/entities/Generators";
import type { StarterConfig } from "~/src/entities/Starters";
import type { FindConfig } from "~/src/path/findConfig";
import { extractAllGeneratorsConfig } from "./extractAllGeneratorsConfig";

const createGen = (label: string) => () => ({
	description: `Generator for ${label}`,
});

const createGeneratorsConfig = (label: string): GeneratorsConfig => ({
	[label]: createGen(label),
});

const createStarterConfig = (label: string): StarterConfig => ({
	generators: createGeneratorsConfig(label),
	starters: {} as any,
});

describe("extractAllGeneratorsConfig", () => {
	it("should extract generators from all configs", () => {
		const config: FindConfig<StarterConfig> = {
			defaultDirConfig: createStarterConfig("default"),
			dirConfig: createStarterConfig("dir"),
			rootConfig: createStarterConfig("root"),
		};

		const result = extractAllGeneratorsConfig(config);

		expect(result.defaultDirConfig).not.toBeNull();
		expect(Object.keys(result.defaultDirConfig)).toEqual(["default"]);
		expect(result.dirConfig).not.toBeNull();
		expect(Object.keys(result.dirConfig)).toEqual(["dir"]);
		expect(result.rootConfig).not.toBeNull();
		expect(Object.keys(result.rootConfig)).toEqual(["root"]);
	});

	it("should handle null configs", () => {
		const config: FindConfig<StarterConfig> = {
			defaultDirConfig: null,
			dirConfig: null,
			rootConfig: createStarterConfig("root"),
		};

		const result = extractAllGeneratorsConfig(config);

		expect(result.defaultDirConfig).toBeNull();
		expect(result.dirConfig).toBeNull();
		expect(result.rootConfig).not.toBeNull();
		expect(Object.keys(result.rootConfig)).toEqual(["root"]);
	});

	it("should return null when generators are missing", () => {
		const config: FindConfig<StarterConfig> = {
			defaultDirConfig: { starters: {} } as any,
			dirConfig: { starters: {} } as any,
			rootConfig: { starters: {} } as any,
		};

		const result = extractAllGeneratorsConfig(config);

		expect(result.defaultDirConfig).toBeNull();
		expect(result.dirConfig).toBeNull();
		expect(result.rootConfig).toBeNull();
	});
});
