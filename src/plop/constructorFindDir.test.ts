import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearDirs, setDirs } from "../config/dirs";
import { clearGlobalConfig, setGlobalConfig } from "../config/global";
import { clearRoots, setRoots } from "../config/roots";
import { CLI_FOLDER } from "../const/config";
import { DIRS } from "../const/dirs";
import { ROOTS } from "../const/roots";
import * as reader from "../utils/readJson";
import { constructorFindDir } from "./constructorFindDir";

beforeEach(() => {
	vi.resetAllMocks();
	clearDirs();
	clearRoots();
	clearGlobalConfig();
});

describe("constructorFindDir", () => {
	it("returns default path when no root is found", () => {
		setDirs({ [DIRS.DIR]: "/default-dir" });

		const findDirFactory = constructorFindDir();
		const findDir = findDirFactory();
		const result = findDir({ nameDir: DIRS.DIR, extraPath: "subfolder" });

		expect(result).toBe(path.join("/default-dir", "subfolder"));
	});

	it("returns configured path when root and config are present", () => {
		vi.spyOn(reader, "readJson").mockReturnValue({
			customDirs: {
				components: "/my-root/components",
			},
		});

		setDirs({ [DIRS.DIR]: "/ignored-dir" });
		setRoots({ [ROOTS.ROOT]: "/my-root" });
		setGlobalConfig({
			configFile: "custom.json",
			dirnamesKey: "customDirs",
			cliFolder: "cli",
		});

		const findDirFactory = constructorFindDir();
		const findDir = findDirFactory("components");
		const result = findDir({ extraPath: "Button" });

		expect(result).toBe(path.join("/my-root/components", "Button"));
	});

	it("falls back to default keys if config is partial", () => {
		vi.spyOn(reader, "readJson").mockReturnValue({});
		setRoots({ [ROOTS.ROOT]: "/my-root" });
		setGlobalConfig({});

		const findDirFactory = constructorFindDir();
		const findDir = findDirFactory();
		const result = findDir({ nameDir: DIRS.DIR });

		expect(result).toBe(path.join("/my-root", CLI_FOLDER));
	});

	it("uses fallback name when nameDir is undefined", () => {
		setDirs({ [DIRS.DIR]: "/default-dir" });

		const findDirFactory = constructorFindDir();
		const findDir = findDirFactory();

		const result = findDir({ extraPath: "file.ts" });

		// allDirs["custom"] n'existe pas, donc fallback sur allDirs[DIRS.DIR]
		expect(result).toBe(path.join("/default-dir", "file.ts"));
	});

	it("uses fallback name with bad name when nameDir is undefined", () => {
		setDirs({ [DIRS.DIR]: "/default-dir" });

		const findDirFactory = constructorFindDir();
		const findDir = findDirFactory("custom");

		const result = findDir({ extraPath: "file.ts" });

		expect(result).toBe(path.join("/default-dir", "file.ts"));
	});

	it("uses fallback when configCli is undefined or missing dirnamesKey", () => {
		vi.spyOn(reader, "readJson").mockReturnValue(undefined); // configCli = undefined

		setDirs({ [DIRS.DIR]: "/default-dir" });
		setRoots({ [ROOTS.ROOT]: "/my-root" });
		setGlobalConfig({
			configFile: "custom.json",
			dirnamesKey: "customDirs", // mais absente
			cliFolder: "cli",
		});

		const findDirFactory = constructorFindDir();
		const findDir = findDirFactory();
		const result = findDir({ nameDir: DIRS.DIR, extraPath: "file.ts" });

		expect(result).toBe(path.join("/my-root", "cli", "file.ts"));
	});
});
