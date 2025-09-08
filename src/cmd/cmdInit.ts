import { INIT_PLOP_FILE } from "../const/config";
import { INIT } from "../const/init";
import type { CmdFn } from "../entities/CmdFn";
import { findPlopPath } from "../path/findPlopPath";
import { formatError } from "../utils/formatError";
import { logError, logger } from "../utils/logger";
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
				process.exit(1);
			} catch (anyError) {
				logger("");
				const error = formatError(anyError);
				logError(error);
				process.exit(1);
			}
		});
};
