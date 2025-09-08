import { beforeEach, describe, expect, it } from "vitest";
import type { ExtractFindDir, Extracts } from "~/src/entities/Extracts";
import { clearExtracts, getExtracts, setExtracts } from "./extracts";

describe("extracts store", () => {
	beforeEach(() => {
		clearExtracts();
	});

	const mockFindDir: ExtractFindDir = ({ nameDir, extraPath }) =>
		`/base/${nameDir ?? "default"}${extraPath ? `/${extraPath}` : ""}`;

	const extractFn = (findDir: typeof mockFindDir) => ({
		description: "Mock extract",
		path: findDir({ nameDir: "extract" }),
	});

	it("sets and gets a valid ExtractFn", () => {
		const config: Partial<Extracts> = {
			extractA: extractFn,
		};

		setExtracts(config);

		const result = getExtracts();
		expect(result).toEqual(config);
	});

	it("returns a copy, not a reference", () => {
		const config: Partial<Extracts> = {
			extractA: extractFn,
		};

		setExtracts(config);

		const result = getExtracts();
		result.extractA = null as any;

		expect(getExtracts().extractA).toBe(extractFn);
	});

	it("clears extracts", () => {
		setExtracts({
			extractA: extractFn,
		});

		clearExtracts();

		expect(getExtracts()).toEqual({});
	});
});
