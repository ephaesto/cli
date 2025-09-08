import { describe, expect, it, type Mock, vi } from "vitest";
import type { Generators, GeneratorsConfig } from "~/src/entities/Generators";
import type { FindConfig } from "~/src/path/findConfig";
import { mergeGeneratorConfig } from "../generators";
import { findStarterGeneratorConfig } from "./findStarterGeneratorConfig";

vi.mock("../generators", () => ({
	mergeGeneratorConfig: vi.fn(),
}));
const createGen = (label: string) => () => ({
	description: `Generator for ${label}`,
});

const createGroupedGen = (label: string): Generators => ({
	[`${label}-gen`]: createGen(label),
});

describe("findStarterGeneratorConfig", () => {
	it("should return config as-is if subGenConf is true", () => {
		const mockConfig: GeneratorsConfig = {
			subGenConf: true,
			default: createGroupedGen("default"),
		};

		// Simulate mergeGeneratorConfig returning config with subGenConf
		(mergeGeneratorConfig as unknown as Mock).mockReturnValue(mockConfig);

		const result = findStarterGeneratorConfig(
			{} as FindConfig<GeneratorsConfig>,
		);
		expect(result).toEqual(mockConfig);
	});

	it("should wrap config in default if subGenConf is missing", () => {
		const partialConfig: Partial<GeneratorsConfig> = {
			default: createGen("default"),
		};

		(mergeGeneratorConfig as unknown as Mock).mockReturnValue(partialConfig);

		const result = findStarterGeneratorConfig(
			{} as FindConfig<GeneratorsConfig>,
		);
		expect(result).toEqual({
			subGenConf: true,
			default: partialConfig as Generators,
		});
	});
});
