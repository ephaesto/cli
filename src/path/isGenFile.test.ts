import { describe, expect, it } from "vitest";
import { isGenFile } from "./isGenFile";

describe("isGenFile", () => {
	it("returns true for file ending with .gen.json", () => {
		expect(isGenFile("/some/path/data.gen.json")).toBe(true);
		expect(isGenFile("data.gen.json")).toBe(true);
		expect(isGenFile("./data.gen.json")).toBe(true);
	});

	it("returns false for file ending with .json but not .gen.json", () => {
		expect(isGenFile("/some/path/data.json")).toBe(false);
		expect(isGenFile("data.config.json")).toBe(false);
		expect(isGenFile("gen.data.json")).toBe(false);
	});

	it("returns false for non-json files", () => {
		expect(isGenFile("data.gen.js")).toBe(false);
		expect(isGenFile("data.gen.txt")).toBe(false);
	});

	it("returns false for directories", () => {
		expect(isGenFile("/some/path/gen.json/")).toBe(false);
	});
});
