import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearDirs, setDirs } from "~/src/config/dirs";
import { clearGlobalConfig, setGlobalConfig } from "~/src/config/global";
import { clearRoots, setRoots } from "~/src/config/roots";
import { CLI_FOLDER } from "~/src/const/config";
import { DIRS } from "~/src/const/dirs";
import { ROOTS } from "~/src/const/roots";
import { clearDirnames, setDirnames } from "../config/dirnames";
import { constructorExtractFindDir } from "./constructorExtractFindDir";

beforeEach(() => {
	vi.resetAllMocks();
	clearDirs();
	clearRoots();
	clearGlobalConfig();
	clearDirnames();
});

describe("constructorExtractFindDir", () => {
	it("returns default path when no root is found", () => {
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "dir/sub",
		});

		const extract = constructorExtractFindDir();
		const result = extract(DIRS.DIR)("file.ts");

		expect(result).toBe(path.join("/base-dir", "sub", "file.ts"));
	});

	it("falls back to rootDir when config is partial", () => {
		setDirnames({});
		setDirs({
			[DIRS.DIR]: "/ignored-dir",
			[DIRS.DEFAULT_DIR]: "/ignored-default",
			[DIRS.IN_PATH]: "dir/sub",
		});
		setRoots({ [ROOTS.ROOT]: "/my-root" });
		setGlobalConfig({});

		const extract = constructorExtractFindDir();
		const result = extract("rootDir")("file.ts");

		expect(result).toBe(path.join("/my-root", CLI_FOLDER, "sub", "file.ts"));
	});

	it("parses name from IN_PATH when it matches REG_IS_DIRS", () => {
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "[custom]/nested",
		});

		const extract = constructorExtractFindDir();
		const result = extract(DIRS.DIR)("file.ts");

		expect(result).toBe(path.join("/base-dir", "nested", "file.ts"));
	});

	it("uses fallback when IN_PATH is empty", () => {
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "",
		});

		const extract = constructorExtractFindDir();
		const result = extract(DIRS.DIR)("file.ts");

		expect(result).toBe(path.join("/base-dir", "file.ts"));
	});

	it("uses empty string when extraPath is undefined", () => {
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "[dir]/sub",
		});

		const extract = constructorExtractFindDir();
		const result = extract(DIRS.DIR)(""); // pas d'extraPath

		expect(result).toBe(path.join("/base-dir", "sub"));
	});

	it("handles unknown nameDir gracefully", () => {
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "",
		});

		const extract = constructorExtractFindDir();
		const result = extract(DIRS.DIR)("file.ts");

		expect(result).toBe(path.join("/base-dir", "file.ts"));
	});

	it("should return string empty when IN_PATH is empty", () => {
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "[dir]",
		});

		const extract = constructorExtractFindDir();
		const result = extract(DIRS.DIR)("file.ts");

		expect(result).toBe(path.join("/base-dir", "file.ts"));
	});

	it("uses fallback nameDir from outer name when inner nameDir is undefined", () => {
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "dir/sub",
		});

		// 👇 outer name = "custom", inner nameDir omitted
		const extract = constructorExtractFindDir();
		const result = extract("")("file.ts");

		// innerName is empty, nameDir is undefined → fallback to outer name "custom"
		// "custom" is not in allDirs, so fallback to DIRS.DIR → "/base-dir"
		expect(result).toBe(path.join("/base-dir", "sub", "file.ts"));
	});
});
