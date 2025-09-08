import { beforeEach, describe, expect, it } from "vitest";
import { clearDirnames, getDirnames, setDirnames } from "./dirnames";

describe("dirnames state management", () => {
	beforeEach(() => {
		clearDirnames();
	});

	it("should set dirnames correctly", () => {
		setDirnames({ a: "foo", b: "bar" });
		expect(getDirnames()).toEqual({ a: "foo", b: "bar" });
	});

	it("should overwrite previous dirnames", () => {
		setDirnames({ a: "foo" });
		setDirnames({ b: "bar" });
		expect(getDirnames()).toEqual({ b: "bar" });
	});

	it("should return a copy, not a reference", () => {
		setDirnames({ a: "foo" });
		const result = getDirnames();
		result.a = "mutated";
		expect(getDirnames()).toEqual({ a: "foo" });
	});

	it("should clear dirnames", () => {
		setDirnames({ a: "foo" });
		clearDirnames();
		expect(getDirnames()).toEqual({});
	});
});
