import { beforeEach, describe, expect, it, vi } from "vitest";
import * as setGeneratorsModule from "~/src/config/generators";
import { CONF_GENERATORS, PLOP_FILE } from "~/src/const/config";
import * as findConfigModule from "~/src/path/findConfig";
import * as findPlopPathModule from "~/src/path/findPlopPath";
import * as pathConstructorModule from "~/src/path/pathConstructor";
import { render } from "~/src/test/render";
import * as formatErrorModule from "~/src/utils/formatError";
import * as loggerModule from "~/src/utils/logger";
import { cmdNew } from "./cmdNew";
import * as cmdPlopModule from "./utils/cmdPlop";
import * as generatorUtils from "./utils/generators";

beforeEach(() => {
	vi.resetAllMocks();

	vi.spyOn(findPlopPathModule, "findPlopPath").mockReturnValue(
		"mocked/plop/path.js",
	);

	vi.spyOn(findConfigModule, "findConfig").mockResolvedValue({
		config: "raw",
	} as any);

	vi.spyOn(generatorUtils, "mergeGeneratorConfig").mockReturnValue({
		merged: "config",
	} as any);

	vi.spyOn(generatorUtils, "findGenerators").mockResolvedValue([
		{ name: "cli" },
	] as any);

	vi.spyOn(setGeneratorsModule, "setGenerators").mockImplementation(() => {});

	vi.spyOn(pathConstructorModule, "pathConstructor").mockResolvedValue(
		"mocked/output",
	);

	vi.spyOn(cmdPlopModule, "cmdPlop").mockResolvedValue(undefined);

	vi.spyOn(loggerModule, "logger").mockImplementation(() => {});
	vi.spyOn(loggerModule, "logError").mockImplementation(() => {});
	vi.spyOn(formatErrorModule, "formatError").mockReturnValue(
		"Formatted error" as any,
	);
});

describe("cmdNew", () => {
	it("should run cmdPlop and exit 0", async () => {
		const renderPromise = render({
			argv: [
				"new",
				"cli",
				"--out",
				"./output",
				"--force",
				"--type-gen",
				"basic",
			],
			setup: ({ program, processTerm }) => {
				cmdNew({
					program,
					name: "new",
					config: {
						plop: "plopfile.js",
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

		expect(cmdPlopModule.cmdPlop).toHaveBeenCalledWith(
			expect.objectContaining({
				args: expect.arrayContaining(["cli"]),
				configPath: "mocked/plop/path.js",
				dest: "mocked/output",
				force: true,
				ignorePrompts: false,
			}),
		);
		expect(exitCode).toBe(0);
	});

	it("should fallback to PLOP_FILE and CONF_GENERATORS", async () => {
		await render({
			argv: ["new", "cli"],
			setup: ({ program, processTerm }) => {
				cmdNew({
					program,
					name: "new",
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
		vi.spyOn(cmdPlopModule, "cmdPlop").mockRejectedValueOnce(
			new Error("Mocked failure"),
		);

		const renderPromise = render({
			argv: ["new", "bad"],
			setup: ({ program, processTerm }) => {
				cmdNew({
					program,
					name: "new",
					config: {
						plop: "plopfile.js",
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
