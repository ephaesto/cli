import { beforeEach, describe, expect, it, vi } from "vitest";
import * as findConfigModule from "~/src/path/findConfig";
import * as findPlopPathModule from "~/src/path/findPlopPath";
import { render } from "~/src/test/render";
import * as formatErrorModule from "~/src/utils/formatError";
import * as loggerModule from "~/src/utils/logger";
import { CONF_STARTERS, PLOP_FILE } from "../const/config";
import { cmdStart } from "./cmdStart";
import * as constructorPlopModule from "./utils/constructorPlop";
import * as generatorUtils from "./utils/generators";
import * as mergeInitsConfigModule from "./utils/mergeInitsConfig";
import * as starterUtils from "./utils/starter";

beforeEach(() => {
	vi.resetAllMocks();

	vi.spyOn(findPlopPathModule, "findPlopPath").mockImplementation(() => {
		return "mocked/plop/path.js";
	});

	vi.spyOn(findConfigModule, "findConfig").mockImplementation((async ({
		nameConfigFile,
	}) => {
		if (nameConfigFile === "starter.json") {
			return { starter: "config" };
		}
		return {};
	}) as any);

	vi.spyOn(mergeInitsConfigModule, "mergeInitsConfig").mockReturnValue({
		merged: "inits",
	} as any);

	vi.spyOn(generatorUtils, "extractAllGeneratorsConfig").mockReturnValue([
		{ name: "api" },
		{ name: "cli" },
	] as any);

	vi.spyOn(starterUtils, "findStarterGeneratorConfig").mockReturnValue([
		{ name: "cli", config: {} },
	] as any);

	vi.spyOn(starterUtils, "extractAllStarter").mockReturnValue([
		{ name: "cli" },
	] as any);

	vi.spyOn(starterUtils, "mergeStarterConfig").mockReturnValue({
		starter: "merged",
	} as any);

	vi.spyOn(constructorPlopModule, "constructorPlop").mockImplementation((async (
		params: any,
	) => {
		console.log(params);
		if (params.args[0] === "bad") {
			throw new Error("Mocked failure");
		}
		// simulate success
	}) as any);

	vi.spyOn(loggerModule, "logger").mockImplementation(() => {});
	vi.spyOn(loggerModule, "logError").mockImplementation(() => {});
	vi.spyOn(formatErrorModule, "formatError").mockReturnValue(
		"Formatted error" as any,
	);
});

describe("cmdStart", () => {
	it("should run constructorPlop and exit 0", async () => {
		const { exitCode } = await render({
			argv: ["start", "cli", "--out", "./output", "--force"],
			setup: ({ program, processTerm }) => {
				cmdStart({
					program,
					name: "start",
					config: {
						plop: "plopfile.js",
						config: "starter.json",
					},
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		expect(exitCode).toBe(0);
	});

	it("should catch error, log it, and exit with code 1", async () => {
		const { exitCode } = await render({
			argv: ["start", "bad"],
			setup: ({ program, processTerm }) => {
				cmdStart({
					program,
					name: "start",
					config: {
						plop: "plopfile.js",
						config: "starter.json",
					},
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		expect(loggerModule.logger).toHaveBeenCalledWith(
			expect.objectContaining({ args: [""] }),
		);
		expect(formatErrorModule.formatError).toHaveBeenCalledWith(
			expect.any(Error),
		);
		expect(loggerModule.logError).toHaveBeenCalledWith(
			expect.objectContaining({
				error: "Formatted error",
			}),
		);
		expect(exitCode).toBe(1);
	});

	it("should use PLOP_FILE when config.plop is undefined", async () => {
		await render({
			argv: ["start", "cli"],
			setup: ({ program, processTerm }) => {
				cmdStart({
					program,
					name: "start",
					config: {
						config: "starter.json",
					},
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		expect(findPlopPathModule.findPlopPath).toHaveBeenCalledWith(
			expect.objectContaining({
				namePlopFile: PLOP_FILE,
			}),
		);
	});

	it("should use CONF_STARTERS when config.config is undefined", async () => {
		// Arrange/ Act
		await render({
			argv: ["start", "cli"],
			setup: ({ program, processTerm }) => {
				cmdStart({
					program,
					name: "start",
					config: {
						// no config key
						plop: "plopfile.js",
					},
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		// Assert
		expect(findConfigModule.findConfig).toHaveBeenCalledWith(
			expect.objectContaining({
				nameConfigFile: CONF_STARTERS,
			}),
		);
	});
});
