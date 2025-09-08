import { setGenerators } from "../config/generators";
import { CONF_GENERATORS, PLOP_FILE } from "../const/config";
import type { CmdFn } from "../entities/CmdFn";
import type { GeneratorsConfig } from "../entities/Generators";
import { findConfig } from "../path/findConfig";
import { findPlopPath } from "../path/findPlopPath";
import { pathConstructor } from "../path/pathConstructor";
import { formatError } from "../utils/formatError";
import { logError, logger } from "../utils/logger";
import { cmdPlop } from "./utils/cmdPlop";
import { findArgs } from "./utils/findArgs";
import { findSkippedParams } from "./utils/findSkippedParams";
import { findGenerators, mergeGeneratorConfig } from "./utils/generators";

export const cmdNew: CmdFn = ({
	program,
	name,
	config,
	dir,
	defaultDir,
	stopSpinner,
}) => {
	program
		.command(name)
		.description("Create new single element by plop generator")
		.argument("[string...]", "Arguments for the generator")
		.option("--out <path>", "Path to generate files", process.cwd())
		.option("-f, --force", "force overwrites the existing file", false)
		.option("-t, --type-gen <path>", "choice type generators filter")
		.allowUnknownOption(true)
		.action(async (defaultArgs, { force, out: outPath, typeGen }, command) => {
			try {
				const configPath = findPlopPath({
					dir,
					defaultDir,
					namePlopFile: config.plop || PLOP_FILE,
				});
				const AllGeneratorsConfig = await findConfig<GeneratorsConfig>({
					dir,
					defaultDir,
					nameConfigFile: config.config || CONF_GENERATORS,
				});
				const generatorsConfig = mergeGeneratorConfig(AllGeneratorsConfig);
				const rawArgs = findSkippedParams(program, command);
				const args = findArgs(defaultArgs, rawArgs);
				stopSpinner();
				const generators = await findGenerators(generatorsConfig, typeGen);
				setGenerators(generators);
				const dest = await pathConstructor(outPath);
				await cmdPlop({ args, configPath, dest, force });
				process.exit(1);
			} catch (anyError) {
				logger("");
				const error = formatError(anyError);
				logError(error);
				process.exit(1);
			}
		});
};
