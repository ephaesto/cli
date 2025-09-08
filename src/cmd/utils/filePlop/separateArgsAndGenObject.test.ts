import { describe, expect, it } from "vitest";
import { GEN_OBJECT } from "../../../const/genObject";
import type { GenObject } from "../../../entities/GenObject";
import { separateArgsAndGenObject } from "./separateArgsAndGenObject";

const baseGenObject = {
	genName: "my-generator",
	genId: "123",
	genMeta: { author: "emeric" },
};

describe("separateArgsAndGenObject", () => {
	it("should exclude GEN_ID and GEN_META", () => {
		const input: GenObject = {
			...baseGenObject,
			[GEN_OBJECT.GEN_ID]: "id",
			[GEN_OBJECT.GEN_META]: { info: "meta" },
			foo: "bar",
		};

		const result = separateArgsAndGenObject(input, false, false);

		expect(result.genName).toBe("my-generator");
		expect(result.args).toHaveProperty("foo");
		expect(result.args).not.toHaveProperty(GEN_OBJECT.GEN_ID);
		expect(result.args).not.toHaveProperty(GEN_OBJECT.GEN_META);
	});

	it("should assign genDest if not ignored", () => {
		const input: GenObject = {
			...baseGenObject,
			[GEN_OBJECT.GEN_DEST]: "./output",
		};

		const result = separateArgsAndGenObject(input, false, false);
		expect(result.genDest).toBe("./output");
	});

	it("should ignore genDest if ignoreDest is true", () => {
		const input: GenObject = {
			...baseGenObject,
			[GEN_OBJECT.GEN_DEST]: "./output",
		};

		const result = separateArgsAndGenObject(input, false, true);
		expect(result.genDest).toBe("");
	});

	it("should push genLink if deep is true", () => {
		const input: GenObject = {
			...baseGenObject,
			[GEN_OBJECT.GEN_LINK]: "linked-generator",
		};

		const result = separateArgsAndGenObject(input, true, false);
		expect(result.argsList).toContain("linked-generator");
	});

	it("should sanitize and push single GenObject", () => {
		const nested: GenObject = {
			genName: "nested",
			genId: "456",
			genMeta: {},
		};

		const input: GenObject = {
			...baseGenObject,
			nested,
		};

		const result = separateArgsAndGenObject(input, false, false);
		expect(result.argsList).toContain(nested);
	});

	it("should sanitize and push array of GenObjects", () => {
		const nestedArray: GenObject[] = [
			{ genName: "nested1", genId: "1", genMeta: {} },
			{ genName: "nested2", genId: "2", genMeta: {} },
		];

		const input: GenObject = {
			...baseGenObject,
			nestedArray,
		};

		const result = separateArgsAndGenObject(input, false, false);
		expect(result.argsList).toEqual(expect.arrayContaining(nestedArray));
	});

	it("should treat non-genObject values as regular args", () => {
		const input: GenObject = {
			...baseGenObject,
			foo: "bar",
			count: 42,
		};

		const result = separateArgsAndGenObject(input, false, false);
		expect(result.args.foo).toBe("bar");
		expect(result.args.count).toBe(42);
	});
});
