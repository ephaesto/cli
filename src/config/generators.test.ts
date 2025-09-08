import { beforeEach, describe, expect, it } from "vitest";
import type { FindDir, Generators } from "~/src/entities/Generators";
import { clearGenerators, getGenerators, setGenerators } from "./generators";

describe("generators store", () => {
	beforeEach(() => {
		clearGenerators();
	});

	const mockFindDir: FindDir = ({ nameDir, extraPath }) =>
		`/base/${nameDir ?? "default"}${extraPath ? `/${extraPath}` : ""}`;

	const generatorsFn = (findDir: typeof mockFindDir) => ({
		description: "Mock generator",
		path: findDir({ nameDir: "mock" }),
	});

	it("sets and gets a simple GeneratorsFn", () => {
		const config: Partial<Generators> = {
			mock: generatorsFn,
		};

		setGenerators(config);

		const result = getGenerators();
		expect(result).toEqual(config);
	});

	it("sets and gets a wrapped generator object", () => {
		const config: Partial<Generators> = {
			wrapped: {
				generatorsFn,
				nameDir: "wrapped-dir",
			},
		};

		setGenerators(config);

		const result = getGenerators();
		expect(result).toEqual(config);
	});

	it("returns a copy, not a reference", () => {
		const config: Partial<Generators> = {
			mock: generatorsFn,
		};

		setGenerators(config);

		const result = getGenerators();
		result.mock = null as any;

		expect(getGenerators().mock).toBe(generatorsFn);
	});

	it("clears generators", () => {
		setGenerators({
			mock: generatorsFn,
		});

		clearGenerators();

		expect(getGenerators()).toEqual({});
	});
});
