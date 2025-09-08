import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearDirs, setDirs } from "../config/dirs";
import { clearGlobalConfig, setGlobalConfig } from "../config/global";
import { clearRoots, setRoots } from "../config/roots";
import { CLI_FOLDER } from "../const/config";
import { DIRS } from "../const/dirs";
import { ROOTS } from "../const/roots";
import * as reader from "../utils/readJson";
import { constructorExtractFindDir } from "./constructorExtractFindDir";

beforeEach(() => {
	vi.resetAllMocks();
	clearDirs();
	clearRoots();
	clearGlobalConfig();
});

describe("constructorExtractFindDir", () => {
	it("returns default path when no root is found", () => {
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "dir/sub",
		});

		const extract = constructorExtractFindDir();
		const result = extract({ nameDir: "dir", extraPath: "file.ts" });

		expect(result).toBe(path.join("/base-dir", "sub", "file.ts"));
	});

	it("returns configured path when root and config are present", () => {
		vi.spyOn(reader, "readJson").mockReturnValue({
			customDirs: {
				dir: "/custom-dir",
			},
		});

		setDirs({
			[DIRS.DIR]: "/ignored-dir",
			[DIRS.DEFAULT_DIR]: "/ignored-default",
			[DIRS.IN_PATH]: "dir/sub",
		});
		setRoots({ [ROOTS.ROOT]: "/my-root" });
		setGlobalConfig({
			configFile: "custom.json",
			dirnamesKey: "customDirs",
			cliFolder: "cli",
		});

		const extract = constructorExtractFindDir();
		const result = extract({ extraPath: "file.ts" });

		expect(result).toBe(path.join("/custom-dir", "sub", "file.ts"));
	});

	it("falls back to rootDir when config is partial", () => {
		vi.spyOn(reader, "readJson").mockReturnValue({});
		setDirs({
			[DIRS.DIR]: "/ignored-dir",
			[DIRS.DEFAULT_DIR]: "/ignored-default",
			[DIRS.IN_PATH]: "dir/sub",
		});
		setRoots({ [ROOTS.ROOT]: "/my-root" });
		setGlobalConfig({});

		const extract = constructorExtractFindDir();
		const result = extract({ nameDir: "rootDir", extraPath: "file.ts" });

		expect(result).toBe(path.join("/my-root", CLI_FOLDER, "sub", "file.ts"));
	});

	it("parses name from IN_PATH when it matches REG_IS_DIRS", () => {
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "[custom]/nested",
		});

		const extract = constructorExtractFindDir();
		const result = extract({ extraPath: "file.ts" });

		expect(result).toBe(path.join("/base-dir", "nested", "file.ts"));
	});

	it("uses fallback when IN_PATH is empty", () => {
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "",
		});

		const extract = constructorExtractFindDir();
		const result = extract({ nameDir: "dir", extraPath: "file.ts" });

		expect(result).toBe(path.join("/base-dir", "file.ts"));
	});

	it("uses empty string when extraPath is undefined", () => {
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "[dir]/sub",
		});

		const extract = constructorExtractFindDir();
		const result = extract({ nameDir: "dir" }); // pas d'extraPath

		expect(result).toBe(path.join("/base-dir", "sub"));
	});

	it("handles unknown nameDir gracefully", () => {
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "",
		});

		const extract = constructorExtractFindDir();
		const result = extract({ nameDir: "unknown", extraPath: "file.ts" });

		expect(result).toBe(path.join("/base-dir", "file.ts"));
	});

	it("uses fallback when configCli is undefined", () => {
		vi.spyOn(reader, "readJson").mockReturnValue(undefined);

		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.IN_PATH]: "[dir]/sub",
		});
		setRoots({ [ROOTS.ROOT]: "/my-root" });
		setGlobalConfig({
			dirnamesKey: "customDirs",
		});

		const extract = constructorExtractFindDir();
		const result = extract({ nameDir: "dir", extraPath: "file.ts" });

		expect(result).toBe(path.join("/base-dir", "sub", "file.ts"));
	});

	it("should return string empty when IN_PATH is empty", () => {
		setDirs({
			[DIRS.DIR]: "/base-dir",
			[DIRS.DEFAULT_DIR]: "/default-dir",
			[DIRS.IN_PATH]: "[dir]",
		});

		const extract = constructorExtractFindDir();
		const result = extract({ nameDir: "dir", extraPath: "file.ts" });

		expect(result).toBe(path.join("/base-dir", "file.ts"));
	});
});
