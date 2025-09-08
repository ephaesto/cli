import { beforeEach, describe, expect, it } from "vitest";
import { DIRS } from "~/src/const/dirs";
import { clearDirs, getDirs, setDirs } from "./dirs";

describe("dirs store", () => {
	beforeEach(() => {
		clearDirs();
	});

	it("sets DIR correctly", () => {
		setDirs({ [DIRS.DIR]: "/custom" });

		expect(getDirs(DIRS.DIR)).toBe("/custom");
		expect(getDirs(DIRS.DEFAULT_DIR)).toBeNull();
		expect(getDirs(DIRS.IN_PATH)).toBeNull();
	});

	it("sets DEFAULT_DIR correctly", () => {
		setDirs({ [DIRS.DEFAULT_DIR]: "/default" });

		expect(getDirs(DIRS.DEFAULT_DIR)).toBe("/default");
		expect(getDirs(DIRS.DIR)).toBeNull();
		expect(getDirs(DIRS.IN_PATH)).toBeNull();
	});

	it("sets IN_PATH correctly", () => {
		setDirs({ [DIRS.IN_PATH]: "/in/path" });

		expect(getDirs(DIRS.IN_PATH)).toBe("/in/path");
		expect(getDirs(DIRS.DIR)).toBeNull();
		expect(getDirs(DIRS.DEFAULT_DIR)).toBeNull();
	});

	it("sets multiple dirs at once", () => {
		setDirs({
			[DIRS.DIR]: "/custom",
			[DIRS.DEFAULT_DIR]: "/default",
			[DIRS.IN_PATH]: "/in/path",
		});

		expect(getDirs(DIRS.DIR)).toBe("/custom");
		expect(getDirs(DIRS.DEFAULT_DIR)).toBe("/default");
		expect(getDirs(DIRS.IN_PATH)).toBe("/in/path");
	});

	it("ignores falsy values in setDirs", () => {
		setDirs({
			[DIRS.DIR]: null,
			[DIRS.DEFAULT_DIR]: undefined,
			[DIRS.IN_PATH]: "",
		});

		expect(getDirs(DIRS.DIR)).toBeNull();
		expect(getDirs(DIRS.DEFAULT_DIR)).toBeNull();
		expect(getDirs(DIRS.IN_PATH)).toBeNull();
	});

	it("clears all dirs", () => {
		setDirs({
			[DIRS.DIR]: "/custom",
			[DIRS.DEFAULT_DIR]: "/default",
			[DIRS.IN_PATH]: "/in/path",
		});

		clearDirs();

		expect(getDirs(DIRS.DIR)).toBeNull();
		expect(getDirs(DIRS.DEFAULT_DIR)).toBeNull();
		expect(getDirs(DIRS.IN_PATH)).toBeNull();
	});
});
