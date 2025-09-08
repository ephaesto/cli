// mergeDirnames.test.ts
import { describe, expect, it } from "vitest";
import { mergeDirnames } from "./mergeDirnames";

describe("mergeDirnames", () => {
	it("should merge all configs with correct priority", () => {
		const result = mergeDirnames({
			defaultDirConfig: { a: "default", b: "default" },
			dirConfig: { b: "dir", c: "dir" },
			rootConfig: { c: "root", d: "root" },
		});

		expect(result).toEqual({
			a: "default",
			b: "dir",
			c: "root",
			d: "root",
		});
	});

	it("should handle missing configs gracefully", () => {
		const result = mergeDirnames({
			defaultDirConfig: { a: "default" },
			dirConfig: undefined,
			rootConfig: { b: "root" },
		});

		expect(result).toEqual({
			a: "default",
			b: "root",
		});
	});

	it("should return empty object if all configs are undefined", () => {
		const result = mergeDirnames({
			defaultDirConfig: undefined,
			dirConfig: undefined,
			rootConfig: undefined,
		});

		expect(result).toEqual({});
	});
});
