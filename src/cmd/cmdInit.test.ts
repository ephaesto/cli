import { beforeEach, describe, expect, it, vi } from "vitest";
import { CONF_INITS, INIT_PLOP_FILE } from "~/src/const/config";
import { DEFAULT_INIT } from "~/src/const/init";
import * as findConfigModule from "~/src/path/findConfig";
import * as findPlopPathModule from "~/src/path/findPlopPath";
import { render } from "~/src/test/render";
import * as formatErrorModule from "~/src/utils/formatError";
import * as loggerModule from "~/src/utils/logger";
import * as globalConfigModule from "../config/global";
import * as setInitsModule from "../config/inits";
import * as pathConstructorModule from "../path/pathConstructor";
import { cmdInit } from "./cmdInit";
import * as cmdPlopModule from "./utils/cmdPlop";
import * as mergeInitsConfigModule from "./utils/mergeInitsConfig";

beforeEach(() => {
	vi.resetAllMocks();

	vi.spyOn(findPlopPathModule, "findPlopPath").mockReturnValue(
		"mocked/plop/path.js",
	);

	vi.spyOn(findConfigModule, "findConfig").mockResolvedValue({
		raw: "config",
	} as any);

	vi.spyOn(mergeInitsConfigModule, "mergeInitsConfig").mockReturnValue({
		merged: "inits",
	} as any);

	vi.spyOn(setInitsModule, "setInits").mockImplementation(() => {});

	vi.spyOn(pathConstructorModule, "pathConstructor").mockResolvedValue(
		"mocked/output",
	);

	vi.spyOn(cmdPlopModule, "cmdPlop").mockResolvedValue(undefined);

	vi.spyOn(globalConfigModule, "getGlobalConfig").mockReturnValue({
		configFileExt: "json",
		configFileType: "camelCase",
	});

	vi.spyOn(loggerModule, "logger").mockImplementation(() => {});
	vi.spyOn(loggerModule, "logError").mockImplementation(() => {});
	vi.spyOn(formatErrorModule, "formatError").mockReturnValue(
		"Formatted error" as any,
	);
});

describe("cmdInit", () => {
	it("should run cmdPlop with args and exit 0", async () => {
		const renderPromise = render({
			argv: ["init", "setup"],
			setup: ({ program, processTerm }) => {
				cmdInit({
					program,
					name: "init",
					config: {
						plop: "custom-plop.js",
						config: "inits.json",
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
				args: ["setup"],
				configPath: "mocked/plop/path.js",
				dest: "mocked/output",
				force: false,
				ignorePrompts: false,
			}),
		);
		expect(exitCode).toBe(0);
	});

	it("should fallback to INIT_PLOP_FILE and CONF_INITS", async () => {
		await render({
			argv: ["init", "setup"],
			setup: ({ program, processTerm }) => {
				cmdInit({
					program,
					name: "init",
					config: {}, // no plop or config
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		expect(findPlopPathModule.findPlopPath).toHaveBeenCalledWith(
			expect.objectContaining({ namePlopFile: INIT_PLOP_FILE }),
		);

		expect(findConfigModule.findConfig).toHaveBeenCalledWith(
			expect.objectContaining({ nameConfigFile: CONF_INITS }),
		);
	});

	it("should fallback to DEFAULT_INIT and configFileExt when args are empty", async () => {
		const renderPromise = render({
			argv: ["init"],
			setup: ({ program, processTerm }) => {
				cmdInit({
					program,
					name: "init",
					config: {},
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		await renderPromise;

		expect(cmdPlopModule.cmdPlop).toHaveBeenCalledWith(
			expect.objectContaining({
				args: [DEFAULT_INIT, "json", "camelCase"],
			}),
		);
	});

	it("should catch error and exit 1", async () => {
		vi.spyOn(cmdPlopModule, "cmdPlop").mockRejectedValueOnce(
			new Error("Mocked failure"),
		);

		const renderPromise = render({
			argv: ["init", "fail"],
			setup: ({ program, processTerm }) => {
				cmdInit({
					program,
					name: "init",
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
