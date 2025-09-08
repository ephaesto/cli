import type { Prompts } from "node-plop";
import { describe, expect, it } from "vitest";
import { SKIP_PARAMS_VALUE } from "~/src/const/skippedParams";
import { constructorArgsPlop } from "./constructorArgsPlop";

describe("constructorArgsPlop", () => {
	it("returns string[] directly when args is a list of strings", () => {
		const args = ["foo", "bar"];
		const prompts: Prompts = [];

		const result = constructorArgsPlop(args, prompts);
		expect(result).toEqual(["foo", "bar"]);
	});

	it("returns empty array when args is empty", () => {
		const args: string[] = [];
		const prompts: Prompts = [];

		const result = constructorArgsPlop(args, prompts);
		expect(result).toEqual([]);
	});

	it("maps prompt names to values from single object", () => {
		const args: [Record<string, string>] = [{ name: "Alice", age: "30" }];
		const prompts: Prompts = [
			{ name: "name", type: "input", message: "Your name?" },
			{ name: "age", type: "input", message: "Your age?" },
		];

		const result = constructorArgsPlop(args, prompts);
		expect(result).toEqual(["Alice", "30"]);
	});

	it("inserts SKIP_PARAMS_VALUE for missing keys", () => {
		const args: [Record<string, string>] = [{ name: "Alice" }];
		const prompts: Prompts = [
			{ name: "name", type: "input", message: "Your name?" },
			{ name: "age", type: "input", message: "Your age?" },
		];

		const result = constructorArgsPlop(args, prompts);
		expect(result).toEqual(["Alice", SKIP_PARAMS_VALUE]);
	});

	it("handles falsy values correctly (empty string, zero)", () => {
		const args: [Record<string, string>] = [{ name: "", age: "0" }];
		const prompts: Prompts = [
			{ name: "name", type: "input", message: "Your name?" },
			{ name: "age", type: "input", message: "Your age?" },
		];

		const result = constructorArgsPlop(args, prompts);
		expect(result).toEqual([SKIP_PARAMS_VALUE, "0"]);
	});
});
