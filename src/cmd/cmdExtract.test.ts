import { beforeEach, describe, expect, it, vi } from "vitest";
import * as setExtractsModule from "~/src/config/extracts";
import { CONF_EXTRACTS, INIT_PLOP_FILE } from "~/src/const/config";
import * as findConfigModule from "~/src/path/findConfig";
import * as findPlopPathModule from "~/src/path/findPlopPath";
import * as pathConstructorModule from "~/src/path/pathConstructor";
import { render } from "~/src/test/render";
import * as formatErrorModule from "~/src/utils/formatError";
import * as loggerModule from "~/src/utils/logger";
import { cmdExtract } from "./cmdExtract";
import * as cmdPlopModule from "./utils/cmdPlop";
import * as mergeExtractsConfigModule from "./utils/mergeExtractsConfig";

beforeEach(() => {
	vi.resetAllMocks();

	vi.spyOn(findPlopPathModule, "findPlopPath").mockReturnValue(
		"mocked/plop/path.js",
	);

	vi.spyOn(findConfigModule, "findConfig").mockResolvedValue({
		raw: "config",
	} as any);

	vi.spyOn(mergeExtractsConfigModule, "mergeExtractsConfig").mockReturnValue({
		merged: "extracts",
	} as any);

	vi.spyOn(setExtractsModule, "setExtracts").mockImplementation(() => {});

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

describe("cmdExtract", () => {
	it("should run cmdPlop and exit 0", async () => {
		const renderPromise = render({
			argv: ["extract", "user", "--out", "./output", "--force"],
			setup: ({ program, processTerm }) => {
				cmdExtract({
					program,
					name: "extract",
					config: {
						plop: "custom-plop.js",
						config: "extracts.json",
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
				args: ["user"],
				configPath: "mocked/plop/path.js",
				dest: "mocked/output",
				force: true,
				processTerm: expect.any(Object),
			}),
		);
		expect(exitCode).toBe(0);
	});

	it("should fallback to INIT_PLOP_FILE and CONF_EXTRACTS", async () => {
		await render({
			argv: ["extract", "user"],
			setup: ({ program, processTerm }) => {
				cmdExtract({
					program,
					name: "extract",
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
			expect.objectContaining({ nameConfigFile: CONF_EXTRACTS }),
		);
	});

	it("should call setExtracts with merged config", async () => {
		await render({
			argv: ["extract", "user"],
			setup: ({ program, processTerm }) => {
				cmdExtract({
					program,
					name: "extract",
					config: {},
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		expect(setExtractsModule.setExtracts).toHaveBeenCalledWith({
			merged: "extracts",
		});
	});

	it("should catch error and exit 1", async () => {
		vi.spyOn(cmdPlopModule, "cmdPlop").mockRejectedValueOnce(
			new Error("Mocked failure"),
		);

		const renderPromise = render({
			argv: ["extract", "fail"],
			setup: ({ program, processTerm }) => {
				cmdExtract({
					program,
					name: "extract",
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
