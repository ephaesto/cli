import { CONF_STARTERS, PLOP_FILE } from "../const/config";
import type { CmdFn } from "../entities/CmdFn";
import type { StarterConfig } from "../entities/Starter";
import { findConfig } from "../path/findConfig";
import { findPlopPath } from "../path/findPlopPath";
import { pathConstructor } from "../path/pathConstructor";
import { formatError } from "../utils/formatError";
import { logError, logger } from "../utils/logger";
import { constructorPlop } from "./utils/constructorPlop";
import { findArgs } from "./utils/findArgs";
import { findSkippedParams } from "./utils/findSkippedParams";
import {
	extractAllGeneratorsConfig,
	mergeGeneratorConfig,
} from "./utils/generators";
import { extractAllStarter, mergeStarterConfig } from "./utils/starter";

export const cmdStart: CmdFn = ({
	program,
	name,
	config,
	dir,
	defaultDir,
	stopSpinner,
}) => {
	program
		.command(name)
		.description("Generate elements by file(json)")
		.argument("[string...]", "Arguments for the Starter")
		.option("--out <path>", "Path to generate files", process.cwd())
		.option("-f, --force", "force overwrites the existing file", false)
		.allowUnknownOption(true)
		.action(async (defaultArgs, { force, out: outPath }, command) => {
			try {
				const configPath = findPlopPath({
					dir,
					defaultDir,
					namePlopFile: config.plop || PLOP_FILE,
				});
				const allStarterConfig = await findConfig<StarterConfig>({
					dir,
					defaultDir,
					nameConfigFile: config.config || CONF_STARTERS,
				});
				const generatorsConfig = mergeGeneratorConfig(
					extractAllGeneratorsConfig(allStarterConfig),
				);
				const starterConfig = mergeStarterConfig(
					extractAllStarter(allStarterConfig),
				);
				const rawArgs = findSkippedParams(program, command);
				const args = findArgs(defaultArgs, rawArgs);
				const dest = await pathConstructor(outPath);
				stopSpinner();
				await constructorPlop({
					args,
					configPath,
					generatorsConfig,
					starterConfig,
					force,
					dest,
				});
				process.exit(1);
			} catch (anyError) {
				logger("");
				const error = formatError(anyError);
				logError(error);
				process.exit();
			}
		});
};
