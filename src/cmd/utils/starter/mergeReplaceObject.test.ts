import { describe, expect, it } from "vitest";
import { mergeReplaceObject } from "./mergeReplaceObject";

describe("mergeReplaceObject", () => {
	it("should replace all keys in oldObject with keys from newValues", () => {
		const oldObject: Record<string, unknown> = {
			a: 1,
			b: 2,
			c: 3,
		};

		const newValues: Record<string, unknown> = {
			x: "new",
			y: true,
		};

		mergeReplaceObject(oldObject, newValues);

		expect(oldObject).toEqual({
			x: "new",
			y: true,
		});
	});

	it("should handle empty oldObject", () => {
		const oldObject: Record<string, unknown> = {};
		const newValues: Record<string, unknown> = { a: 42 };

		mergeReplaceObject(oldObject, newValues);

		expect(oldObject).toEqual({ a: 42 });
	});

	it("should handle empty newValues", () => {
		const oldObject: Record<string, unknown> = { a: 1, b: 2 };
		const newValues: Record<string, unknown> = {};

		mergeReplaceObject(oldObject, newValues);

		expect(oldObject).toEqual({});
	});

	it("should mutate the original object", () => {
		const original = { a: "keep" };
		const replacement = { b: "new" };

		mergeReplaceObject(original, replacement);

		expect(original).toEqual({ b: "new" });
	});
});
