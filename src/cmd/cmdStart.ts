import { CONF_STARTERS, PLOP_FILE } from "~/src/const/config";
import type { CmdFn } from "~/src/entities/CmdFn";
import type { StarterConfig } from "~/src/entities/Starters";
import { findConfig } from "~/src/path/findConfig";
import { findPlopPath } from "~/src/path/findPlopPath";
import { pathConstructor } from "~/src/path/pathConstructor";
import { formatError } from "~/src/utils/formatError";
import { logError, logger } from "~/src/utils/logger";
import { constructorPlop } from "./utils/constructorPlop";
import { findArgs } from "./utils/findArgs";
import { findSkippedParams } from "./utils/findSkippedParams";
import { extractAllGeneratorsConfig } from "./utils/generators";
import { mergeInitsConfig } from "./utils/mergeInitsConfig";
import {
	extractAllStarter,
	findStarterGeneratorConfig,
	mergeStarterConfig,
} from "./utils/starter";
import { extractAllInitsConfig } from "./utils/starter/extractAllInitsConfig";

export const cmdStart: CmdFn = ({
	program,
	name,
	config,
	dir,
	defaultDir,
	stopSpinner,
	processTerm,
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

				const initsConfig = mergeInitsConfig(
					extractAllInitsConfig(allStarterConfig),
				);
				const generatorsConfig = findStarterGeneratorConfig(
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
					initsConfig,
					starterConfig,
					force,
					dest,
					processTerm,
				});
				processTerm.exit(0);
			} catch (anyError) {
				logger({ processTerm, args: [""] });
				const error = formatError(anyError);
				logError({ processTerm, error });
				processTerm.exit(1);
			}
		});
};
