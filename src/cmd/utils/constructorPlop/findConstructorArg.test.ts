import { describe, expect, it } from "vitest";
import { SKIP_PARAMS_VALUE } from "~/src/const/skippedParams";
import { findConstructorArg } from "./findConstructorArg";

describe("findConstructorArg", () => {
	it("should return the first element from array if valid", () => {
		const input = ["myArg", "other"];
		const result = findConstructorArg(input, "name");
		expect(result).toBe("myArg");
	});

	it("should return null if first element is SKIP_PARAMS_VALUE", () => {
		const input = [SKIP_PARAMS_VALUE, "other"];
		const result = findConstructorArg(input, "name");
		expect(result).toBeNull();
	});

	it("should return null if array is empty", () => {
		const input: string[] = [];
		const result = findConstructorArg(input, "name");
		expect(result).toBeNull();
	});

	it("should return null if array has only one SKIP_PARAMS_VALUE", () => {
		const input = [SKIP_PARAMS_VALUE];
		const result = findConstructorArg(input, "name");
		expect(result).toBeNull();
	});

	it("should return value from object if key exists", () => {
		const input = { name: "projectName", type: "ts" };
		const result = findConstructorArg(input, "name");
		expect(result).toBe("projectName");
	});

	it("should return null if key does not exist in object", () => {
		const input = { type: "ts" };
		const result = findConstructorArg(input, "name");
		expect(result).toBeNull();
	});
});
