import { beforeEach, describe, expect, it, vi } from "vitest";
import { CONF_GENERATORS, PLOP_FILE } from "~/src/const/config";
import * as findConfigModule from "~/src/path/findConfig";
import * as findPlopPathModule from "~/src/path/findPlopPath";
import * as pathConstructorModule from "~/src/path/pathConstructor";
import { render } from "~/src/test/render";
import * as formatErrorModule from "~/src/utils/formatError";
import * as loggerModule from "~/src/utils/logger";
import * as findParentConfigModule from "../path/findParentConfig";
import { cmdGen } from "./cmdGen";
import * as deepFilePlopModule from "./utils/filePlop";
import * as findFilePlopArgsModule from "./utils/findFilePlopArgs";
import * as mergeGeneratorConfigModule from "./utils/generators";

beforeEach(() => {
	vi.resetAllMocks();

	vi.spyOn(findPlopPathModule, "findPlopPath").mockReturnValue(
		"mocked/plop/path.js",
	);

	vi.spyOn(findConfigModule, "findConfig").mockResolvedValue({
		raw: "config",
	} as any);

	vi.spyOn(mergeGeneratorConfigModule, "mergeGeneratorConfig").mockReturnValue({
		merged: "config",
	} as any);

	vi.spyOn(pathConstructorModule, "pathConstructor").mockResolvedValue(
		"mocked/output",
	);

	vi.spyOn(findParentConfigModule, "findParentConfig").mockReturnValue({
		parent: true,
	} as any);

	vi.spyOn(deepFilePlopModule, "deepFilePlop").mockResolvedValue(undefined);

	vi.spyOn(findFilePlopArgsModule, "findFilePlopArgs").mockImplementation(
		async ({ filePlopFn }) => {
			await filePlopFn(["arg1", "arg2"]);
		},
	);

	vi.spyOn(loggerModule, "logger").mockImplementation(() => {});
	vi.spyOn(loggerModule, "logError").mockImplementation(() => {});
	vi.spyOn(formatErrorModule, "formatError").mockReturnValue(
		"Formatted error" as any,
	);
});

describe("cmdGen", () => {
	it("should run deepFilePlop and exit 0", async () => {
		const renderPromise = render({
			argv: [
				"gen",
				"--in",
				"./gen.json",
				"--out",
				"./output",
				"--force",
				"--deep",
				"--ignore-dest",
				"--type-gen",
				"basic",
			],
			setup: ({ program, processTerm }) => {
				cmdGen({
					program,
					name: "gen",
					config: {
						plop: "custom-plop.js",
						config: "generators.json",
					},
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		const { exitCode } = await renderPromise;

		expect(deepFilePlopModule.deepFilePlop).toHaveBeenCalledWith(
			expect.objectContaining({
				argsList: ["arg1", "arg2"],
				configPath: "mocked/plop/path.js",
				dest: "mocked/output",
				force: true,
				deep: true,
				ignoreDest: true,
				typeGen: "basic",
				generatorsConfig: { merged: "config" },
				parentConfig: { parent: true },
			}),
		);
		expect(exitCode).toBe(0);
	});

	it("should fallback to PLOP_FILE and CONF_GENERATORS", async () => {
		await render({
			argv: ["gen", "--in", "./gen.json"],
			setup: ({ program, processTerm }) => {
				cmdGen({
					program,
					name: "gen",
					config: {}, // no plop or config
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		expect(findPlopPathModule.findPlopPath).toHaveBeenCalledWith(
			expect.objectContaining({ namePlopFile: PLOP_FILE }),
		);

		expect(findConfigModule.findConfig).toHaveBeenCalledWith(
			expect.objectContaining({ nameConfigFile: CONF_GENERATORS }),
		);
	});

	it("should catch error and exit 1", async () => {
		vi.spyOn(findFilePlopArgsModule, "findFilePlopArgs").mockRejectedValueOnce(
			new Error("Mocked failure"),
		);

		const renderPromise = render({
			argv: ["gen", "--in", "./gen.json"],
			setup: ({ program, processTerm }) => {
				cmdGen({
					program,
					name: "gen",
					config: {},
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		const { exitCode } = await renderPromise;

		expect(loggerModule.logger).toHaveBeenCalledWith(
			expect.objectContaining({ args: [""] }),
		);
		expect(formatErrorModule.formatError).toHaveBeenCalledWith(
			expect.any(Error),
		);
		expect(loggerModule.logError).toHaveBeenCalledWith(
			expect.objectContaining({ error: "Formatted error" }),
		);
		expect(exitCode).toBe(1);
	});
});
