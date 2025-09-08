import { describe, expect, it } from "vitest";
import { STARTER_TYPES } from "~/src/const/starters";
import { formatStep } from "./formatStep";

describe("formatStep", () => {
	it("should return CMD_PLOP type when step has generator", () => {
		const input = { generator: "plop-generator" };
		const result = formatStep(input);
		expect(result.type).toBe(STARTER_TYPES.CMD_PLOP);
		expect(result.step).toEqual(input);
	});

	it('should return FILE_PLOP type when step has "in"', () => {
		const input = { in: "src/index.ts" };
		const result = formatStep(input);
		expect(result.type).toBe(STARTER_TYPES.FILE_PLOP);
		expect(result.step).toEqual(input);
	});

	it("should return MULTI_CHOICE type when step has question", () => {
		const input = { question: "Choose one" };
		const result = formatStep(input);
		expect(result.type).toBe(STARTER_TYPES.MULTI_CHOICE);
		expect(result.step).toEqual(input);
	});

	it("should return FILTER type when step has keyFilter", () => {
		const input = { keyFilter: "filterKey" };
		const result = formatStep(input);
		expect(result.type).toBe(STARTER_TYPES.FILTER);
		expect(result.step).toEqual(input);
	});

	it("should return STARTER type when step has starterName", () => {
		const input = { starterName: "starter-template" };
		const result = formatStep(input);
		expect(result.type).toBe(STARTER_TYPES.STARTER);
		expect(result.step).toEqual(input);
	});

	it("should return UNKNOWN type when step has no known keys", () => {
		const input = { foo: "bar" };
		const result = formatStep(input);
		expect(result.type).toBe(STARTER_TYPES.UNKNOWN);
		expect(result.step).toEqual(input);
	});

	it("should return INIT type when step has initGenerator", () => {
		const input = { initGenerator: "init-script" };
		const result = formatStep(input);
		expect(result.type).toBe(STARTER_TYPES.INIT);
		expect(result.step).toEqual(input);
	});
});
