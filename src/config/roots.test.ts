import { beforeEach, describe, expect, it } from "vitest";
import { ROOTS } from "~/src/const/roots";
import { clearRoots, getRoots, setRoots } from "./roots";

describe("roots store", () => {
	beforeEach(() => {
		clearRoots();
	});

	it("sets ROOTS.PARENT correctly", () => {
		setRoots({ [ROOTS.PARENT]: "/parent" });

		expect(getRoots(ROOTS.PARENT)).toBe("/parent");
		expect(getRoots(ROOTS.ROOT)).toBeNull();
	});

	it("sets ROOTS.ROOT correctly", () => {
		setRoots({ [ROOTS.ROOT]: "/root" });

		expect(getRoots(ROOTS.ROOT)).toBe("/root");
		expect(getRoots(ROOTS.PARENT)).toBeNull();
	});

	it("sets both ROOTS", () => {
		setRoots({
			[ROOTS.PARENT]: "/parent",
			[ROOTS.ROOT]: "/root",
		});

		expect(getRoots(ROOTS.PARENT)).toBe("/parent");
		expect(getRoots(ROOTS.ROOT)).toBe("/root");
	});

	it("ignores falsy values in setRoots", () => {
		setRoots({
			[ROOTS.PARENT]: null,
			[ROOTS.ROOT]: undefined,
		});

		expect(getRoots(ROOTS.PARENT)).toBeNull();
		expect(getRoots(ROOTS.ROOT)).toBeNull();
	});

	it("clears all roots", () => {
		setRoots({
			[ROOTS.PARENT]: "/parent",
			[ROOTS.ROOT]: "/root",
		});

		clearRoots();

		expect(getRoots(ROOTS.PARENT)).toBeNull();
		expect(getRoots(ROOTS.ROOT)).toBeNull();
	});
});
