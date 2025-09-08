import path from "node:path";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { clearGlobalConfig, setGlobalConfig } from "~/src/config/global";
import { clearRoots, setRoots } from "~/src/config/roots";
import { CONFIG_FILE } from "~/src/const/config";
import { ROOTS } from "~/src/const/roots";
import { FilePathError } from "~/src/errors/FilePathError";
import { findRoots } from "./findRoots";
import { pathConstructor } from "./pathConstructor";

vi.mock("./findRoots");

beforeEach(() => {
	clearRoots();
	clearGlobalConfig();
});

describe("pathConstructor (with ~/ and ~~)", () => {
	it("uses ROOTS.PARENT when defined", async () => {
		setRoots({ [ROOTS.PARENT]: "/parent" });

		const result = await pathConstructor("~/folder");
		expect(result).toBe(path.join("/parent", "folder"));
	});

	it("uses ROOTS.ROOT when defined", async () => {
		setRoots({ [ROOTS.ROOT]: "/root" });

		const result = await pathConstructor("~~/folder");
		expect(result).toBe(path.join("/root", "folder"));
	});

	it("throws an error if ROOTS.PARENT is missing", async () => {
		setGlobalConfig({ configFile: "custom.json" });

		await expect(pathConstructor("~/folder")).rejects.toThrow(
			new FilePathError(
				`The ${ROOTS.PARENT} option requires at least one '${"custom.json"}' file to be present.`,
			),
		);
	});

	it("throws an error if ROOTS.ROOT is missing", async () => {
		setGlobalConfig({ configFile: "custom.json" });

		await expect(pathConstructor("~~/folder")).rejects.toThrow(
			new FilePathError(
				`The ${ROOTS.ROOT} option requires at least one '${"custom.json"}' file in which root parameter set to 'true'`,
			),
		);
	});

	it("uses ROOTS.PARENT from findRoots when not initially set", async () => {
		(findRoots as Mock).mockReturnValue({
			[ROOTS.PARENT]: "/found-parent",
		});

		setRoots({});
		const result = await pathConstructor("~/folder");

		expect(result).toBe(path.join("/found-parent", "folder"));
	});

	it("uses ROOTS.ROOT from findRoots when not initially set", async () => {
		(findRoots as Mock).mockReturnValue({
			[ROOTS.ROOT]: "/found-root",
		});

		clearRoots();
		const result = await pathConstructor("~~/folder");

		expect(result).toBe(path.join("/found-root", "folder"));
	});

	it("throws error for ROOTS.PARENT when getGlobalConfig is undefined", async () => {
		(findRoots as Mock).mockReturnValue(undefined);
		setGlobalConfig({ configFile: false as unknown as string });

		await expect(pathConstructor("~/folder")).rejects.toThrow(
			new FilePathError(
				`The ${ROOTS.PARENT} option requires at least one '${CONFIG_FILE}' file to be present.`,
			),
		);
	});

	it("throws error for ROOTS.ROOT when getGlobalConfig is undefined", async () => {
		(findRoots as Mock).mockReturnValue(undefined);
		setGlobalConfig({ configFile: false as unknown as string });

		await expect(pathConstructor("~~/folder")).rejects.toThrow(
			new FilePathError(
				`The ${ROOTS.ROOT} option requires at least one '${CONFIG_FILE}' file in which root parameter set to 'true'`,
			),
		);
	});

	it("returns absolute path as-is", async () => {
		const absolutePath = path.resolve("/home/emeric/project/file.ts");

		const result = await pathConstructor(absolutePath);

		expect(result).toBe(absolutePath);
	});

	it("joins relative path with oldPath when no prefix is matched", async () => {
		const result = await pathConstructor("relative/path", "/base");

		expect(result).toBe(path.join("/base", "relative/path"));
	});

	it("returns oldPath when strPath is falsy", async () => {
		const result = await pathConstructor(undefined, "/fallback");

		expect(result).toBe("/fallback");
	});
});
