import { INIT_PLOP_FILE } from "~/src/const/config";
import { INIT } from "~/src/const/init";
import type { CmdFn } from "~/src/entities/CmdFn";
import { findPlopPath } from "~/src/path/findPlopPath";
import { formatError } from "~/src/utils/formatError";
import { logError, logger } from "~/src/utils/logger";
import { cmdPlop } from "./utils/cmdPlop";

export const cmdInit: CmdFn = async ({
	program,
	name,
	config,
	dir,
	stopSpinner,
	defaultDir,
}) => {
	program
		.command(name)
		.description("initialize cli ")
		.option("-f, --force", "force overwrites the existing file", false)
		.action(async ({ force }) => {
			try {
				const configPath = findPlopPath({
					dir,
					defaultDir,
					namePlopFile: config.plop || INIT_PLOP_FILE,
				});
				stopSpinner();
				await cmdPlop({ args: [INIT], configPath: configPath, force });
				process.exit(0);
			} catch (anyError) {
				logger("");
				const error = formatError(anyError);
				logError(error);
				process.exit(1);
			}
		});
};
