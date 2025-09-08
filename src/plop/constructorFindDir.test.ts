import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearDirs, setDirs } from "~/src/config/dirs";
import { clearGlobalConfig, setGlobalConfig } from "~/src/config/global";
import { clearRoots, setRoots } from "~/src/config/roots";
import { CLI_FOLDER } from "~/src/const/config";
import { DIRS } from "~/src/const/dirs";
import { ROOTS } from "~/src/const/roots";
import { clearDirnames, setDirnames } from "../config/dirnames";
import { constructorFindDir } from "./constructorFindDir";

beforeEach(() => {
	vi.resetAllMocks();
	clearDirs();
	clearRoots();
	clearGlobalConfig();
	clearDirnames();
});

describe("constructorFindDir", () => {
	it("returns default path when no root is found", () => {
		setDirs({ [DIRS.DIR]: "/default-dir" });
		setDirnames({
			components: "/my-root/components",
		});

		const findDirFactory = constructorFindDir();
		const findDir = findDirFactory();
		const result = findDir("subfolder");

		expect(result).toBe(path.join("/default-dir", "subfolder"));
	});

	it("returns configured path when root and config are present", () => {
		setDirnames({
			components: "/my-root/components",
		});

		setDirs({ [DIRS.DIR]: "/ignored-dir" });
		setRoots({ [ROOTS.ROOT]: "/my-root" });
		setGlobalConfig({
			configFile: "custom.json",
			dirnamesFile: "direnames",
			cliFolder: "cli",
		});

		const findDirFactory = constructorFindDir();
		const findDir = findDirFactory("components");
		const result = findDir("button");

		expect(result).toBe(path.join("/my-root/components", "button"));
	});

	it("falls back to default keys if config is partial", () => {
		setDirnames({});
		setRoots({ [ROOTS.ROOT]: "/my-root" });
		setGlobalConfig({});

		const findDirFactory = constructorFindDir();
		const findDir = findDirFactory();
		const result = findDir(DIRS.DIR);

		expect(result).toBe(path.join("/my-root", CLI_FOLDER, DIRS.DIR));
	});

	it("uses fallback name when nameDir is undefined", () => {
		setDirs({ [DIRS.DIR]: "/default-dir" });

		const findDirFactory = constructorFindDir();
		const findDir = findDirFactory();

		const result = findDir("file.ts");

		expect(result).toBe(path.join("/default-dir", "file.ts"));
	});

	it("uses fallback name with bad name when nameDir is undefined", () => {
		setDirs({ [DIRS.DIR]: "/default-dir" });

		const findDirFactory = constructorFindDir();
		const findDir = findDirFactory("custom");

		const result = findDir("file.ts");

		expect(result).toBe(path.join("/default-dir", "file.ts"));
	});
});
