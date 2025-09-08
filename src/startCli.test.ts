import { beforeEach, describe, expect, it, vi } from "vitest";
import startCli from "~/src/startCli";
import { cmdExtract } from "./cmd/cmdExtract";
import { cmdGen } from "./cmd/cmdGen";
import { cmdInit } from "./cmd/cmdInit";
import { cmdNew } from "./cmd/cmdNew";
import { cmdStart } from "./cmd/cmdStart";
import { clearDirnames, getDirnames } from "./config/dirnames";
import { clearDirs, getDirs } from "./config/dirs";
import { getGlobalConfig } from "./config/global";
import { CONF_DIRNAMES } from "./const/config";
import { DIRS } from "./const/dirs";
import { addFolder } from "./plop/actions/addFolder";
import { copy } from "./plop/actions/copy";

const MockMerge = vi.fn((params) => params);

vi.mock("lodash.merge", async () => {
	const { default: merge } = await vi.importActual("lodash.merge");
	return {
		default: (...params: any[]) => {
			console.log(params);
			// @ts-expect-error
			const value = (merge as typeof import("lodash.merge"))(...params);
			return MockMerge(value);
		},
	};
});

vi.mock("commander", async () => {
	const actual = await vi.importActual<typeof import("commander")>("commander");
	return {
		...actual,
		Command: class extends actual.Command {
			parse() {
				return this;
			}
		},
	};
});

const MockFindConfig = vi.fn();
vi.mock("./path/findConfig", async () => {
	return { findConfig: (params: any) => MockFindConfig(params) };
});

vi.mock("ora", () => ({
	default: () => ({
		start: () => ({
			stop: vi.fn(),
		}),
	}),
}));

describe("startCli", () => {
	const mockCmdFn = vi.fn();
	const mockConfig = {
		name: "TestCLI",
		description: "A test CLI",
		version: "1.0.0",
		command: {
			greet: {
				cmdFn: mockCmdFn,
				description: "Say hello",
			},
		},
	};

	beforeEach(() => {
		mockCmdFn.mockClear();
		MockFindConfig.mockClear();
		clearDirs();
		clearDirnames();
	});

	it("should call cmdFn", async () => {
		MockFindConfig.mockReturnValue(
			Promise.resolve({
				dirConfig: {},
				defaultDirConfig: {},
				rootConfig: {},
			}),
		);
		const testDir = "/mock/dir";
		await startCli(mockConfig, testDir);

		expect(mockCmdFn).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "greet",
				config: { description: "Say hello" },
				dir: testDir,
				stopSpinner: expect.any(Function),
			}),
		);
	});

	it("should call setDirs", async () => {
		MockFindConfig.mockReturnValue(
			Promise.resolve({
				dirConfig: {},
				defaultDirConfig: {},
				rootConfig: {},
			}),
		);
		const testDir = "/mock/dir";
		await startCli(mockConfig, testDir);

		const result = {
			[DIRS.DIR]: getDirs(DIRS.DIR),
			[DIRS.DEFAULT_DIR]: getDirs(DIRS.DEFAULT_DIR),
			[DIRS.IN_PATH]: getDirs(DIRS.IN_PATH),
		};

		expect(result).toEqual({
			[DIRS.DIR]: "/mock/dir",
			[DIRS.DEFAULT_DIR]: expect.stringMatching(/\/\.cli$/),
			[DIRS.IN_PATH]: null,
		});
	});

	it("should call setGlobalConfig", async () => {
		MockFindConfig.mockReturnValue(
			Promise.resolve({
				dirConfig: {},
				defaultDirConfig: {},
				rootConfig: {},
			}),
		);
		const testDir = "/mock/dir";
		await startCli(mockConfig, testDir);

		const result = getGlobalConfig();

		expect(result).toEqual({
			name: "TestCLI",
			configFile: "config.cli.json",
			cliFolder: ".cli",
			rootKey: "root",
			dirnamesFile: "dirnames",
			description: "A test CLI",
			version: "1.0.0",
			command: {
				init: {
					cmdFn: cmdInit,
					plop: "plopfile/init.plopfile.ts",
				},
				extract: {
					cmdFn: cmdExtract,
					plop: "plopfile/extract.plopfile.ts",
					config: "extracts",
				},
				new: {
					cmdFn: cmdNew,
					plop: "plopfile/plopfile.ts",
					config: "generators",
				},
				gen: {
					cmdFn: cmdGen,
					plop: "plopfile/plopfile.ts",
					config: "generators",
				},
				start: {
					cmdFn: cmdStart,
					plop: "plopfile/plopfile.ts",
					config: "starters",
				},
				greet: { cmdFn: mockCmdFn, description: "Say hello" },
			},
			actions: { copy: copy, addFolder: addFolder },
		});
	});

	it("should configure program name, description and version", async () => {
		const spyName = vi.spyOn(require("commander").Command.prototype, "name");
		const spyDescription = vi.spyOn(
			require("commander").Command.prototype,
			"description",
		);
		const spyVersion = vi.spyOn(
			require("commander").Command.prototype,
			"version",
		);

		const testDir = "/mock/dir";
		await startCli(
			{
				name: null,
				description: null,
				version: null,
			},
			testDir,
		);

		expect(spyName).toHaveBeenCalledWith(expect.any(String));
		expect(spyDescription).toHaveBeenCalledWith(expect.any(String));
		expect(spyVersion).toHaveBeenCalledWith(expect.any(String));

		spyName.mockRestore();
		spyDescription.mockRestore();
		spyVersion.mockRestore();
	});

	it("should fallback to empty command object if config.command is undefined", async () => {
		MockFindConfig.mockReturnValue(
			Promise.resolve({
				dirConfig: {},
				defaultDirConfig: {},
				rootConfig: {},
			}),
		);
		const testDir = "/mock/dir";

		// config sans .command
		const configWithoutCommand = {
			name: "FallbackCLI",
			description: "Fallback test",
			version: "0.0.1",
		};

		const mockConfig = {
			...configWithoutCommand,
			command: "",
		};

		await startCli(mockConfig as any, testDir);

		const global = getGlobalConfig();
		expect(global.name).toBe("FallbackCLI");
	});

	it("should pass config.dirnamesFile when defined", async () => {
		const testDir = "/mock/dir";
		const customFile = "custom-dirnames.json";

		MockFindConfig.mockReturnValue(
			Promise.resolve({
				dirConfig: {},
				defaultDirConfig: {},
				rootConfig: {},
			}),
		);

		await startCli({ ...mockConfig, dirnamesFile: customFile }, testDir);

		expect(MockFindConfig).toHaveBeenCalledWith(
			expect.objectContaining({
				nameConfigFile: customFile,
			}),
		);
	});

	it("should fallback to CONF_DIRNAMES when config.dirnamesFile is undefined", async () => {
		MockMerge.mockImplementation((params) => {
			if (params.description === "mock") {
				return {
					...mockConfig,
					dirnamesFile: undefined,
				};
			}
			return params;
		});

		const testDir = "/mock/dir";

		MockFindConfig.mockReturnValue(
			Promise.resolve({
				defaultDirConfig: {},
				dirConfig: {},
				rootConfig: { test: "test" },
			}),
		);

		const configWithoutDirnamesFile = { description: "mock" };

		await startCli(configWithoutDirnamesFile, testDir);

		expect(MockFindConfig).toHaveBeenCalledWith(
			expect.objectContaining({
				dir: "/mock/dir",
				nameConfigFile: CONF_DIRNAMES,
			}),
		);

		expect(getDirnames()).toMatchObject({ test: "test" });
	});
});
