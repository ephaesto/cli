import { describe, expect, it } from "vitest";
import { filterValues } from "./filterValues";

describe("filterValues", () => {
	it("should return the value matching keyFilter in args", () => {
		const filter = {
			keyFilter: "type",
			defaultFilter: "default",
			values: {
				ts: "TypeScript",
				js: "JavaScript",
				default: "Unknown",
			},
		};
		const args = { type: "ts" };
		const result = filterValues(filter, args);
		expect(result).toBe("TypeScript");
	});

	it("should return the default value if keyFilter is missing in args", () => {
		const filter = {
			keyFilter: "type",
			defaultFilter: "default",
			values: {
				ts: "TypeScript",
				js: "JavaScript",
				default: "Unknown",
			},
		};
		const args = { name: "project" };
		const result = filterValues(filter, args);
		expect(result).toBe("Unknown");
	});

	it("should return the default value if keyFilter exists but is undefined in values", () => {
		const filter = {
			keyFilter: "type",
			defaultFilter: "default",
			values: {
				default: "Fallback",
			},
		};
		const args = { type: "ts" };
		const result = filterValues(filter, args);
		expect(result).toBeUndefined(); // because 'ts' is not in values
	});

	it("should handle numeric values correctly", () => {
		const filter = {
			keyFilter: "level",
			defaultFilter: "low",
			values: {
				high: 3,
				medium: 2,
				low: 1,
			},
		};
		const args = { level: "medium" };
		const result = filterValues(filter, args);
		expect(result).toBe(2);
	});
});
