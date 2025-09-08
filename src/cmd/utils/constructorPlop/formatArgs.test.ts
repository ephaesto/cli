import { describe, expect, it } from "vitest";
import { formatArgs } from "./formatArgs";

describe("formatArgs", () => {
	it("should return isArrayArgs=true when args is an array of strings", () => {
		const input = ["--name", "project"];
		const result = formatArgs(input);
		expect(result.isArrayArgs).toBe(true);
		expect(result.args).toEqual(input);
	});

	it("should return isArrayArgs=true when args is empty", () => {
		const input: (string | Record<string, string>)[] = [];
		const result = formatArgs(input);
		expect(result.isArrayArgs).toBe(true);
		expect(result.args).toEqual([]);
	});

	it("should return isArrayArgs=false when args is an array with one object", () => {
		const input = [{ name: "project", type: "ts" }];
		const result = formatArgs(input);
		expect(result.isArrayArgs).toBe(false);
		expect(result.args).toEqual(input[0]);
	});

	it("should return isArrayArgs=true when first element is a string even if others are objects", () => {
		const input = ["--name", { name: "project" }];
		const result = formatArgs(input);
		expect(result.isArrayArgs).toBe(true);
		expect(result.args).toEqual(input as string[]);
	});
});
