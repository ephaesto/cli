import { describe, expect, it } from "vitest";
import { isGenJson } from "./isGenJson";

describe("isGenJson", () => {
	it("returns true for file ending with .gen.json", () => {
		expect(isGenJson("/some/path/data.gen.json")).toBe(true);
		expect(isGenJson("data.gen.json")).toBe(true);
		expect(isGenJson("./data.gen.json")).toBe(true);
	});

	it("returns false for file ending with .json but not .gen.json", () => {
		expect(isGenJson("/some/path/data.json")).toBe(false);
		expect(isGenJson("data.config.json")).toBe(false);
		expect(isGenJson("gen.data.json")).toBe(false);
	});

	it("returns false for non-json files", () => {
		expect(isGenJson("data.gen.js")).toBe(false);
		expect(isGenJson("data.gen.txt")).toBe(false);
	});

	it("returns false for directories", () => {
		expect(isGenJson("/some/path/gen.json/")).toBe(false);
	});
});
