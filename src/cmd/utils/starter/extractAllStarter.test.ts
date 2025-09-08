import { describe, expect, it } from "vitest";
import type {
	StarterConfig,
	StarterParams,
	Starters,
} from "~/src/entities/Starters";
import type { FindConfig } from "~/src/path/findConfig";
import { extractAllStarter } from "./extractAllStarter";

const createStarterParams = (label: string): StarterParams => ({
	typeGen: "plop",
	generator: label,
	params: { foo: "bar" },
	out: `./out/${label}`,
	force: true,
});

const createStarter = (label: string): Starters => ({
	step1: createStarterParams(label),
	step2: {
		question: `Choose for ${label}`,
		name: `multi-${label}`,
		values: {
			opt1: createStarterParams(`${label}-opt1`),
			opt2: createStarterParams(`${label}-opt2`),
		} as any,
	},
});

const createStarterConfig = (label: string): StarterConfig => ({
	generators: {
		[label]: {
			description: `Generator for ${label}`,
			run: () => `Running ${label}`,
		},
	} as any,
	starters: {
		[label]: createStarter(label),
	},
});

describe("extractAllStarter", () => {
	it("should extract starters from all configs", () => {
		const config: FindConfig<StarterConfig> = {
			defaultDirConfig: createStarterConfig("default"),
			dirConfig: createStarterConfig("dir"),
			rootConfig: createStarterConfig("root"),
		};

		const result = extractAllStarter(config);

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

		const result = extractAllStarter(config);

		expect(result.defaultDirConfig).toBeNull();
		expect(result.dirConfig).toBeNull();
		expect(result.rootConfig).not.toBeNull();
		expect(Object.keys(result.rootConfig)).toEqual(["root"]);
	});

	it("should return null when starters are missing", () => {
		const config: FindConfig<StarterConfig> = {
			defaultDirConfig: { generators: {} },
			dirConfig: { generators: {} },
			rootConfig: { generators: {} },
		} as any;

		const result = extractAllStarter(config);

		expect(result.defaultDirConfig).toBeNull();
		expect(result.dirConfig).toBeNull();
		expect(result.rootConfig).toBeNull();
	});
});
