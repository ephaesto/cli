import path from "node:path";
import { describe, expect, test } from "vitest";
import { readJson } from "./readJson";

describe("readJson", () => {
	test("should read and parse JSON file", () => {
		const filePath = path.resolve(__dirname, "mockReadJson.json");
		const result = readJson(filePath);

		expect(result).toEqual({
			name: "Charles",
			age: 30,
			active: true,
		});
	});
});
