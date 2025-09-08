import { describe, expect, it } from "vitest";
import { get } from "./get"; // adapte le chemin si besoin

describe("get", () => {
	it("should return the value at a simple path", () => {
		const obj = { a: { b: 42 } };
		expect(get(obj, "a.b")).toBe(42);
	});

	it("should return the value at a nested array path", () => {
		const obj = { a: { b: [{ c: "hello" }] } };
		expect(get(obj, "a.b[0].c")).toBe("hello");
	});

	it("should return the default value if path does not exist", () => {
		const obj = { a: { b: 1 } };
		expect(get(obj, "a.x.y", "default")).toBe("default");
	});

	it("should return the default value if object is null", () => {
		expect(get(null as any, "a.b", "fallback")).toBe("fallback");
	});

	it("should return the default value if object is undefined", () => {
		expect(get(undefined as any, "a.b", "fallback")).toBe("fallback");
	});

	it("should handle paths with brackets and dots", () => {
		const obj = { a: { "b.c": { d: 99 } } };
		expect(get(obj, 'a["b.c"].d')).toBe(99);
	});

	it("should return default if result equals the root object", () => {
		const obj = { a: 1 };
		expect(get(obj, "", "default")).toBe("default");
	});
});
