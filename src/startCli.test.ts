import { beforeEach, describe, expect, it, vi } from "vitest";
import startCli from "../src/startCli";
import { cmdExtract } from "./cmd/cmdExtract";
import { cmdGen } from "./cmd/cmdGen";
import { cmdInit } from "./cmd/cmdInit";
import { cmdNew } from "./cmd/cmdNew";
import { cmdStart } from "./cmd/cmdStart";
import { clearDirs, getDirs } from "./config/dirs";
import { getGlobalConfig } from "./config/global";
import { DIRS } from "./const/dirs";
import { addFolder } from "./plop/actions/addFolder";
import { copy } from "./plop/actions/copy";

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
	});

	it("should call cmdFn", async () => {
		const testDir = "/mock/dir";
		startCli(mockConfig, testDir);

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
		const testDir = "/mock/dir";
		startCli(mockConfig, testDir);

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

		clearDirs();
	});

	it("should call setGlobalConfig", async () => {
		const testDir = "/mock/dir";
		startCli(mockConfig, testDir);

		const result = getGlobalConfig();

		expect(result).toEqual({
			name: "TestCLI",
			configFile: "config.cli.json",
			cliFolder: ".cli",
			rootKey: "root",
			dirnamesKey: "dirs",
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
});
