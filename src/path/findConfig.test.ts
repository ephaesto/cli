import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import * as rootsModule from "~/src/config/roots";
import { ROOTS } from "~/src/const/roots";
import { FilePathError } from "~/src/errors/FilePathError";
import * as configLoader from "~/src/utils/loadConfig";
import { findConfig } from "./findConfig";
import * as findRootsModule from "./findRoots";

vi.mock("node:fs");
vi.mock("~/src/utils/loadConfig", () => ({
	loadConfig: vi.fn(),
}));

beforeEach(() => {
	vi.resetAllMocks();
});

describe("findConfig", () => {
	const nameConfigFile = "config.ts";
	const nameFile = "config";
	const dir = "/custom";
	const defaultDir = "/default";
	const rootDir = "/root";

	const configObject = { setting: true };

	it("loads config from dir", async () => {
		const filePath = path.join(dir, nameFile);
		(fs.existsSync as Mock).mockImplementation((p) => p === `${filePath}.ts`);
		(configLoader.loadConfig as Mock).mockResolvedValue({
			default: configObject,
		});

		const result = await findConfig({ dir, defaultDir, nameConfigFile });

		expect(result).toEqual({
			dirConfig: configObject,
			defaultDirConfig: null,
			rootConfig: null,
		});
	});

	it("loads config from defaultDir", async () => {
		const filePath = path.join(defaultDir, nameFile);
		(fs.existsSync as Mock).mockImplementation((p) => p === `${filePath}.ts`);
		(configLoader.loadConfig as Mock).mockResolvedValue({
			default: configObject,
		});

		const result = await findConfig({ dir, defaultDir, nameConfigFile });

		expect(result).toEqual({
			dirConfig: null,
			defaultDirConfig: configObject,
			rootConfig: null,
		});
	});

	it("loads config from root", async () => {
		const filePath = path.join(rootDir, nameFile);
		vi.spyOn(rootsModule, "getRoots").mockReturnValue(null);
		vi.spyOn(findRootsModule, "findRoots").mockReturnValue({
			[ROOTS.ROOT]: rootDir,
		} as any);
		vi.spyOn(rootsModule, "setRoots").mockImplementation(() => {});
		(fs.existsSync as Mock).mockImplementation((p) => p === `${filePath}.ts`);
		(configLoader.loadConfig as Mock).mockResolvedValue({
			default: configObject,
		});

		const result = await findConfig({ dir, defaultDir, nameConfigFile });

		expect(result).toEqual({
			dirConfig: null,
			defaultDirConfig: null,
			rootConfig: configObject,
		});
	});

	it("loads config from all three locations", async () => {
		const paths = [
			path.join(dir, nameFile),
			path.join(defaultDir, nameFile),
			path.join(rootDir, nameFile),
		];

		vi.spyOn(rootsModule, "getRoots").mockReturnValue(null);
		vi.spyOn(findRootsModule, "findRoots").mockReturnValue({
			[ROOTS.ROOT]: rootDir,
		} as any);
		vi.spyOn(rootsModule, "setRoots").mockImplementation(() => {});
		(fs.existsSync as Mock).mockImplementation((p) =>
			paths.some((base) => p === `${base}.ts`),
		);
		(configLoader.loadConfig as Mock).mockResolvedValue({
			default: configObject,
		});

		const result = await findConfig({ dir, defaultDir, nameConfigFile });

		expect(result).toEqual({
			dirConfig: configObject,
			defaultDirConfig: configObject,
			rootConfig: configObject,
		});
	});

	it("throws FilePathError when no config is found", async () => {
		(fs.existsSync as Mock).mockReturnValue(false);
		vi.spyOn(rootsModule, "getRoots").mockReturnValue(null);
		vi.spyOn(findRootsModule, "findRoots").mockReturnValue({
			[ROOTS.ROOT]: null,
		} as any);

		await expect(
			findConfig({ dir, defaultDir, nameConfigFile }),
		).rejects.toThrow(
			new FilePathError(`The file "${nameConfigFile}" does not exist.`),
		);
	});

	it("loads config.js from root when file exists", async () => {
		const nameConfigFile = "config.js";
		const nameFile = "config";
		const rootDir = "/root";
		const configObject = { setting: true };
		const filePath = path.join(rootDir, nameFile);

		vi.spyOn(rootsModule, "getRoots").mockReturnValue(rootDir);
		(fs.existsSync as Mock).mockImplementation((p) => p === `${filePath}.js`);
		(configLoader.loadConfig as Mock).mockResolvedValue({
			default: configObject,
		});

		const result = await findConfig({
			dir: "/custom",
			defaultDir: "/default",
			nameConfigFile,
		});

		expect(result).toEqual({
			dirConfig: null,
			defaultDirConfig: null,
			rootConfig: configObject,
		});
	});

	it("uses nameConfigFile as-is when extension is not .ts or .js", async () => {
		const nameConfigFile = "config.json"; // 👈 extension non reconnue
		const configObject = { setting: true };
		const filePath = path.join(dir, nameConfigFile); // 👈 pas de strip

		(fs.existsSync as Mock).mockImplementation((p) => p === `${filePath}.ts`);
		(configLoader.loadConfig as Mock).mockResolvedValue({
			default: configObject,
		});

		const result = await findConfig({ dir, defaultDir, nameConfigFile });

		expect(result).toEqual({
			dirConfig: configObject,
			defaultDirConfig: null,
			rootConfig: null,
		});
	});
});
